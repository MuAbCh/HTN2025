import React from 'react';
import { SensorData } from '../types';
import { calculatePostureScore } from '../utils/helpers';

interface StrainMeterProps {
  data: SensorData | null;
  averageStrain: number;
}

export const StrainMeter: React.FC<StrainMeterProps> = ({ data, averageStrain }) => {
  const currentStrain = data?.strain_level || 0;
  const postureScore = calculatePostureScore(data);

  const getStrainClass = (level: number) => {
    if (level < 25) return 'strain-low';
    if (level < 50) return 'strain-moderate';
    if (level < 75) return 'strain-high';
    return 'strain-severe';
  };

  return (
    <div className="widget strain-meter">
      <h3>Current Strain Level</h3>
      <div className={`strain-value ${getStrainClass(currentStrain)}`}>
        {currentStrain}%
      </div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.9em', color: '#888' }}>5-min Average: {averageStrain}%</div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
        <div className="sensor-item">
          <div style={{ fontSize: '0.8em', marginBottom: '5px' }}>Posture Score</div>
          <div className={`sensor-value ${getStrainClass(100 - postureScore)}`}>
            {postureScore}%
          </div>
        </div>
        
        <div className="sensor-item">
          <div style={{ fontSize: '0.8em', marginBottom: '5px' }}>Status</div>
          <div style={{ color: data?.alert_active ? '#f87171' : '#4ade80' }}>
            {data?.alert_active ? 'Alert' : 'Normal'}
          </div>
        </div>
      </div>

      {data?.overuse_detected && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: 'rgba(248, 113, 113, 0.2)',
          borderRadius: '8px',
          color: '#f87171',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ⚠️ OVERUSE DETECTED ⚠️
        </div>
      )}
    </div>
  );
};