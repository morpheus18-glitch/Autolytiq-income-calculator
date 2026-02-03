{
  description = "Autolytiq - Income Calculator Platform with Rust/WASM Core";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    crane = {
      url = "github:ipetkov/crane";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay, crane }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };

        # Rust toolchain with WASM target
        rustToolchain = pkgs.rust-bin.stable.latest.default.override {
          extensions = [ "rust-src" "rust-analyzer" "clippy" "rustfmt" ];
          targets = [ "wasm32-unknown-unknown" ];
        };

        # Crane for building Rust
        craneLib = (crane.mkLib pkgs).overrideToolchain rustToolchain;

        # Common dependencies for building
        commonBuildInputs = with pkgs; [
          openssl
          pkg-config
        ];

        # calc-core build
        calcCoreSrc = pkgs.lib.cleanSourceWith {
          src = ./packages/calc-core;
          filter = path: type:
            (pkgs.lib.hasSuffix ".rs" path) ||
            (pkgs.lib.hasSuffix ".toml" path) ||
            (pkgs.lib.hasSuffix ".lock" path) ||
            (type == "directory");
        };

        calcCore = craneLib.buildPackage {
          src = calcCoreSrc;
          cargoExtraArgs = "--package calc-core";
          buildInputs = commonBuildInputs;
        };

        # WASM build
        calcWasmSrc = pkgs.lib.cleanSourceWith {
          src = ./.;
          filter = path: type:
            (pkgs.lib.hasInfix "packages/calc-core" path) ||
            (pkgs.lib.hasInfix "packages/calc-wasm" path) ||
            (type == "directory");
        };

        calcWasm = pkgs.stdenv.mkDerivation {
          name = "calc-wasm";
          src = calcWasmSrc;

          nativeBuildInputs = with pkgs; [
            rustToolchain
            wasm-pack
            wasm-bindgen-cli
            binaryen # wasm-opt
          ];

          buildPhase = ''
            export HOME=$TMPDIR
            cd packages/calc-wasm
            wasm-pack build --target web --out-dir pkg
          '';

          installPhase = ''
            mkdir -p $out
            cp -r packages/calc-wasm/pkg $out/
          '';
        };

        # Node.js build
        nodeBuild = pkgs.buildNpmPackage {
          name = "autolytiq-web";
          src = ./.;
          npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="; # Update after first build

          nativeBuildInputs = with pkgs; [
            nodejs_20
            pnpm
          ];

          buildPhase = ''
            pnpm install --frozen-lockfile
            pnpm build:web
            pnpm build:server
          '';

          installPhase = ''
            mkdir -p $out
            cp -r dist $out/
            cp -r node_modules $out/
            cp package.json $out/
          '';
        };

        # Docker image
        dockerImage = pkgs.dockerTools.buildLayeredImage {
          name = "autolytiq";
          tag = "latest";

          contents = with pkgs; [
            nodejs_20
            coreutils
            bash
          ];

          config = {
            Cmd = [ "${pkgs.nodejs_20}/bin/node" "/app/dist/index.cjs" ];
            WorkingDir = "/app";
            Env = [
              "NODE_ENV=production"
              "PORT=5000"
            ];
            ExposedPorts = {
              "5000/tcp" = {};
            };
          };

          extraCommands = ''
            mkdir -p app
            cp -r ${nodeBuild}/* app/
          '';
        };

      in
      {
        # Development shell
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Rust
            rustToolchain
            wasm-pack
            wasm-bindgen-cli
            binaryen
            cargo-watch
            cargo-expand
            cargo-audit

            # Node.js
            nodejs_20
            pnpm
            nodePackages.typescript
            nodePackages.typescript-language-server

            # Database
            postgresql_15
            redis

            # Debugging
            rr

            # Observability
            opentelemetry-cpp
            jaeger

            # General tools
            git
            jq
            curl
            httpie
            watchexec

            # Linting and formatting
            rustfmt
            clippy
            nodePackages.prettier
            nodePackages.eslint
          ];

          shellHook = ''
            echo ""
            echo "🚀 Autolytiq Development Environment"
            echo "===================================="
            echo ""
            echo "Available commands:"
            echo "  pnpm dev          - Start development servers"
            echo "  pnpm build        - Build all packages"
            echo "  pnpm test         - Run all tests"
            echo "  pnpm test:rust    - Run Rust tests"
            echo "  pnpm test:js      - Run JavaScript tests"
            echo ""
            echo "Rust/WASM:"
            echo "  cd packages/calc-core && cargo test"
            echo "  cd packages/calc-wasm && wasm-pack build"
            echo ""
            echo "Debugging:"
            echo "  ./packages/server/scripts/record.sh  - Record with rr"
            echo "  ./packages/server/scripts/replay.sh  - Replay with rr"
            echo ""
            export RUST_BACKTRACE=1
            export WASM_ENABLED=true
          '';

          # Environment variables
          RUST_SRC_PATH = "${rustToolchain}/lib/rustlib/src/rust/library";
        };

        # Packages
        packages = {
          calc-core = calcCore;
          calc-wasm = calcWasm;
          docker = dockerImage;
          default = calcWasm;
        };

        # Apps
        apps = {
          dev = {
            type = "app";
            program = "${pkgs.writeShellScriptBin "dev" ''
              cd ${./.}
              ${pkgs.pnpm}/bin/pnpm dev
            ''}/bin/dev";
          };
        };

        # Checks (run with `nix flake check`)
        checks = {
          # Rust tests
          calc-core-tests = craneLib.cargoTest {
            src = calcCoreSrc;
            cargoExtraArgs = "--package calc-core";
          };

          # Clippy lints
          calc-core-clippy = craneLib.cargoClippy {
            src = calcCoreSrc;
            cargoExtraArgs = "--package calc-core";
            cargoClippyExtraArgs = "-- -D warnings";
          };

          # Formatting check
          calc-core-fmt = craneLib.cargoFmt {
            src = calcCoreSrc;
          };

          # WASM build check
          calc-wasm-build = calcWasm;
        };
      }
    );
}
