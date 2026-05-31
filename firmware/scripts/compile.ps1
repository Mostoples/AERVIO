# AERVINEX firmware - compile (Windows PowerShell)
param(
    [string]$Fqbn = "esp32:esp32:esp32"
)
$ErrorActionPreference = "Stop"
$scriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$firmwareDir = Resolve-Path (Join-Path $scriptDir "..")
$sketchDir   = Join-Path $firmwareDir "aervinex-sensor"
$buildDir    = Join-Path $firmwareDir "build"

if (-not (Test-Path (Join-Path $sketchDir "secrets.h"))) {
    Write-Error "secrets.h missing in $sketchDir - copy secrets_example.h to secrets.h"
}

Write-Host ">> compiling $sketchDir for $Fqbn"
& arduino-cli compile `
    --fqbn $Fqbn `
    --warnings default `
    --build-path $buildDir `
    $sketchDir
if ($LASTEXITCODE -ne 0) { throw "compile failed (exit $LASTEXITCODE)" }
Write-Host ">> binary at: $buildDir\aervinex-sensor.ino.bin"
