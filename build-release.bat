@echo off
cd android
echo Starting Gradle build...
call gradlew.bat assembleRelease --info
echo.
echo Build completed!
echo APK location: app\build\outputs\apk\release\
dir app\build\outputs\apk\release\*.apk
pause
