import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="background-container">
      <div className="animated-gradient"></div>
      <div className="noise-overlay"></div>
      <div className="grid-lines"></div>
      
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      <div className="shape shape-3"></div>

      <div className="network-connections">
        <div className="connection-line connection-line-1"></div>
        <div className="connection-line connection-line-2"></div>
        <div className="connection-line connection-line-3"></div>
        <div className="connection-line connection-line-4"></div>
        
        <div className="data-point data-point-1"></div>
        <div className="data-point data-point-2"></div>
        <div className="data-point data-point-3"></div>
        <div className="data-point data-point-4"></div>
        <div className="data-point data-point-5"></div>
      </div>
      
      <div className="chart-vector"></div>
    </div>
  );
};

export default AnimatedBackground;