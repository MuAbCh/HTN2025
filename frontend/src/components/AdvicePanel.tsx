import React from 'react';
import { StrainAdvice } from '../types';
import { getStrainAdvice } from '../utils/helpers';

interface AdvicePanelProps {
  strainLevel: number;
}

export const AdvicePanel: React.FC<AdvicePanelProps> = ({ strainLevel }) => {
  const advice: StrainAdvice = getStrainAdvice(strainLevel);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low': return '#22c55e';
      case 'moderate': return '#fbbf24';
      case 'high': return '#f97316';
      case 'severe': return '#dc2626';
      default: return '#60a5fa';
    }
  };

  return (
    <div className="widget">
      <h3>Health Advice</h3>
      <div className="advice-panel" style={{ borderLeftColor: getLevelColor(advice.level) }}>
        <h4 style={{ margin: '0 0 10px 0', color: getLevelColor(advice.level) }}>
          {advice.title}
        </h4>
        <p style={{ margin: '0 0 15px 0', lineHeight: '1.4' }}>
          {advice.description}
        </p>
        
        <div style={{ marginBottom: '15px' }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#ffffff' }}>Recommendations:</h5>
          <ul className="advice-recommendations">
            {advice.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        {advice.exercises && (
          <div>
            <h5 style={{ margin: '0 0 8px 0', color: '#ffffff' }}>Recommended Exercises:</h5>
            <ul className="advice-recommendations">
              {advice.exercises.map((exercise, index) => (
                <li key={index}>{exercise}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};