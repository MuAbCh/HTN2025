import { useState, useEffect, useRef } from 'react';
import { SensorData, ConnectionStatus } from '../types';

// Mock serial connection for demo purposes
// In a real implementation, this would use Web Serial API
export const useSerialConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false
  });
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = async (port?: string) => {
    try {
      // Mock connection - in real implementation use Web Serial API
      setConnectionStatus({
        connected: true,
        port: port || 'COM3',
        lastUpdate: Date.now()
      });

      // Start mock data generation
      startMockDataStream();
      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      return false;
    }
  };

  const disconnect = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setConnectionStatus({ connected: false });
    setLatestData(null);
  };

  const startMockDataStream = () => {
    intervalRef.current = setInterval(() => {
      // Generate realistic mock data
      const mockData: SensorData = {
        timestamp: Date.now(),
        flex_sensor: Math.random() * 100,
        tilt_state: Math.random() > 0.7,
        accelerometer: {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
          z: (Math.random() - 0.5) * 200
        },
        hall_sensor: Math.random() * 1023,
        motion_detected: Math.random() > 0.8,
        strain_level: Math.floor(Math.random() * 100),
        alert_active: Math.random() > 0.9,
        overuse_detected: Math.random() > 0.95
      };

      setLatestData(mockData);
      setConnectionStatus(prev => ({
        ...prev,
        lastUpdate: Date.now()
      }));
    }, 100);
  };

  const sendCommand = (command: string) => {
    if (connectionStatus.connected) {
      console.log('Sending command:', command);
      // In real implementation, send command via serial
      return true;
    }
    return false;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    connectionStatus,
    latestData,
    connect,
    disconnect,
    sendCommand
  };
};