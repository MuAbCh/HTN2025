import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoricalData } from '../types';
import { formatTimestamp } from '../utils/helpers';

interface RealTimeChartProps {
  data: HistoricalData[];
  title: string;
  dataKey: keyof HistoricalData;
  color: string;
  unit?: string;
}

export const RealTimeChart: React.FC<RealTimeChartProps> = ({
  data,
  title,
  dataKey,
  color,
  unit = ''
}) => {
  const chartData = data.slice(-50); // Show last 50 data points

  return (
    <div className="widget">
      <h3>{title}</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={(value) => formatTimestamp(value)}
              stroke="rgba(255,255,255,0.6)"
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)"
              domain={[0, 100]}
            />
            <Tooltip 
              labelFormatter={(value) => formatTimestamp(Number(value))}
              formatter={(value: any) => [`${value}${unit}`, title]}
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};