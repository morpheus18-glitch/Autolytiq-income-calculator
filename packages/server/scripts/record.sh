#!/bin/bash
# rr Record Script for Time-Travel Debugging
#
# Records the server execution for later replay debugging.
# Only works on Linux with rr installed.
#
# Usage:
#   ./scripts/record.sh              # Record with default name
#   ./scripts/record.sh my-session   # Record with custom session name
#
# Requirements:
#   - Linux kernel 4.0+
#   - rr installed (apt install rr / nix-shell -p rr)
#   - Permissions to use perf_event_open

set -e

SESSION_NAME="${1:-autolytiq-$(date +%Y%m%d-%H%M%S)}"
RECORDINGS_DIR="${RR_TRACE_DIR:-./recordings}"

# Check if rr is available
if ! command -v rr &> /dev/null; then
    echo "Error: rr is not installed."
    echo "Install with: apt install rr  OR  nix-env -iA nixpkgs.rr"
    exit 1
fi

# Check if we're on Linux
if [[ "$(uname)" != "Linux" ]]; then
    echo "Error: rr only works on Linux."
    echo "For macOS/Windows, use standard debugging tools."
    exit 1
fi

# Check perf_event_paranoid setting
PARANOID=$(cat /proc/sys/kernel/perf_event_paranoid)
if [[ "$PARANOID" -gt 1 ]]; then
    echo "Warning: perf_event_paranoid is set to $PARANOID"
    echo "You may need to run: sudo sysctl kernel.perf_event_paranoid=1"
    echo "Or run rr with sudo (not recommended for production)"
fi

# Create recordings directory
mkdir -p "$RECORDINGS_DIR"

echo "========================================"
echo "  rr Recording Session: $SESSION_NAME"
echo "========================================"
echo ""
echo "Recording to: $RECORDINGS_DIR/$SESSION_NAME"
echo "Press Ctrl+C to stop recording"
echo ""

# Set up cleanup
cleanup() {
    echo ""
    echo "Recording stopped."
    echo "To replay, run: ./scripts/replay.sh $SESSION_NAME"
}
trap cleanup EXIT

# Start recording
cd "$(dirname "$0")/.."

RR_TRACE_DIR="$RECORDINGS_DIR" rr record \
    --output-trace-dir="$RECORDINGS_DIR/$SESSION_NAME" \
    --chaos \
    node dist/index.cjs

echo ""
echo "Recording saved to: $RECORDINGS_DIR/$SESSION_NAME"
echo "Replay with: ./scripts/replay.sh $SESSION_NAME"
