import React from 'react';
import { colors } from '../../styles/theme';

const LoadingSpinner = () => {
  const spinnerStyle = {
    width: '50px',
    height: '50px',
    border: `4px solid ${colors.background.elevated}`,
    borderTop: `4px solid ${colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '20px auto'
  };

  return (
    <div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={spinnerStyle}></div>
    </div>
  );
};

export default LoadingSpinner;