# AERVINEX firmware - serial monitor (Windows PowerShell)
# usage:  .\monitor.ps1 -Port COM3
param(
    [Parameter(Mandatory = $true)] [string]$Port
)
$ErrorActionPreference = "Stop"
& arduino-cli monitor -p $Port -c "baudrate=115200"
