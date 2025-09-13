import React, { useState, useEffect } from 'react';
import { Alert } from '../types';

interface AlertPanelProps {
  currentStrainLevel: number;
  overuseDetected: boolean;
  alertActive: boolean;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ 
  currentStrainLevel, 
  overuseDetected, 
  alertActive 
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const now = Date.now();
    const newAlerts: Alert[] = [];

    // Add strain level alerts
    if (currentStrainLevel > 75) {
      newAlerts.push({
        id: `strain-${now}`,
        timestamp: now,
        level: 'danger',
        message: `High strain level detected: ${currentStrainLevel}%`,
        read: false
      });
    } else if (currentStrainLevel > 50) {
      newAlerts.push({
        id: `strain-${now}`,
        timestamp: now,
        level: 'warning',
        message: `Moderate strain level: ${currentStrainLevel}%`,
        read: false
      });
    }

    // Add overuse alerts
    if (overuseDetected) {
      newAlerts.push({
        id: `overuse-${now}`,
        timestamp: now,
        level: 'danger',
        message: 'Overuse detected! Take immediate rest.',
        read: false
      });
    }

    // Add active alert notifications
    if (alertActive) {
      newAlerts.push({
        id: `alert-${now}`,
        timestamp: now,
        level: 'warning',
        message: 'Device alert activated - check your posture',
        read: false
      });
    }

    // Update alerts state with new alerts
    if (newAlerts.length > 0) {
      setAlerts(prev => {
        const combined = [...newAlerts, ...prev];
        // Keep only recent alerts (last hour)
        const oneHourAgo = now - (60 * 60 * 1000);
        return combined
          .filter(alert => alert.timestamp > oneHourAgo)
          .slice(0, 20); // Keep maximum 20 alerts
      });
    }
  }, [currentStrainLevel, overuseDetected, alertActive]);

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const clearAll = () => {
    setAlerts([]);
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;

  return (
    <div className="widget">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>
          Alerts {unreadCount > 0 && <span style={{ color: '#f87171' }}>({unreadCount})</span>}
        </h3>
        {alerts.length > 0 && (
          <button onClick={clearAll} style={{ fontSize: '0.8em', padding: '4px 8px' }}>
            Clear All
          </button>
        )}
      </div>
      
      <div className="alert-panel">
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
            No alerts. You're doing great! 👍
          </div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id}
              className={`alert-item alert-${alert.level}`}
              style={{ 
                opacity: alert.read ? 0.6 : 1,
                cursor: alert.read ? 'default' : 'pointer'
              }}
              onClick={() => !alert.read && markAsRead(alert.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: alert.read ? 'normal' : 'bold' }}>
                    {alert.message}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#888', marginTop: '4px' }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {!alert.read && (
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: '#60a5fa',
                    marginLeft: '10px',
                    marginTop: '4px'
                  }} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};