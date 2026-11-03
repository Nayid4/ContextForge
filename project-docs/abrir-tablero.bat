@echo off
title Tablero de Seguimiento de IA - Antigravity Harness
echo ========================================================
echo   Iniciando Tablero de Seguimiento de IA (project-docs)
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js detectado. Iniciando servidor local en vivo con Auto-Sync...
    node "%~dp0serve.js"
    goto end
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python detectado. Iniciando con Python HTTP Server en http://localhost:8080 ...
    start http://localhost:8080/project-docs/
    cd "%~dp0.."
    python -m http.server 8080
    goto end
)

echo [AVISO] Ni Node.js ni Python fueron detectados en PATH.
echo Abriendo directamente en el navegador (modo local file:///)...
start "" "%~dp0index.html"

:end
