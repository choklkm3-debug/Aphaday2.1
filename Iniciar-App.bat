@echo off
REM Inicia servidor em background e abre navegador

cd /d "%~dp0"

REM Inicia servidor PowerShell em background
powershell -ExecutionPolicy Bypass -File ".\server.ps1" >nul 2>&1 &

REM Aguarda 2 segundos para servidor iniciar
timeout /t 2 /nobreak >nul

REM Abre navegador no app
start http://localhost:8080

REM Mantém a janela aberta
echo.
echo ✓ Aphaday iniciado!
echo.
echo Se o navegador não abrir, acesse: http://localhost:8080
echo.
pause
