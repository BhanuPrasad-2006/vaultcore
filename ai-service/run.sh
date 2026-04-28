#!/bin/bash
set -e

echo "Starting AI Service..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "Running application..."
gunicorn --bind 0.0.0.0:5000 --workers 4 main:app
