# Wearable Finger Strain Detector

A comprehensive wearable health monitoring system built with LilyPad Arduino that detects finger strain and provides real-time feedback to prevent repetitive strain injuries (RSI). The system combines multiple sensors with an intelligent monitoring dashboard to track finger movement patterns, posture, and provide personalized health recommendations.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-green)
![Arduino](https://img.shields.io/badge/Arduino-LilyPad-blue)
![React](https://img.shields.io/badge/React-18.0+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)

## 🎯 Features

### Hardware Monitoring
- **Multi-sensor integration**: Flex, tilt, accelerometer, hall effect, and motion sensors
- **Real-time strain detection** with customizable thresholds
- **Buzzer alerts** for overuse prevention
- **Automatic sensor calibration** routines
- **Low-power wearable design** optimized for LilyPad Arduino

### Data Processing
- **JSON/CSV data output** via Serial communication
- **Intelligent strain algorithms** combining multiple sensor inputs
- **Posture scoring system** based on hand/wrist positioning
- **Overuse detection** with time-based analysis
- **Data normalization** for consistent readings

### Dashboard & Visualization
- **Real-time monitoring** with live sensor data
- **Interactive strain graphs** showing trends over time
- **Strain level heatmap** visualization
- **Posture monitoring** with scoring system
- **Smart alerts** with priority levels
- **Personalized health advice** based on strain patterns
- **Data export** functionality (CSV format)
- **Responsive design** for desktop and mobile

## 🔧 Hardware Requirements

### LilyPad Components
- 1x LilyPad Arduino USB (or LilyPad Simple)
- 1x Flex Sensor (4.5" or 2.2")
- 1x Tilt Sensor (SW-200D)
- 1x LilyPad Accelerometer (ADXL335)
- 1x Hall Effect Sensor (A1324LUA-T)
- 1x Motion Sensor (LilyPad PIR)
- 1x LilyPad Buzzer
- 1x LilyPad LED
- 1x 10kΩ resistor (for flex sensor)

### Additional Materials
- Conductive thread
- Fabric base (glove or wristband)
- Sewing needle
- Small magnets (for hall sensor testing)

## 🚀 Quick Start

### 1. Hardware Assembly

Refer to [`/firmware/HARDWARE_GUIDE.md`](./firmware/HARDWARE_GUIDE.md) for detailed assembly instructions.

**Basic Pin Configuration:**
```
Pin A0  - Flex Sensor (with 10kΩ pull-down)
Pin A1  - Accelerometer X-axis
Pin A2  - Accelerometer Y-axis  
Pin A3  - Accelerometer Z-axis
Pin A4  - Hall Effect Sensor
Pin 2   - Tilt Sensor
Pin 3   - Motion Sensor (PIR)
Pin 4   - Buzzer
Pin 5   - Status LED
```

### 2. Firmware Upload

1. **Install Arduino IDE** with LilyPad Arduino support
2. **Install required libraries:**
   ```bash
   # In Arduino IDE Library Manager:
   - ArduinoJson (v6.21.0+)
   ```

3. **Upload firmware:**
   ```bash
   # Open firmware/finger_strain_detector.ino in Arduino IDE
   # Select: Tools > Board > LilyPad Arduino USB
   # Select correct COM port
   # Click Upload
   ```

4. **Test connection:**
   ```bash
   # Open Serial Monitor (9600 baud)
   # Should see initialization message
   # Send "STATUS" command to verify functionality
   ```

### 3. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open dashboard:**
   ```
   http://localhost:3000
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

## 📊 Usage

### Device Operation

1. **Power on** the LilyPad Arduino
2. **Wait for calibration** (LED indicator)
3. **Wear the device** comfortably on your hand/wrist
4. **Connect to dashboard** using the Connect button

### Dashboard Features

#### Real-time Monitoring
- **Strain Meter**: Current and average strain levels
- **Sensor Panel**: Live readings from all sensors
- **Activity Charts**: Trend graphs for strain and flex activity

#### Alert System
- **Color-coded alerts**: Info (blue), Warning (yellow), Danger (red)
- **Smart notifications**: Strain level, posture, and overuse alerts
- **Alert history**: Track patterns over time

#### Health Recommendations
- **Dynamic advice**: Personalized based on current strain level
- **Exercise suggestions**: Targeted exercises for strain relief
- **Break reminders**: Smart timing based on usage patterns

#### Data Management
- **Export functionality**: CSV format for analysis
- **Historical data**: Automatic data retention
- **Calibration tools**: Built-in sensor calibration

### Serial Commands

Connect via Serial Monitor (9600 baud) and use these commands:

```
JSON        - Switch to JSON output format
CSV         - Switch to CSV output format
CALIBRATE   - Start sensor calibration routine
STATUS      - Show current device status
```

## 🔬 Technical Details

### Strain Calculation Algorithm

The strain level is calculated using a weighted combination of sensor inputs:

```cpp
strain = (flex_factor * 40%) + (motion_factor * 30%) + 
         (tilt_penalty * 20%) + (activity_bonus * 10%)
```

- **Flex Factor**: Finger bend percentage (0-100%)
- **Motion Factor**: Accelerometer activity level
- **Tilt Penalty**: Added when wrist is in poor position
- **Activity Bonus**: Continuous motion detection

### Data Format

#### JSON Output
```json
{
  "timestamp": 1640995200000,
  "flex_sensor": 45.2,
  "tilt_state": false,
  "accelerometer": {"x": 12, "y": -8, "z": 95},
  "hall_sensor": 512,
  "motion_detected": true,
  "strain_level": 32,
  "alert_active": false,
  "overuse_detected": false
}
```

#### CSV Output
```csv
timestamp,flex,tilt,accel_x,accel_y,accel_z,hall,motion,strain,alert,overuse
1640995200000,45.2,0,12,-8,95,512,1,32,0,0
```

## 🎨 Customization

### Strain Thresholds

Modify these values in the Arduino firmware:

```cpp
const int STRAIN_THRESHOLD = 80;     // Alert trigger (%)
const long OVERUSE_TIME = 30000;    // Overuse detection (ms)
const long ALERT_INTERVAL = 5000;   // Alert frequency (ms)
```

### Dashboard Themes

The frontend supports light/dark themes and can be customized via CSS variables:

```css
:root {
  --primary-color: #646cff;
  --warning-color: #fbbf24;
  --danger-color: #f87171;
  --success-color: #4ade80;
}
```

### Sensor Sensitivity

Adjust sensor ranges during calibration or modify these firmware constants:

```cpp
// Flex sensor calibration values
int flexMin = 200;  // Straight position
int flexMax = 800;  // Fully bent position
```

## 📈 Health Guidelines

### Strain Level Interpretation

- **0-25%**: ✅ **Optimal** - Continue current practices
- **26-50%**: ⚠️ **Moderate** - Take preventive measures
- **51-75%**: 🔶 **High** - Immediate action required
- **76-100%**: 🚨 **Severe** - Stop activity and rest

### Recommended Break Schedule

| Strain Level | Break Frequency | Break Duration |
|--------------|----------------|----------------|
| 0-25%        | Every 60 min   | 2-3 min        |
| 26-50%       | Every 30 min   | 5 min          |
| 51-75%       | Every 15 min   | 10 min         |
| 76-100%      | Immediate      | 15-20 min      |

## 🛠️ Troubleshooting

### Common Issues

**No serial output:**
- Check USB connection
- Verify baud rate (9600)
- Ensure correct COM port selection

**Inaccurate readings:**
- Run calibration routine (`CALIBRATE` command)
- Check sensor connections
- Verify power supply stability

**Dashboard not connecting:**
- Ensure device is connected to computer
- Check browser console for errors
- Verify Serial port permissions

**False alerts:**
- Adjust `STRAIN_THRESHOLD` in firmware
- Re-calibrate sensors
- Check for electromagnetic interference

### Sensor-Specific Issues

**Flex Sensor:**
- Ensure proper resistor connection (10kΩ)
- Check for physical damage
- Recalibrate range if readings seem off

**Accelerometer:**
- Verify 3.3V power supply
- Check all three axis connections
- Ensure stable mounting

**Tilt Sensor:**
- Clean contacts if intermittent
- Check orientation (ball-switch type)
- Verify pull-up resistor enabled

## 🔄 Updates & Maintenance

### Firmware Updates

1. Download latest firmware from repository
2. Open in Arduino IDE
3. Upload to device
4. Run calibration routine

### Frontend Updates

```bash
cd frontend
npm update
npm run build
```

### Data Backup

Export data regularly using the dashboard export feature:
- CSV format for analysis
- Automatic timestamps
- Strain patterns for health tracking

## 📝 API Reference

### Serial Communication Protocol

#### Commands (Computer → Arduino)
- `JSON` - Set output format to JSON
- `CSV` - Set output format to CSV  
- `CALIBRATE` - Start calibration routine
- `STATUS` - Request device status

#### Responses (Arduino → Computer)
- Continuous sensor data stream
- Status messages
- Calibration feedback
- Error notifications

### Frontend API Hooks

```typescript
// Connection management
const { connectionStatus, latestData, connect, disconnect } = useSerialConnection();

// Data history
const { historicalData, getRecentData, getAverageStrain } = useDataHistory(latestData);

// Utility functions
getStrainAdvice(strainLevel: number): StrainAdvice
calculatePostureScore(data: SensorData): number
exportToCSV(data: any[], filename: string): void
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Setup

```bash
# Clone repository
git clone https://github.com/MuAbCh/HTN2025.git
cd HTN2025

# Setup firmware development
# (Use Arduino IDE for firmware changes)

# Setup frontend development
cd frontend
npm install
npm run dev
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Arduino Community** for LilyPad platform
- **React Team** for frontend framework
- **Recharts** for visualization components
- **Health professionals** for RSI prevention guidelines

## 📞 Support

Need help? Here's how to get support:

- 📚 Check the [Hardware Guide](./firmware/HARDWARE_GUIDE.md)
- 🐛 Report bugs via GitHub Issues
- 💬 Join our community discussions
- 📧 Contact the development team

---

**⚡ Start monitoring your finger health today and prevent RSI before it becomes a problem!**
