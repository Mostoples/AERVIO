#!/usr/bin/env bash
# =============================================================================
#  AERVINEX firmware - environment setup (Linux / macOS / WSL / Git Bash)
# -----------------------------------------------------------------------------
#  Installs arduino-cli (if missing), the ESP32 core, and every Arduino
#  library the sketch needs. Library versions are pinned in
#  firmware/library_dependencies.txt.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FIRMWARE_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
DEPS_FILE="$FIRMWARE_DIR/library_dependencies.txt"

echo ">> AERVINEX firmware setup"
echo ">> firmware dir : $FIRMWARE_DIR"

# ---------- arduino-cli ----------
if ! command -v arduino-cli >/dev/null 2>&1; then
  echo ">> arduino-cli not found, installing to ~/.local/bin"
  mkdir -p "$HOME/.local/bin"
  case "$(uname -s)" in
    Linux*)  TARBALL="arduino-cli_latest_Linux_64bit.tar.gz" ;;
    Darwin*) TARBALL="arduino-cli_latest_macOS_64bit.tar.gz" ;;
    MINGW*|MSYS*|CYGWIN*)
      echo "!! On Git Bash for Windows please run setup.ps1 instead."
      exit 1 ;;
    *) echo "!! Unsupported OS: $(uname -s)"; exit 1 ;;
  esac
  TMP="$(mktemp -d)"
  curl -fsSL "https://downloads.arduino.cc/arduino-cli/${TARBALL}" -o "$TMP/${TARBALL}"
  tar -xzf "$TMP/${TARBALL}" -C "$TMP"
  mv "$TMP/arduino-cli" "$HOME/.local/bin/"
  chmod +x "$HOME/.local/bin/arduino-cli"
  export PATH="$HOME/.local/bin:$PATH"
  echo ">> arduino-cli installed: $(arduino-cli version)"
else
  echo ">> arduino-cli already present: $(arduino-cli version)"
fi

# ---------- config + ESP32 core ----------
arduino-cli config init --overwrite >/dev/null
arduino-cli config add board_manager.additional_urls \
  "https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json"
arduino-cli core update-index
arduino-cli core install esp32:esp32

# ---------- libraries ----------
echo ">> installing libraries from $DEPS_FILE"
while IFS= read -r line; do
  line="${line%%#*}"                # strip comments
  line="$(echo "$line" | xargs || true)"   # trim
  [ -z "$line" ] && continue
  echo "   - $line"
  arduino-cli lib install "$line"
done < "$DEPS_FILE"

echo ">> done. Try:  bash firmware/scripts/compile.sh"
