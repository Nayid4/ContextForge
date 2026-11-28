param(
    [ValidateSet("qa", "prod")]
    [string]$Environment = "qa",
    [string]$DeployRoot = "C:\inetpub\contextforge"
)

$ErrorActionPreference = "Stop"
Write-Host "[ContextForge Deploy] Iniciando despliegue para entorno: $Environment en $DeployRoot"

New-Item -ItemType Directory -Force -Path "$DeployRoot\data\database" | Out-Null
New-Item -ItemType Directory -Force -Path "$DeployRoot\data\storage\documents" | Out-Null
New-Item -ItemType Directory -Force -Path "$DeployRoot\data\storage\attachments" | Out-Null
New-Item -ItemType Directory -Force -Path "$DeployRoot\data\storage\bundles" | Out-Null

& "$DeployRoot\.venv\Scripts\python.exe" -m pip install --upgrade pip
& "$DeployRoot\.venv\Scripts\python.exe" -m pip install -r "$DeployRoot\requirements.txt"
& "$DeployRoot\.venv\Scripts\python.exe" -m mypy --strict "$DeployRoot\src\contextforge"

Write-Host "[ContextForge Deploy] Verificación completada exitosamente ($Environment)."
