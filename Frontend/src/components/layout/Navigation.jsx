import React from 'react';
import PropTypes from 'prop-types';
import { colors } from '../../styles/theme';
import { 
  FaChartLine, 
  FaExchangeAlt, 
  FaListAlt, 
  FaStore, 
  FaCog, 
  FaBasketballBall,
  FaTv,
  FaTrophy
} from 'react-icons/fa';

const navigationItems = [
  { icon: <FaChartLine />, label: 'Home' },
  { icon: <FaExchangeAlt />, label: 'Trade' },
  { icon: <FaListAlt />, label: 'Active' },
  { icon: <FaStore />, label: 'Market' },
  { icon: <FaCog />, label: 'Stats' },
  { icon: <FaBasketballBall />, label: 'Results' },
  { icon: <FaTv />, label: 'Live Games' },
  { icon: <FaTrophy />, label: 'Leaderboard' },
  { icon: <FaStore />, label: 'Currency Shop', to: '/shop' },
];

const Navigation = ({ currentTab, onTabChange }) => {
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(28, 28, 40, 0.9)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '8px 10px',
    zIndex: 1000,
    boxShadow: '0 -2px 15px rgba(0, 0, 0, 0.25)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  };

  const tabStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 12px', 
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.text.secondary,
    cursor: 'pointer',
    fontSize: '0.75em',
    transition: 'all 0.2s ease',
    borderRadius: '6px',
    position: 'relative',
    minWidth: '58px',
    gap: '4px' 
  };

  const activeTabStyle = {
    ...tabStyle,
    color: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  };

  const iconStyle = {
    fontSize: '1.1rem',
    transition: 'transform 0.2s ease, filter 0.2s ease',
  };

  const activeIconStyle = {
    ...iconStyle,
    filter: 'drop-shadow(0 0 3px rgba(99, 102, 241, 0.5))',
  };
  
  const indicatorStyle = {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: colors.primary,
    boxShadow: '0 0 5px rgba(99, 102, 241, 0.7)'
  };

  // Function to handle hover effects for tab buttons
  const handleMouseEnter = (e) => {
    if (e.currentTarget.classList.contains('active-tab')) return;
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    e.currentTarget.style.transform = 'translateY(-2px)';
    const icon = e.currentTarget.querySelector('svg');
    if (icon) {
      icon.style.transform = 'scale(1.1)';
    }
  };

  const handleMouseLeave = (e) => {
    if (e.currentTarget.classList.contains('active-tab')) return;
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.transform = 'translateY(0)';
    const icon = e.currentTarget.querySelector('svg');
    if (icon) {
      icon.style.transform = 'scale(1)';
    }
  };

  return (
    <nav style={navStyle}>
      {navigationItems.map((item, index) => (
        <button 
          key={index}
          className={currentTab === index ? 'active-tab' : ''}
          onClick={() => onTabChange(index)}
          style={currentTab === index ? activeTabStyle : tabStyle}
          title={item.label}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {React.cloneElement(item.icon, { style: currentTab === index ? activeIconStyle : iconStyle })}
          <span>{item.label}</span>
          {currentTab === index && <div style={indicatorStyle}></div>}
        </button>
      ))}
    </nav>
  );
};

Navigation.propTypes = {
  currentTab: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired
};

export default Navigation;