@echo off
REM Script to copy VRM pet models from 2D Phettagotchi game to 3D game (Windows)
REM Run this after git pull to set up the battle system assets

echo 🐾 Copying VRM pet models for battle system...
echo.

REM Source directory (2D game VRM files)
set "SOURCE_DIR=%USERPROFILE%\OneDrive\Documents\PhettaverseMint3d\pet\public\vrm"

REM Destination directory (3D game assets)
set "DEST_DIR=%~dp0front\public\assets\pets"

REM Create destination directory if it doesn't exist
if not exist "%DEST_DIR%" mkdir "%DEST_DIR%"

REM List of VRM files needed for battle system
set FILES=alienfella_1.vrm blufella_1.vrm lovebug_1.vrm meep_1.vrm pizzalotl_1.vrm redfox_1.vrm sparky_1.vrm

set COPIED=0
set MISSING=0

for %%f in (%FILES%) do (
  if exist "%SOURCE_DIR%\%%f" (
    copy "%SOURCE_DIR%\%%f" "%DEST_DIR%\" >nul
    if !errorlevel! equ 0 (
      echo ✅ Copied: %%f
      set /a COPIED+=1
    ) else (
      echo ❌ Failed to copy: %%f
      set /a MISSING+=1
    )
  ) else (
    echo ⚠️  Not found: %%f (skipping)
    set /a MISSING+=1
  )
)

echo.
echo 📊 Summary:
echo    ✅ Copied: %COPIED% files
echo    ⚠️  Missing: %MISSING% files
echo.

if %COPIED% gtr 0 (
  echo 🎮 VRM models ready!
  echo.
  echo Next steps:
  echo   1. cd back ^&^& npm run build
  echo   2. npm start
  echo   3. Navigate to http://localhost:4000/play/battle
) else (
  echo ⚠️  No VRM files were copied. Check the SOURCE_DIR path:
  echo    %SOURCE_DIR%
  echo.
  echo You may need to update the SOURCE_DIR variable in this script
  echo to match your system's path to the 2D game VRM files.
)

pause
