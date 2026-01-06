@echo off

set VENV_DIR=.venv

if not exist %VENV_DIR% (
    echo Creating virtual environment...
    python -m venv %VENV_DIR%
)

call %VENV_DIR%\Scripts\activate.bat

if exist requirements.txt (
    echo Installing dependencies...
    pip install -q -r requirements.txt
)

echo Starting Focus Timer...
python focus.pyw
