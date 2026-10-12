@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\axolotl\one-click-release.ps1" %*
echo.
pause
