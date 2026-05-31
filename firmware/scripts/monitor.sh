#!/usr/bin/env bash
# AERVINEX firmware - serial monitor
# usage:  monitor.sh /dev/ttyUSB0
set -euo pipefail
PORT="${1:-}"
if [ -z "$PORT" ]; then
  echo "usage: $0 <serial-port>"
  arduino-cli board list || true
  exit 1
fi
exec arduino-cli monitor -p "$PORT" -c baudrate=115200
