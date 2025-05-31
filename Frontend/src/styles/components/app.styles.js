import { colors } from '../theme';

export const darkAppStyle = {
  backgroundColor: colors.background.main,
  color: colors.text.primary,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Arial, sans-serif',
};

export const darkHeaderStyle = {
  textAlign: 'center',
  color: colors.text.primary,
  margin: '20px 0',
};

export const darkContainerStyle = {
  backgroundColor: 'rgba(28, 28, 40, 0.7)', // Change to semi-transparent
  backdropFilter: 'blur(10px)',
  padding: '30px',
  borderRadius: '12px',
  maxWidth: '450px',
  margin: '0 auto',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)'
};

export const darkSubscriptButtonStyle = {
  border: 'none',
  background: 'none',
  color: colors.primary,
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '0.9em',
};

export const interfaceContainerStyle = {
  minHeight: 'calc(100vh - 60px)', // Adjust for header and footer
  padding: '16px',
  backgroundColor: 'transparent', // Changed from solid color
};