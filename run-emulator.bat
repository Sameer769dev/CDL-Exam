@echo off
echo ========================================
echo   CDL Exam App - Emulator Launcher
echo ========================================
echo.

REM Set Android SDK paths
set ANDROID_HOME=C:\Users\dhana\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=C:\Users\dhana\AppData\Local\Android\Sdk

echo Checking for running emulators...
adb devices

echo.
echo Starting app on emulator...
echo.
echo This will:
echo  1. Start the emulator (if not running)
echo  2. Build and install the app
echo  3. Launch the app with hot reload
echo.

cd /d "%~dp0"
npx expo run:android

pause
