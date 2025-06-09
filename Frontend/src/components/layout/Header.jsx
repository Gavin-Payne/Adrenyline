import React from 'react';

const Header = ({ onLogout }) => {
  return (
    <header style={headerStyle}>
      <h1 style={titleStyle}>Adrenyline</h1>
      <button onClick={onLogout} style={logoutButtonStyle}>
        <span style={logoutIconStyle}>⎋</span>
      </button>
    </header>
  );
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  backgroundColor: '#1a1a1a',
  borderBottom: '1px solid #333',
};

const titleStyle = {
  margin: 0,
  color: '#4caf50',
  fontSize: '2em',
};

const logoutButtonStyle = {
  width: '45px',
  height: '45px',
  borderRadius: '50%',
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  border: '1px solid #444',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
};

const logoutIconStyle = {
  fontSize: '22px',
  lineHeight: '1',
  color: '#ecf0f1',
};

export default Header;