#!/usr/bin/env bash
# AERVINEX firmware - flash (Linux/macOS/WSL/Git Bash)
# usage:  flash.sh /dev/ttyUSB0   [esp32:esp32:esp32]
set -euo pipefail
PORT="${1:-}"
FQBN="${2:-${FQBN:-esp32:esp32:esp32}}"
if [ -z "$PORT" ]; then
  echo "usage: $0 <serial-port> [fqbn]"
  echo "available ports:"
  arduino-cli board list || true
  exit 1
fi
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FIRMWARE_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
SKETCH_DIR="$FIRMWARE_DIR/aervinex-sensor"

echo ">> flashing $SKETCH_DIR -> $PORT  ($FQBN)"
arduino-cli upload -p "$PORT" --fqbn "$FQBN" \
  --input-dir "$FIRMWARE_DIR/build" \
  "$SKETCH_DIR"
echo ">> done"
