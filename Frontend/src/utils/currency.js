// Import the icons as image assets
import commonIcon from '../assets/common.png';  // PNG file
import premiumIcon from '../assets/premium.png'; // PNG file

// Define currency configuration in a single object for easy updates
export const CURRENCY_CONFIG = {
  common: {
    name: 'SBM',       // Short name
    fullName: 'Soybean Meal',  // Full display name
    symbol: '○',       // Symbol for text representation
    icon: commonIcon,  // Icon image
    legacyNames: ['silver', 'common', 'credits'] // For backward compatibility
  },
  premium: {
    name: 'ALU',       // Short name
    fullName: 'Aluminum',  // Full display name
    symbol: '✦',       // Symbol for text representation
    icon: premiumIcon, // Icon image
    legacyNames: ['gold', 'premium', 'imperium'] // For backward compatibility
  }
};

// Helper to normalize currency type for API consistency
export const normalizeCurrencyType = (type = '') => {
  if (!type) return 'common';
  
  const lowerType = type.toLowerCase();
  
  // Check if it's a premium currency variant
  if (CURRENCY_CONFIG.premium.legacyNames.includes(lowerType)) {
    return 'premium';
  }
  
  // Default to common if not recognized
  return 'common';
};

// Format number to 2 decimal places
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0.00';
  return parseFloat(Number(amount).toFixed(2));
};

// Calculate cost to buy an auction
export const calculateAuctionCost = (betSize, multiplier) => {
  const rawCost = betSize * (multiplier - 1);
  return formatCurrency(rawCost);
};

// Calculate total payout (bet size + cost)
export const calculateTotalPayout = (betSize, cost) => {
  return formatCurrency(betSize + cost);
};

// Check if user has enough funds
export const hasSufficientFunds = (userBalance, cost) => {
  return userBalance >= cost;
};

// Get currency icon URL based on type
export const getCurrencyIcon = (type) => {
  const normalizedType = normalizeCurrencyType(type);
  return CURRENCY_CONFIG[normalizedType].icon;
};

// Create a React component to display currency with icon
export const CurrencyDisplay = ({ amount, type, className }) => {
  const icon = getCurrencyIcon(type);
  const formattedAmount = formatCurrency(amount);
  
  return (
    <span className={className || ''}>
      <img 
        src={icon} 
        alt={type === 'premium' ? 'Premium' : 'Common'} 
        style={{ 
          height: '1em', 
          width: 'auto', 
          marginRight: '0.25em',
          verticalAlign: 'middle' 
        }} 
      />
      {formattedAmount}
    </span>
  );
};

// Get short name for a currency type
export const getCurrencyName = (type) => {
  const normalizedType = normalizeCurrencyType(type);
  return CURRENCY_CONFIG[normalizedType].name;
};

// Get full name for a currency type
export const getCurrencyFullName = (type) => {
  const normalizedType = normalizeCurrencyType(type);
  return CURRENCY_CONFIG[normalizedType].fullName;
};

// Get symbol for a currency type
export const getCurrencySymbol = (type) => {
  const normalizedType = normalizeCurrencyType(type);
  return CURRENCY_CONFIG[normalizedType].symbol;
};

// Format amount with symbol (for text displays)
export const formatWithSymbol = (amount, type) => {
  const formatted = formatCurrency(amount);
  const symbol = getCurrencySymbol(type);
  return `${symbol} ${formatted}`;
};

// Format amount with short name (for compact displays)
export const formatWithName = (amount, type) => {
  const formatted = formatCurrency(amount);
  const name = getCurrencyName(type);
  return `${formatted} ${name}`;
};

// Format amount with full name (for formal displays)
export const formatWithFullName = (amount, type) => {
  const formatted = formatCurrency(amount);
  const fullName = getCurrencyFullName(type);
  return `${formatted} ${fullName}`;
};

// Convert between old and new currency types (for backward compatibility)
export const convertCurrencyType = (oldType) => {
  return normalizeCurrencyType(oldType);
};

// Get user's balance of a specific currency
export const getUserBalance = (userData, currencyType) => {
  if (!userData) return 0;
  
  const normalizedType = normalizeCurrencyType(currencyType);
  
  if (normalizedType === 'premium') {
    // Check for both new and legacy property names
    return userData.premium || userData.gold || 0;
  }
  
  // Default to common currency
  return userData.common || userData.silver || 0;
};