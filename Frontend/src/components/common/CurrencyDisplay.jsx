import React, { useEffect } from 'react';
import { formatCurrency } from '../../utils/currency';
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';

const CurrencyDisplay = ({ 
  amount, 
  type = 'common',
  size = 'medium',
  showName = true,
  className = '' 
}) => {
  const [_, setForceUpdate] = React.useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate(v => v + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const actualType = type === 'silver' ? 'common' : type === 'gold' ? 'premium' : type;
  const icon = actualType === 'premium' ? premiumIcon : commonIcon;
  const name = actualType === 'premium' ? 'Imperium' : 'Credits';
  const iconSizes = {
    small: '14px',
    medium: '18px',
    large: '24px'
  };
  const textSizes = {
    small: '0.9rem',
    medium: '1rem',
    large: '1.2rem'
  };
  return (
    <div 
      className={`currency-display ${className}`}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        fontWeight: '500'
      }}
    >
      <img 
        src={icon} 
        alt={name}
        style={{ 
          width: iconSizes[size], 
          height: iconSizes[size], 
          marginRight: '4px',
          verticalAlign: 'middle'
        }} 
      />
      <span style={{ fontSize: textSizes[size] }}>
        {formatCurrency(amount)}
        {showName && <span style={{ marginLeft: '4px', opacity: 0.8 }}>{name}</span>}
      </span>
    </div>
  );
};

export default CurrencyDisplay;