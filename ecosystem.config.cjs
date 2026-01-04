module.exports = {
  apps: [
    {
      name: "autolytiq",
      script: "dist/index.cjs",
      instances: "max", // Use all available CPU cores
      exec_mode: "cluster", // Enable cluster mode
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      // Auto-restart configuration
      max_memory_restart: "500M",
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: "10s",

      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Health monitoring
      exp_backoff_restart_delay: 100,
    },
  ],
};
