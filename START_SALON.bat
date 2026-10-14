@echo off
chcp 65001 >nul
title WEBSITE SALON TOC - LUXE HAIR STUDIO
cd /d "%~dp0"

:: Tu dong tat tiến trình cu dang chiem cong 3005 (neu co) de nap code moi nhat
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3005" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

if not exist "node_modules" (
    echo [1/2] Dang cai dat thu vien Node.js...
    call npm install
)

echo [2/2] Dang khoi dong Website Salon Toc tai http://localhost:3005 ...
echo - Trang Khach Hang:   http://localhost:3005
echo - Ban Quan Tri Admin: http://localhost:3005/admin (Mat khau mac dinh: 123456)
start "" "http://localhost:3005"
start "" "http://localhost:3005/admin"
node server.js
pause
