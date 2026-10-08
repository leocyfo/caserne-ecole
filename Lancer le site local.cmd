@echo off
rem Double-cliquez pour essayer le site sur cet ordinateur.
chcp 65001 >nul
cd /d "%~dp0"
start "" http://localhost:8080/demo.html
node outils\serveur-local.js 8080
pause
