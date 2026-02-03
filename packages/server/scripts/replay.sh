#!/bin/bash
# rr Replay Script for Time-Travel Debugging
#
# Replays a recorded session with full time-travel debugging capabilities.
# You can step backwards, set watchpoints, and find the root cause of bugs.
#
# Usage:
#   ./scripts/replay.sh                    # List available recordings
#   ./scripts/replay.sh <session-name>     # Replay a specific session
#   ./scripts/replay.sh --latest           # Replay the most recent session
#
# Common rr commands:
#   continue (c)        - Continue execution
#   reverse-continue    - Continue backwards
#   step (s)            - Step forward
#   reverse-step        - Step backward
#   break <location>    - Set breakpoint
#   watch <expr>        - Watch expression, stop when it changes
#   when               - Show current position in trace
#   checkpoint         - Create a checkpoint to return to
#   restart <n>        - Go to checkpoint n
#   seek <n>           - Go to event n

set -e

RECORDINGS_DIR="${RR_TRACE_DIR:-./recordings}"

# Check if rr is available
if ! command -v rr &> /dev/null; then
    echo "Error: rr is not installed."
    echo "Install with: apt install rr  OR  nix-env -iA nixpkgs.rr"
    exit 1
fi

# List recordings if no argument
if [[ -z "$1" ]] || [[ "$1" == "--list" ]]; then
    echo "Available recordings in $RECORDINGS_DIR:"
    echo ""
    if [[ -d "$RECORDINGS_DIR" ]]; then
        ls -lt "$RECORDINGS_DIR" 2>/dev/null | grep "^d" | awk '{print "  " $NF}'
    else
        echo "  (no recordings found)"
    fi
    echo ""
    echo "Usage: $0 <session-name>"
    echo "       $0 --latest"
    exit 0
fi

# Get session name
if [[ "$1" == "--latest" ]]; then
    SESSION_NAME=$(ls -t "$RECORDINGS_DIR" 2>/dev/null | head -1)
    if [[ -z "$SESSION_NAME" ]]; then
        echo "Error: No recordings found in $RECORDINGS_DIR"
        exit 1
    fi
    echo "Using latest recording: $SESSION_NAME"
else
    SESSION_NAME="$1"
fi

TRACE_DIR="$RECORDINGS_DIR/$SESSION_NAME"

if [[ ! -d "$TRACE_DIR" ]]; then
    echo "Error: Recording not found: $TRACE_DIR"
    echo "Run $0 --list to see available recordings"
    exit 1
fi

echo "========================================"
echo "  rr Replay Session: $SESSION_NAME"
echo "========================================"
echo ""
echo "Useful commands:"
echo "  c / continue          - Run forward"
echo "  rc / reverse-continue - Run backward"
echo "  s / step              - Step forward"
echo "  rs / reverse-step     - Step backward"
echo "  bt / backtrace        - Show call stack"
echo "  watch <expr>          - Stop when value changes"
echo "  when                  - Show position in trace"
echo ""
echo "Starting replay..."
echo ""

# Start replay
rr replay "$TRACE_DIR"
