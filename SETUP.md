# Finger Strain Detector - Quick Start Scripts

## Windows Setup
```batch
@echo off
echo Setting up Finger Strain Detector...

echo.
echo Installing frontend dependencies...
cd frontend
npm install
if errorlevel 1 (
    echo Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Building frontend...
npm run build
if errorlevel 1 (
    echo Failed to build frontend!
    pause
    exit /b 1
)

echo.
echo Setup complete! 
echo.
echo Next steps:
echo 1. Upload firmware/finger_strain_detector.ino to your LilyPad Arduino
echo 2. Run 'npm run dev' in the frontend directory
echo 3. Open http://localhost:3000 in your browser
echo.
pause
```

## Linux/macOS Setup
```bash
#!/bin/bash
echo "Setting up Finger Strain Detector..."

echo "Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies!"
    exit 1
fi

echo "Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Failed to build frontend!"
    exit 1
fi

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Upload firmware/finger_strain_detector.ino to your LilyPad Arduino"
echo "2. Run 'npm run dev' in the frontend directory"
echo "3. Open http://localhost:3000 in your browser"
```

## Arduino IDE Setup

### Required Libraries
- ArduinoJson (version 6.21.0 or later)

### Installation Steps
1. Open Arduino IDE
2. Go to Tools > Manage Libraries
3. Search for "ArduinoJson" and install
4. Open firmware/finger_strain_detector.ino
5. Select Tools > Board > LilyPad Arduino USB
6. Select the correct COM port
7. Click Upload

### Troubleshooting
- If upload fails, check that the LilyPad is properly connected
- Ensure you have the correct drivers installed
- Try pressing the reset button on the LilyPad before upload