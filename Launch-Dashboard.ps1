# Dashboard Launcher for God Mode (Flask Server)
# This script sets up a local Python server and database.

Write-Host "Restructuring Files for Flask..." -ForegroundColor Cyan
python restructure.py

Write-Host "Launching God-Mode Flask Server..." -ForegroundColor Cyan

# Ensure Python is installed
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python is not installed!" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/downloads/ to use this app."
    Pause
    exit
}

# Create virtual environment if it doesn't exist
if (!(Test-Path -Path "venv")) {
    Write-Host "Creating Python Virtual Environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating Virtual Environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Start server in current directory
Write-Host "Opening your dashboard at http://127.0.0.1:5000" -ForegroundColor Green
Start-Process "http://127.0.0.1:5000"

# Run Flask on port 5000
python app.py
