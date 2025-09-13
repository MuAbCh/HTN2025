import React from 'react';
import { useSerialConnection } from './hooks/useSerialConnection';
import { useDataHistory } from './hooks/useDataHistory';
import { StrainMeter } from './components/StrainMeter';
import { RealTimeChart } from './components/RealTimeChart';
import { SensorPanel } from './components/SensorPanel';
import { AlertPanel } from './components/AlertPanel';
import { AdvicePanel } from './components/AdvicePanel';
import { exportToCSV } from './utils/helpers';
import './index.css';

const App: React.FC = () => {
  const { connectionStatus, latestData, connect, disconnect, sendCommand } = useSerialConnection();
  const { historicalData, getRecentData, getAverageStrain } = useDataHistory(latestData);

  const handleConnect = async () => {
    if (connectionStatus.connected) {
      disconnect();
    } else {
      await connect();
    }
  };

  const handleExportData = () => {
    const recentData = getRecentData(60); // Last hour
    if (recentData.length === 0) {
      alert('No data to export');
      return;
    }
    
    const csvData = recentData.map(point => ({
      timestamp: new Date(point.timestamp).toISOString(),
      strain_level: point.strain_level,
      flex_sensor: point.flex_sensor,
      activity_level: point.activity_level
    }));
    
    exportToCSV(csvData, `finger-strain-data-${Date.now()}.csv`);
  };

  const handleCalibration = () => {
    if (connectionStatus.connected) {
      sendCommand('CALIBRATE');
      alert('Calibration command sent. Follow device instructions.');
    } else {
      alert('Please connect to device first');
    }
  };

  const currentStrain = latestData?.strain_level || 0;
  const averageStrain = getAverageStrain(5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5em' }}>🖐️ Finger Strain Monitor</h1>
          <p style={{ margin: '5px 0 0 0', color: '#888' }}>
            Real-time monitoring of finger and hand strain
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="connection-status">
            <div className={`status-indicator ${
              connectionStatus.connected ? 'status-connected' : 'status-disconnected'
            }`}></div>
            <span>
              {connectionStatus.connected ? 
                `Connected (${connectionStatus.port})` : 
                'Disconnected'
              }
            </span>
          </div>
          
          <button onClick={handleConnect}>
            {connectionStatus.connected ? 'Disconnect' : 'Connect Device'}
          </button>
          
          <button onClick={handleCalibration} disabled={!connectionStatus.connected}>
            Calibrate
          </button>
          
          <button onClick={handleExportData} disabled={historicalData.length === 0}>
            Export Data
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <StrainMeter data={latestData} averageStrain={averageStrain} />
        <SensorPanel data={latestData} />
        
        <RealTimeChart
          data={getRecentData(5)}
          title="Strain Level Trend"
          dataKey="strain_level"
          color="#f87171"
          unit="%"
        />
        
        <RealTimeChart
          data={getRecentData(5)}
          title="Finger Flex Activity"
          dataKey="flex_sensor"
          color="#60a5fa"
          unit="%"
        />
        
        <AlertPanel 
          currentStrainLevel={currentStrain}
          overuseDetected={latestData?.overuse_detected || false}
          alertActive={latestData?.alert_active || false}
        />
        
        <AdvicePanel strainLevel={currentStrain} />
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#888', fontSize: '0.9em' }}>
        <p>
          💡 Tip: Keep strain levels below 50% for optimal health. 
          Take breaks every 30 minutes and do finger exercises regularly.
        </p>
        <p>
          Last update: {latestData ? new Date(latestData.timestamp).toLocaleString() : 'Never'}
        </p>
      </div>
    </div>
  );
};

export default App;