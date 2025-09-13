import { useState, useEffect } from 'react';
import { SensorData, HistoricalData } from '../types';

const MAX_DATA_POINTS = 1000;

export const useDataHistory = (latestData: SensorData | null) => {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  useEffect(() => {
    if (!latestData) return;

    const newDataPoint: HistoricalData = {
      timestamp: latestData.timestamp,
      strain_level: latestData.strain_level,
      flex_sensor: latestData.flex_sensor,
      activity_level: Math.abs(latestData.accelerometer.x) + 
                     Math.abs(latestData.accelerometer.y) + 
                     Math.abs(latestData.accelerometer.z)
    };

    setHistoricalData(prev => {
      const updated = [...prev, newDataPoint];
      // Keep only recent data points
      return updated.slice(-MAX_DATA_POINTS);
    });
  }, [latestData]);

  const getRecentData = (minutes: number = 5) => {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return historicalData.filter(point => point.timestamp > cutoff);
  };

  const getAverageStrain = (minutes: number = 5) => {
    const recentData = getRecentData(minutes);
    if (recentData.length === 0) return 0;
    
    const sum = recentData.reduce((acc, point) => acc + point.strain_level, 0);
    return Math.round(sum / recentData.length);
  };

  const clearData = () => {
    setHistoricalData([]);
  };

  return {
    historicalData,
    getRecentData,
    getAverageStrain,
    clearData
  };
};