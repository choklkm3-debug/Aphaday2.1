@echo off
REM Aphaday 2.0 - Launcher (App Nativo Windows)
REM Este arquivo abre a aplicacao como um programa desktop

cd /d "%~dp0"
start "Aphaday 2.0" "Aphaday.hta"
exit
chcp 65001 >nul
title Aphaday - App Desktop
color 0A

echo.
echo  ═════════════════════════════════
echo     Aphaday - App Desktop
echo  ═════════════════════════════════
echo.

REM Obter diretório do script
cd /d "%~dp0"

REM Inicia servidor PowerShell
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
