# AERVINEX firmware - flash (Windows PowerShell)
# usage:  .\flash.ps1 -Port COM3  [-Fqbn esp32:esp32:esp32s3]
param(
    [Parameter(Mandatory = $true)] [string]$Port,
    [string]$Fqbn = "esp32:esp32:esp32"
)
$ErrorActionPreference = "Stop"
$scriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$firmwareDir = Resolve-Path (Join-Path $scriptDir "..")
$sketchDir   = Join-Path $firmwareDir "aervinex-sensor"
$buildDir    = Join-Path $firmwareDir "build"

Write-Host ">> flashing $sketchDir -> $Port ($Fqbn)"
& arduino-cli upload -p $Port --fqbn $Fqbn --input-dir $buildDir $sketchDir
if ($LASTEXITCODE -ne 0) { throw "upload failed (exit $LASTEXITCODE)" }
Write-Host ">> done"
