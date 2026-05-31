# =============================================================================
#  AERVINEX firmware - environment setup (Windows PowerShell)
# -----------------------------------------------------------------------------
#  Installs arduino-cli (if missing) into  %LOCALAPPDATA%\Programs\arduino-cli,
#  installs the ESP32 core, and every library listed in
#  firmware/library_dependencies.txt.
# =============================================================================
$ErrorActionPreference = "Stop"

$scriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$firmwareDir = Resolve-Path (Join-Path $scriptDir "..")
$depsFile    = Join-Path $firmwareDir "library_dependencies.txt"

Write-Host ">> AERVINEX firmware setup"
Write-Host ">> firmware dir : $firmwareDir"

# ---------- arduino-cli ----------
$cli = Get-Command arduino-cli -ErrorAction SilentlyContinue
if (-not $cli) {
    Write-Host ">> arduino-cli not found, installing"
    $installDir = Join-Path $env:LOCALAPPDATA "Programs\arduino-cli"
    New-Item -ItemType Directory -Force $installDir | Out-Null
    $zip = Join-Path $env:TEMP "arduino-cli.zip"
    Invoke-WebRequest -UseBasicParsing `
        "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip" `
        -OutFile $zip
    Expand-Archive -Force $zip $installDir
    Remove-Item $zip
    $env:Path = "$installDir;$env:Path"
    Write-Host ">> arduino-cli installed at $installDir"
    Write-Host ">> Add it to your PATH permanently:"
    Write-Host "   setx PATH `"$installDir;`$env:PATH`""
}
else {
    Write-Host ">> arduino-cli already present: $(& arduino-cli version)"
}

# ---------- config + ESP32 core ----------
& arduino-cli config init --overwrite | Out-Null
& arduino-cli config add board_manager.additional_urls `
    "https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json"
& arduino-cli core update-index
& arduino-cli core install esp32:esp32

# ---------- libraries ----------
Write-Host ">> installing libraries from $depsFile"
Get-Content $depsFile | ForEach-Object {
    $line = ($_ -split '#', 2)[0].Trim()
    if (-not $line) { return }
    Write-Host "   - $line"
    & arduino-cli lib install $line
}

Write-Host ">> done. Try:  .\firmware\scripts\compile.ps1"
