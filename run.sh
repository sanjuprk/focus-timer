#!/bin/bash

# Change to the script's directory
cd "$(dirname "$0")"

# Define environment directory
VENV_DIR=".venv"

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Install dependencies
if [ -f "requirements.txt" ]; then
    echo "Installing dependencies..."
    pip3 install -q -r requirements.txt
fi

# Run the application
echo "Starting Focus Timer..."
python3 focus.pyw
