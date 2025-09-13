import { useState, useEffect } from 'react';
import TwoFingers from './TwoFingers';

interface NotificationItem {
  id: string;
  type: 'stretch' | 'break' | 'posture' | 'info';
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function LandingPage() {
  const [tiltScore, setTiltScore] = useState(78);
  const [impactScore, setImpactScore] = useState(92);
  const [tensionScore, setTensionScore] = useState(65);
  const [typingTime, setTypingTime] = useState(142); // minutes
  const [nextBreak, setNextBreak] = useState(18); // minutes
  const [indexValue, setIndexValue] = useState(25);
  const [middleValue, setMiddleValue] = useState(30);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'stretch',
      message: 'Time to stretch your fingers - detected increased tension',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'posture',
      message: 'Consider adjusting your wrist position',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'break',
      message: 'Great job! You took a break at the right time',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: true
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingTime(prev => prev + 1);
      setNextBreak(prev => Math.max(0, prev - 1));
      
      // Simulate metric updates
      setTiltScore(prev => Math.round(Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5))));
      setImpactScore(prev => Math.round(Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 3))));
      setTensionScore(prev => Math.round(Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 8))));
      
      // Simulate finger sensor data
      setIndexValue(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setMiddleValue(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 10)));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00ff88';
    if (score >= 60) return '#ffaa00';
    return '#ff4444';
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Left Panel - Stats and Controls */}
      <div style={{
        flex: '2',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflow: 'hidden',
        minHeight: 0
      }}>
        {/* Header */}
        <div style={{ marginBottom: '12px', flexShrink: 0 }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #ffffff 0%, #888888 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px'
          }}>
            <span style={{
              fontFamily: 'cursive',
              fontSize: '28px'
            }}>
              Your
            </span>
            <span style={{
              fontFamily: 'serif',
              fontSize: '36px'
            }}>
              Clau
            </span>
            <span style={{
              fontFamily: 'cursive',
              fontSize: '28px'
            }}>
              Dashboard
            </span>
          </h1>
        </div>

        {/* Three Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          flexShrink: 0
        }}>
          {/* Tilt Score */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              margin: '0 0 8px 0',
              color: '#888888'
            }}>
              Tilt
            </h3>
            <p style={{
              fontSize: '32px',
              fontWeight: '700',
              margin: '0 0 8px 0',
              color: getScoreColor(tiltScore)
            }}>
              {tiltScore}
            </p>
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${tiltScore}%`,
                height: '100%',
                background: getScoreColor(tiltScore),
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Impact Score */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              margin: '0 0 8px 0',
              color: '#888888'
            }}>
              Impact
            </h3>
            <p style={{
              fontSize: '32px',
              fontWeight: '700',
              margin: '0 0 8px 0',
              color: getScoreColor(impactScore)
            }}>
              {impactScore}
            </p>
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${impactScore}%`,
                height: '100%',
                background: getScoreColor(impactScore),
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Tension Score */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              margin: '0 0 8px 0',
              color: '#888888'
            }}>
              Tension
            </h3>
            <p style={{
              fontSize: '32px',
              fontWeight: '700',
              margin: '0 0 8px 0',
              color: getScoreColor(tensionScore)
            }}>
              {tensionScore}
            </p>
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${tensionScore}%`,
                height: '100%',
                background: getScoreColor(tensionScore),
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          flexShrink: 0
        }}>
          {/* Typing Time */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              margin: '0 0 8px 0',
              color: '#888888'
            }}>
              Session Time
            </h3>
            <p style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              color: '#ffffff'
            }}>
              {formatTime(typingTime)}
            </p>
          </div>

          {/* Next Break */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              margin: '0 0 8px 0',
              color: '#888888'
            }}>
              Next Break
            </h3>
            <p style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              color: nextBreak <= 5 ? '#ff4444' : '#ffffff'
            }}>
              {nextBreak > 0 ? `${nextBreak}m` : 'Now!'}
            </p>
          </div>
        </div>

        {/* Exercise History & Notifications */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 24px 0',
            color: '#ffffff'
          }}>
            Exercise History & Notifications
          </h2>
          {/* Exercise History Section */}
          <div style={{
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: '#00ffff'
            }}>
              Recent Exercises
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                background: 'rgba(0, 255, 0, 0.1)',
                borderRadius: '6px',
                padding: '12px',
                border: '1px solid rgba(0, 255, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#ffffff', fontSize: '14px' }}>Finger Stretches</span>
                <span style={{ color: '#00ff00', fontSize: '12px' }}>Completed 2h ago</span>
              </div>
              <div style={{
                background: 'rgba(0, 255, 0, 0.1)',
                borderRadius: '6px',
                padding: '12px',
                border: '1px solid rgba(0, 255, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#ffffff', fontSize: '14px' }}>Wrist Rotations</span>
                <span style={{ color: '#00ff00', fontSize: '12px' }}>Completed 4h ago</span>
              </div>
              <div style={{
                background: 'rgba(255, 165, 0, 0.1)',
                borderRadius: '6px',
                padding: '12px',
                border: '1px solid rgba(255, 165, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#ffffff', fontSize: '14px' }}>Hand Massage</span>
                <span style={{ color: '#ffa500', fontSize: '12px' }}>Skipped 6h ago</span>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: '#00ffff'
            }}>
              Notifications
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flex: 1,
              overflowY: 'auto'
            }}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    background: notification.read ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '16px',
                    border: notification.read ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 255, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      margin: 0,
                      color: notification.read ? '#cccccc' : '#00ffff'
                    }}>
                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                    </h3>
                    <span style={{
                      fontSize: '12px',
                      color: '#888888'
                    }}>
                      {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    margin: 0,
                    color: notification.read ? '#999999' : '#ffffff',
                    lineHeight: '1.4'
                  }}>
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Finger Visualization */}
      <div style={{
        flex: '1',
        background: 'rgba(255, 255, 255, 0.02)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          right: '24px',
          zIndex: 10
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 8px 0',
            color: '#ffffff'
          }}>
            Live Finger Tracking
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#888888',
            margin: 0
          }}>
            Real-time ergonomic analysis
          </p>
        </div>
        
        <div style={{
          width: '100%',
          height: 'calc(100% - 80px)',
          marginTop: '80px'
        }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <TwoFingers indexValue={indexValue} middleValue={middleValue} />
          </div>
        </div>
      </div>
    </div>
  );
}
