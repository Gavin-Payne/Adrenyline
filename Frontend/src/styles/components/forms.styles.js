import { colors, spacing, transitions } from '../../styles/theme';

export const modernInputStyle = {
  padding: '10px',
  border: '1px solid #444',
  borderRadius: '5px',
  backgroundColor: '#1a1a1a',
  color: '#fff',
  fontSize: '1em',
  width: '100%',
  boxSizing: 'border-box'
};

export const modernSelectStyle = {
  ...modernInputStyle,
  appearance: 'none',
  paddingRight: '30px'
};

export const modernFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
  padding: '20px'
};

// Add the missing style
export const modernButtonStyle = {
  backgroundColor: colors.primary,
  color: colors.text.primary,
  padding: `${spacing.sm} ${spacing.lg}`,
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1em',
  transition: transitions.normal,
  ':hover': {
    backgroundColor: colors.primaryDark
  },
  ':disabled': {
    backgroundColor: colors.background.elevated,
    cursor: 'not-allowed'
  }
};

export const modernSubmitButtonStyle = {
  backgroundColor: colors.primary,
  color: colors.text.primary,
  padding: `${spacing.md} ${spacing.lg}`,
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1.1em',
  fontWeight: 'bold',
  width: '100%',
  transition: transitions.normal,
  ':hover': {
    backgroundColor: colors.primaryDark,
    transform: 'translateY(-2px)'
  },
  ':active': {
    transform: 'translateY(0)'
  },
  ':disabled': {
    backgroundColor: colors.background.elevated,
    cursor: 'not-allowed',
    transform: 'none'
  }
};