// Sensor data types
export interface SensorData {
  timestamp: number;
  flex_sensor: number;
  tilt_state: boolean;
  accelerometer: {
    x: number;
    y: number;
    z: number;
  };
  hall_sensor: number;
  motion_detected: boolean;
  strain_level: number;
  alert_active: boolean;
  overuse_detected: boolean;
}

// Historical data for charts
export interface HistoricalData {
  timestamp: number;
  strain_level: number;
  flex_sensor: number;
  activity_level: number;
}

// Alert types
export interface Alert {
  id: string;
  timestamp: number;
  level: 'warning' | 'danger' | 'info';
  message: string;
  read: boolean;
}

// Connection status
export interface ConnectionStatus {
  connected: boolean;
  port?: string;
  lastUpdate?: number;
}

// Strain advice recommendations
export interface StrainAdvice {
  level: 'low' | 'moderate' | 'high' | 'severe';
  title: string;
  description: string;
  recommendations: string[];
  exercises?: string[];
}

// Settings
export interface AppSettings {
  strainThreshold: number;
  alertFrequency: number;
  dataRetention: number; // hours
  theme: 'light' | 'dark';
  notifications: boolean;
}