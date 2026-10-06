@echo off
:: Batch script to setup SkyStore domains and SSL certificate in Windows
:: Must be run as Administrator

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Please right-click this file and select "Run as administrator".
    echo [!] يرجى النقر بزر الفأرة الأيمن واختيار "تشغيل كمسؤول" (Run as administrator).
    echo.
    pause
    exit /b 1
)

echo ========================================================
echo   SkyStore Windows Setup: Hosts and SSL Certificate
echo ========================================================
echo.

:: 1. Add domains to hosts file
echo [1/2] Updating %windir%\System32\drivers\etc\hosts ...

findstr /i "app.skystore.local" "%windir%\System32\drivers\etc\hosts" >nul 2>&1
if %errorLevel% neq 0 (
    echo 127.0.0.1 app.skystore.local>>"%windir%\System32\drivers\etc\hosts"
    echo     + Added 127.0.0.1 app.skystore.local
) else (
    echo     = app.skystore.local already present
)

findstr /i "api.skystore.local" "%windir%\System32\drivers\etc\hosts" >nul 2>&1
if %errorLevel% neq 0 (
    echo 127.0.0.1 api.skystore.local>>"%windir%\System32\drivers\etc\hosts"
    echo     + Added 127.0.0.1 api.skystore.local
) else (
    echo     = api.skystore.local already present
)

findstr /i "auth.skystore.local" "%windir%\System32\drivers\etc\hosts" >nul 2>&1
if %errorLevel% neq 0 (
    echo 127.0.0.1 auth.skystore.local>>"%windir%\System32\drivers\etc\hosts"
    echo     + Added 127.0.0.1 auth.skystore.local
) else (
    echo     = auth.skystore.local already present
)

ipconfig /flushdns >nul 2>&1

:: 2. Import SSL certificate
echo.
echo [2/2] Importing skystore.crt into Trusted Root Certification Authorities...
if exist "%~dp0skystore.crt" (
    certutil -addstore -f Root "%~dp0skystore.crt"
    echo     [✓] SSL Certificate installed successfully!
) else (
    echo     [!] Warning: skystore.crt not found in current directory.
)

echo.
echo ========================================================
echo   [✓] Setup completed successfully!
echo   [✓] تم إعداد النطاقات وتثبيت الشهادة بنجاح.
echo ========================================================
echo.
pause
