@echo off
chcp 65001 >nul
title Trien Khai Website Salon Toc Len Vercel 24/24
cd /d "%~dp0"
echo ===================================================================
echo   💇‍♀️ WEBSITE SALON TOC - CAP NHAT GITHUB ^& DEPLOY VERCEL 24/24
echo ===================================================================
echo.
git add .
git commit -m "Cap nhat du lieu Website Salon Toc" >nul 2>&1
git push origin main >nul 2>&1
npx -y vercel --prod --yes
echo.
echo ===================================================================
echo Hoan tat! Nhan phim bat ky de dong cua so.
pause >nul
