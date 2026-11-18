@echo off
title Blockchain E-Voting System
echo ==========================================================
echo Starting Blockchain E-Voting System (Django 5 + ECDSA)
echo ==========================================================

REM Detect python
if exist "%~dp0venv\Scripts\python.exe" (
    set PY="%~dp0venv\Scripts\python.exe"
) else if exist "venv\Scripts\python.exe" (
    set PY="venv\Scripts\python.exe"
) else if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set PY="%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
) else if exist "%LOCALAPPDATA%\Programs\Thonny\python.exe" (
    set PY="%LOCALAPPDATA%\Programs\Thonny\python.exe"
) else (
    where python >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set PY=python
    ) else (
        where py >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            set PY=py
        ) else (
            if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
                set PY="%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
            ) else (
                echo [ERROR] Python not found. Please install Python 3.9+ or add it to PATH.
                pause
                exit /b 1
            )
        )
    )
)

echo Using Python: %PY%
echo Running system checks and database migrations...
%PY% manage.py migrate
echo.
echo Starting development server at http://127.0.0.1:8000 ...
echo Admin credentials: username 'admin' / password 'admin123'
echo Press Ctrl+C to terminate.
echo ==========================================================
%PY% manage.py runserver 127.0.0.1:8000
pause
