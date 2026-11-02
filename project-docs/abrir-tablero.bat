@echo off
title Tablero de Seguimiento de IA - Antigravity Harness
echo ========================================================
echo   Iniciando Tablero de Seguimiento de IA (project-docs)
echo ========================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Iniciando con Python HTTP Server en http://localhost:8080 ...
    start http://localhost:8080/project-docs/
    cd ..
    python -m http.server 8080
    goto end
)

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Abriendo tablero directamente en el navegador...
    start index.html
    goto end
)

echo Abriendo directamente en el navegador por defecto...
start index.html

:end
