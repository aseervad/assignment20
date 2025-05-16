import React from 'react';
import { useTimer } from 'react-timer-hook';

const Timer = ({ expiryTimestamp, onExpire }) => {
  const {
    seconds,
    minutes,
    isRunning,
    pause,
    resume,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      onExpire();
    },
    autoStart: true
  });

  const formatTime = (time) => time < 10 ? `0${time}` : time;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px',
      backgroundColor: minutes < 1 ? '#ffebee' : '#e8f5e9',
      borderRadius: '8px',
      border: `2px solid ${minutes < 1 ? '#ef9a9a' : '#a5d6a7'}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minWidth: '100px'
    }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
        {formatTime(minutes)}:{formatTime(seconds)}
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        {isRunning ? 'Running' : 'Paused'}
      </div>
      <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
        <button 
          onClick={pause}
          style={{
            padding: '3px 8px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#e0e0e0',
            cursor: 'pointer'
          }}
        >
          Pause
        </button>
        <button 
          onClick={resume}
          style={{
            padding: '3px 8px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#e0e0e0',
            cursor: 'pointer'
          }}
        >
          Resume
        </button>
      </div>
    </div>
  );
};

export default Timer;
