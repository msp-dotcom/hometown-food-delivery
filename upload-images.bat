@echo off
REM ============================================================
REM Bulk uploads every image in a local folder to your Supabase
REM Storage "menu-images" bucket, so they show up in Admin's
REM "Choose existing" image library.
REM
REM BEFORE RUNNING:
REM   1. Put this file inside your project folder (Desktop\food)
REM   2. Create a folder called "food-images" in that same place
REM      and put all your photos in it — name each file the way
REM      you want it labeled, e.g. chicken-biryani.jpg,
REM      paneer-masala.jpg, cold-milk.jpg
REM   3. Fill in your Supabase URL and anon key below (same ones
REM      already in your .env file)
REM ============================================================

set SUPABASE_URL=https://inkcctmtyponqsjkhwze.supabase.co
set ANON_KEY=sb_publishable_Ldkt4gcGBgQk9X5wRtYDpQ_EjghyVra
set FOLDER=food-images

echo Uploading images from %FOLDER% to Supabase Storage...
echo.

for %%f in (%FOLDER%\*.*) do (
    echo Uploading: %%~nxf
    curl -s -X POST "%SUPABASE_URL%/storage/v1/object/menu-images/%%~nxf" ^
        -H "Authorization: Bearer %ANON_KEY%" ^
        -H "apikey: %ANON_KEY%" ^
        -H "Content-Type: image/jpeg" ^
        --data-binary "@%FOLDER%\%%~nxf"
    echo.
)

echo.
echo Done! Go to Admin, click "Choose existing" on any Add/Edit item form
echo to see all uploaded images.
pause
