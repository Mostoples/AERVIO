#!/usr/bin/env bash
# AERVINEX firmware - compile (Linux/macOS/WSL/Git Bash)
set -euo pipefail
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FIRMWARE_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
SKETCH_DIR="$FIRMWARE_DIR/aervinex-sensor"
FQBN="${FQBN:-esp32:esp32:esp32}"   # override with FQBN=esp32:esp32:esp32s3 ./compile.sh

if [ ! -f "$SKETCH_DIR/secrets.h" ]; then
  echo "!! $SKETCH_DIR/secrets.h missing -> copy secrets_example.h to secrets.h"
  exit 1
fi

echo ">> compiling $SKETCH_DIR for $FQBN"
arduino-cli compile \
  --fqbn "$FQBN" \
  --warnings default \
  --build-path "$FIRMWARE_DIR/build" \
  "$SKETCH_DIR"
echo ">> binary at: $FIRMWARE_DIR/build/aervinex-sensor.ino.bin"
