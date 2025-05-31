import { colors } from '../theme';

// Main form container styles
export const enhancedFormStyle = {
  backgroundColor: colors.background?.elevated || '#1e1e1e',
  padding: '28px',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  maxWidth: '700px',
  margin: '0 auto',
  color: colors.text?.primary || '#ffffff',
};

// Form group styles
export const formGroupStyle = {
  marginBottom: '22px',
  position: 'relative'
};

// Label styles
export const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px',
  color: colors.text?.primary || '#ffffff',
  fontWeight: '500',
  fontSize: '0.95rem'
};

// Icon styles
export const iconStyle = {
  marginRight: '8px',
  fontSize: '1rem',
  color: colors.primary || '#6366F1'
};

// Section container styles
export const sectionStyle = {
  backgroundColor: 'rgba(255,255,255,0.03)',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
  border: '1px solid rgba(255,255,255,0.05)',
};

// Section title styles
export const sectionTitleStyle = {
  fontSize: '1rem',
  fontWeight: '600',
  marginBottom: '16px',
  color: colors.text?.primary || '#ffffff',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  paddingBottom: '8px'
};

// Form title styles
export const formTitleStyle = {
  textAlign: 'center', 
  marginBottom: '30px', 
  color: colors.text?.primary || '#ffffff',
  fontSize: '1.8rem',
  fontWeight: '700',
  backgroundImage: 'linear-gradient(135deg, #6e8efb, #a777e3)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

// Enhanced bet amount container
export const betAmountContainerStyle = {
  backgroundColor: 'rgba(255,255,255,0.02)',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.08)',
  marginBottom: '24px'
};

// Enhanced label for bet amount
export const betAmountLabelStyle = {
  fontSize: '1.05rem',
  fontWeight: '600',
  marginBottom: '16px'
};

// Enhanced icon for bet amount
export const betAmountIconStyle = {
  fontSize: '1.2rem'
};

// Bet amount input container
export const betInputContainerStyle = {
  display: 'flex', 
  flexDirection: 'column',
  gap: '12px'
};

// Bet amount input field wrapper
export const betInputWrapperStyle = {
  display: 'flex',
  alignItems: 'stretch',
  position: 'relative'
};

// Bet amount input field
export const betInputStyle = {
  flex: '1',
  height: '54px',
  fontSize: '1.2rem',
  fontWeight: '500',
  paddingLeft: '20px',
  paddingRight: '100px'
};

// Currency dropdown container
export const currencyDropdownContainerStyle = {
  position: 'absolute',
  right: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2
};

// Currency dropdown
export const currencyDropdownStyle = {
  height: '40px',
  fontSize: '0.95rem',
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '4px',
  color: '#fff',
  padding: '0 10px',
  appearance: 'none',
  paddingRight: '24px',
  cursor: 'pointer'
};

// Currency dropdown arrow
export const dropdownArrowStyle = {
  position: 'absolute',
  right: '8px',
  top: '50%',
  transform: 'translateY(-50%) rotate(90deg)',
  pointerEvents: 'none'
};

// Available balance container
export const balanceContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  backgroundColor: 'rgba(0,0,0,0.2)',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.05)'
};

// Available balance label
export const balanceLabelStyle = {
  fontSize: '0.9rem', 
  color: colors.text?.secondary || '#a0a0a0'
};

// Available balance amount container
export const balanceAmountContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  fontWeight: '600', 
  color: colors.text?.primary || '#ffffff',
  fontSize: '0.95rem'
};

// Currency icon
export const currencyIconStyle = {
  width: '16px', 
  height: '16px', 
  marginRight: '6px'
};

// Quick amount buttons container
export const quickAmountButtonsContainerStyle = {
  marginTop: '12px',
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '8px'
};

// Quick amount button
export const quickAmountButtonStyle = {
  padding: '8px',
  background: 'rgba(99, 102, 241, 0.1)',
  border: '1px solid rgba(99, 102, 241, 0.3)',
  borderRadius: '4px',
  color: '#a4a9fc',
  cursor: 'pointer',
  fontSize: '0.85rem'
};

// Potential winnings display
export const potentialWinningsContainerStyle = {
  fontSize: '0.85rem', 
  color: colors.text?.secondary || '#a0a0a0',
  margin: '6px 0 0',
  display: 'flex',
  justifyContent: 'space-between'
};

// Potential winnings amount
export const potentialWinningsAmountStyle = {
  fontWeight: '500', 
  color: '#4caf50'
};

// Bet summary container
export const betSummaryContainerStyle = {
  backgroundColor: 'rgba(76, 175, 80, 0.1)',
  border: '1px solid rgba(76, 175, 80, 0.3)',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

// Bet summary title
export const betSummaryTitleStyle = {
  margin: '0 0 10px 0', 
  color: '#4caf50'
};

// Bet summary text
export const betSummaryTextStyle = {
  margin: '0 0 5px 0', 
  fontSize: '0.95rem'
};

// Error message container
export const errorContainerStyle = {
  padding: '15px', 
  backgroundColor: 'rgba(255,0,0,0.1)', 
  borderLeft: '4px solid #f44336',
  marginBottom: '24px',
  color: colors.text?.error || '#f44336',
  borderRadius: '4px'
};

// Submit button
export const submitButtonStyle = {
  backgroundColor: '#6366F1',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '14px 24px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  width: '100%',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
};

// Submit button disabled
export const submitButtonDisabledStyle = {
  ...submitButtonStyle,
  opacity: 0.7,
  cursor: 'not-allowed'
};

// Performance metrics grid
export const metricsGridStyle = {
  display: 'grid', 
  gridTemplateColumns: '1fr 1fr 1fr', 
  gap: '12px',
  alignItems: 'start'
};

// Metrics label style
export const metricsLabelStyle = {
  fontSize: '0.8rem',
  marginBottom: '4px', 
  display: 'block'
};