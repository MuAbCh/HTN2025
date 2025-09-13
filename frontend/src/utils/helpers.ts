import { StrainAdvice } from '../types';

export const getStrainAdvice = (strainLevel: number): StrainAdvice => {
  if (strainLevel < 25) {
    return {
      level: 'low',
      title: 'Good Posture',
      description: 'Your finger strain levels are within normal ranges. Keep up the good work!',
      recommendations: [
        'Continue current practices',
        'Take regular breaks every hour',
        'Stay hydrated',
        'Maintain good ergonomics'
      ],
      exercises: [
        'Gentle finger stretches every hour',
        'Wrist rotations (10 each direction)',
        'Clench and release fists 5 times'
      ]
    };
  } else if (strainLevel < 50) {
    return {
      level: 'moderate',
      title: 'Mild Strain Detected',
      description: 'Some strain is detected. Consider taking preventive measures.',
      recommendations: [
        'Take more frequent breaks (every 30 minutes)',
        'Check your workstation ergonomics',
        'Reduce typing intensity if possible',
        'Do finger and wrist exercises'
      ],
      exercises: [
        'Finger extensions (hold for 10 seconds)',
        'Wrist flexor stretches',
        'Tendon gliding exercises',
        'Prayer position stretches'
      ]
    };
  } else if (strainLevel < 75) {
    return {
      level: 'high',
      title: 'Moderate Strain Warning',
      description: 'Elevated strain levels detected. Take immediate action to prevent injury.',
      recommendations: [
        'Take a 5-10 minute break now',
        'Review and adjust your workspace setup',
        'Consider using ergonomic tools',
        'Apply ice if experiencing discomfort',
        'Reduce repetitive motions'
      ],
      exercises: [
        'Complete hand and wrist stretching routine',
        'Nerve gliding exercises',
        'Gentle massage of forearms',
        'Shoulder blade squeezes'
      ]
    };
  } else {
    return {
      level: 'severe',
      title: 'High Strain Alert!',
      description: 'Dangerous strain levels detected. Immediate rest is required to prevent injury.',
      recommendations: [
        'STOP current activity immediately',
        'Take at least 15-20 minute break',
        'Apply ice to reduce inflammation',
        'Consider consulting a healthcare provider',
        'Evaluate your workstation completely',
        'Use voice recognition software if available'
      ],
      exercises: [
        'Complete rest for fingers and wrists',
        'Gentle neck and shoulder stretches only',
        'Deep breathing exercises',
        'Consider professional massage therapy'
      ]
    };
  }
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString();
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const calculatePostureScore = (data: any): number => {
  if (!data) return 0;
  
  let score = 100;
  
  // Deduct points for poor posture indicators
  if (data.tilt_state) score -= 20; // Poor wrist angle
  if (data.strain_level > 50) score -= 30; // High strain
  if (data.flex_sensor > 80) score -= 25; // Excessive finger bending
  
  // Activity-based adjustments
  const totalAccel = Math.abs(data.accelerometer.x) + 
                    Math.abs(data.accelerometer.y) + 
                    Math.abs(data.accelerometer.z);
  
  if (totalAccel > 150) score -= 15; // Excessive movement
  
  return Math.max(0, score);
};