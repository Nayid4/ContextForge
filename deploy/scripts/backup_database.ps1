param(
    [string]$DbProvider = "sqlite",
    [string]$SqlitePath = ".\data\database\contextforge.db",
    [string]$BackupDir = ".\data\backups"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$Timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")

if ($DbProvider -eq "sqlite") {
    if (Test-Path $SqlitePath) {
        $Target = Join-Path $BackupDir "contextforge_$Timestamp.db"
        Copy-Item -Path $SqlitePath -Destination $Target -Force
        Write-Host "[Backup OK] Respaldo SQLite creado en $Target"
    } else {
        Write-Host "[Backup SKIP] Archivo SQLite no encontrado en $SqlitePath"
    }
} elseif ($DbProvider -eq "postgresql") {
    $Target = Join-Path $BackupDir "contextforge_pg_$Timestamp.sql"
    pg_dump $env:DATABASE_URL_SYNC > $Target
    Write-Host "[Backup OK] Respaldo PostgreSQL creado en $Target"
}
