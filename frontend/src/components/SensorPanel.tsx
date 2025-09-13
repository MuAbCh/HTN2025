import React from 'react';
import { SensorData } from '../types';

interface SensorPanelProps {
  data: SensorData | null;
}

export const SensorPanel: React.FC<SensorPanelProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="widget">
        <h3>Sensor Readings</h3>
        <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
          No data available. Please connect device.
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <h3>Live Sensor Data</h3>
      <div className="sensor-grid">
        <div className="sensor-item">
          <div style={{ fontSize: '0.8em', marginBottom: '5px' }}>Flex Sensor</div>
          <div className="sensor-value">{data.flex_sensor.toFixed(1)}%</div>
          <div style={{ fontSize: '0.7em', color: '#888' }}>Finger bend</div>
        </div>

        <div className="sensor-item">
          <div style={{ fontSize: '0.8em', marginBottom: '5px' }}>Tilt State</div>
          <div className="sensor-value" style={{ color: data.tilt_state ? '#f87171' : '#4ade80' }}>
            {data.tilt_state ? 'TILTED' : 'NORMAL'}
          </div>
          <div style={{ fontSize: '0.7em', color: '#888' }}>Hand position</div>
        </div>

        <div className="sensor-item">
          <div style={{ fontSize: '0.8em', marginBottom: '5px' }}>Accelerometer</div>
          <div className="sensor-value">
            {Math.sqrt(
              data.accelerometer.x ** 2 + 
              data.accelerometer.y ** 2 + 
              data.accelerometer.z ** 2
            ).toFixed(1)}
          </div>
          <div style={{ fontSize: '0.7em', color: '#888' }}>Motion intensity</div>
        </div>

        <div className="sensor-item">
          <div style={{ fontSize: '0.8em', marginBottom: '5px' }}>Hall Sensor</div>
          <div className="sensor-value">{data.hall_sensor}</div>
          <div style={{ fontSize: '0.7em', color: '#888' }}>Magnetic field</div>
        </div>

        <div className="sensor-item">
          <div style={{ fontSize: '0.8em', marginBottom: '5px' }}>Motion Detection</div>
          <div className="sensor-value" style={{ color: data.motion_detected ? '#fbbf24' : '#4ade80' }}>
            {data.motion_detected ? 'ACTIVE' : 'IDLE'}
          </div>
          <div style={{ fontSize: '0.7em', color: '#888' }}>Movement state</div>
        </div>

        <div className="sensor-item">
          <div style={{ fontSize: '0.8em', marginBottom: '5px' }}>Timestamp</div>
          <div className="sensor-value" style={{ fontSize: '0.8em' }}>
            {new Date(data.timestamp).toLocaleTimeString()}
          </div>
          <div style={{ fontSize: '0.7em', color: '#888' }}>Last update</div>
        </div>
      </div>

      <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.8em', marginBottom: '5px' }}>Accelerometer Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '0.8em' }}>
          <div>X: {data.accelerometer.x.toFixed(1)}</div>
          <div>Y: {data.accelerometer.y.toFixed(1)}</div>
          <div>Z: {data.accelerometer.z.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
};