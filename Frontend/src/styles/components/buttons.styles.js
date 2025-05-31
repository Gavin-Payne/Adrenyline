export const modernButtonStyle = {
  backgroundColor: '#4caf50',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1em',
  transition: 'all 0.3s ease',
  ':hover': {
    backgroundColor: '#45a049'
  }
};

export const popButtonStyle = {
  ...modernButtonStyle,
  transform: 'scale(1)',
  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  transition: 'all 0.2s ease'
};

export const navButtonStyle = {
  ...modernButtonStyle,
  width: '100%',
  marginBottom: '5px'
};