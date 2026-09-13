@echo off
setlocal

rem ===================================================================
rem  SUVSANOAT: build + commit + push.
rem  Only ASCII here: cmd.exe breaks on UTF-8 russian text in .bat
rem ===================================================================

cd /d "%~dp0"

set "MSG=%*"
if "%MSG%"=="" set "MSG=Obnovlenie sayta"

echo.
echo ============================================================
echo  STEP 1 of 3 - BUILD  (sborka, 1-2 min)
echo ============================================================
call npm.cmd run build
if errorlevel 1 goto buildfail

echo.
echo ============================================================
echo  STEP 2 of 3 - COMMIT
echo ============================================================
git add -A
git commit -m "%MSG%"

echo.
echo ============================================================
echo  STEP 3 of 3 - PUSH
echo ============================================================
git push
if errorlevel 1 goto pushfail

echo.
echo ============================================================
echo  OK - GOTOVO. Vercel nachnet deploy sam.
echo ============================================================
echo.
pause
exit /b 0

:buildfail
echo.
echo ############################################################
echo  BUILD FAILED - nichego ne otpravleno.
echo  Smotrite stroki vyshe: tam napisan fayl s oshibkoy.
echo ############################################################
echo.
pause
exit /b 1

:pushfail
echo.
echo ############################################################
echo  PUSH FAILED - sborka proshla, no na GitHub ne ushlo.
echo ############################################################
echo.
pause
exit /b 1
