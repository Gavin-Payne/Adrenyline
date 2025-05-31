import { getTeamColors } from '../../utils/teamColors';

/**
 * Generate card styles based on auction properties
 */
export const getCardStyles = (teams, isUserAuction, isSold, isHovered) => {
  const team1Colors = getTeamColors(teams[0]);
  const team2Colors = getTeamColors(teams[1]);
  
  // Create a background gradient that subtly uses team colors
  const backgroundGradient = `
    linear-gradient(
      135deg, 
      rgba(25, 25, 30, 0.97) 0%,
      rgba(30, 30, 40, 0.95) 50%,
      rgba(35, 35, 45, 0.93) 100%
    ),
    linear-gradient(
      45deg,
      ${team1Colors[0]}15 0%,
      ${team2Colors[0]}15 100%
    )
  `;
  
  const cardOpacity = isSold ? '0.7' : '1';
  
  return {
    cardContainer: {
      position: 'relative',
      background: backgroundGradient,
      backgroundBlendMode: 'normal',
      borderRadius: '12px',
      padding: '20px',
      color: '#ffffff',
      transform: isHovered 
        ? 'perspective(1200px) rotateX(3deg) translateY(-4px)' 
        : 'perspective(1200px) rotateX(1.5deg)',
      transformOrigin: 'center top',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      opacity: cardOpacity,
      border: isUserAuction 
        ? `1px solid ${team1Colors[0].replace(')', ',.5)')}` 
        : '1px solid rgba(255, 255, 255, 0.05)',
      overflow: 'hidden',
      boxShadow: isHovered
        ? `0 20px 30px rgba(0, 0, 0, 0.4), 
           0 6px 10px rgba(0, 0, 0, 0.3), 
           inset 0 1px 0 rgba(255, 255, 255, 0.15), 
           0 0 20px rgba(${team1Colors[0].match(/\d+/g).join(',')}, 0.1)`
        : `0 12px 24px rgba(0, 0, 0, 0.35), 
           0 3px 6px rgba(0, 0, 0, 0.2), 
           inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
    },
    
    colorBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${team1Colors[0]} 0%, ${team2Colors[0]} 100%)`,
    },
    
    glowAccent: {
      position: 'absolute',
      top: isHovered ? '-120px' : '-150px',
      left: '50%',
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      transform: 'translateX(-50%)',
      background: `radial-gradient(circle, ${team1Colors[0]}30 0%, transparent 70%)`,
      opacity: isHovered ? 0.8 : 0.4,
      transition: 'all 0.5s ease',
      filter: 'blur(20px)',
      zIndex: 0,
    },
    
    teamBanner: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      padding: '10px 14px',
      borderRadius: '10px',
      background: `linear-gradient(90deg, ${team1Colors[0]}30 0%, ${team2Colors[0]}30 100%)`,
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      transform: isHovered ? 'translateY(-1px)' : 'none',
      transition: 'transform 0.3s ease',
    },
    
    teamNameLeft: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '0.95rem',
      textShadow: `0 1px 2px rgba(0,0,0,0.5), 0 0 10px ${team1Colors[0]}80`
    },
    
    vsText: { 
      color: '#ffffff',
      fontWeight: 'normal',
      fontSize: '0.8rem',
      opacity: 0.8
    },
    
    teamNameRight: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '0.95rem',
      textShadow: `0 1px 2px rgba(0,0,0,0.5), 0 0 10px ${team2Colors[0]}80`
    },
    
    playerName: {
      margin: '0 0 12px 0',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#ffffff',
      textShadow: '0 2px 4px rgba(0,0,0,0.4)',
      letterSpacing: '0.2px'
    },
    
    betCondition: {
      display: 'inline-block',
      background: 'rgba(255,255,255,0.1)',
      padding: '6px 12px',
      borderRadius: '6px',
      marginBottom: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(4px)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      transition: 'transform 0.3s ease'
    },
    
    conditionText: {
      color: '#4FC3F7',
      fontWeight: 'bold',
      textTransform: 'capitalize'
    },
    
    yourPositionTag: {
      fontSize: '0.7rem',
      opacity: 0.9,
      marginLeft: '8px',
      backgroundColor: 'rgba(33, 150, 243, 0.2)',
      padding: '2px 6px',
      borderRadius: '4px',
      color: '#2196F3',
      border: '1px solid rgba(33, 150, 243, 0.3)'
    },
    
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px',
      background: 'rgba(0,0,0,0.25)',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '18px',
      border: '1px solid rgba(255,255,255,0.05)',
      backdropFilter: 'blur(4px)',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
      transform: isHovered ? 'translateY(-2px)' : 'none',
      transition: 'transform 0.3s ease',
    },
    
    statsRow: {
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: '8px'
    },
    
    statsLabel: {
      fontSize: '0.75rem',
      color: 'rgba(255,255,255,0.7)',
      marginBottom: '3px'
    },
    
    statsValue: {
      fontSize: '0.95rem',
      fontWeight: 'bold'
    },
    
    totalPotRow: {
      gridColumn: '1 / 3',
      marginTop: '6px',
      padding: '6px',
      background: 'rgba(76, 175, 80, 0.1)',
      borderRadius: '4px',
      border: '1px solid rgba(76, 175, 80, 0.2)'
    },
    
    totalPotValue: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#4CAF50'
    },
    
    footerSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      paddingTop: '14px',
      marginTop: 'auto'
    },
    
    timeSection: {
      display: 'flex',
      alignItems: 'center'
    },
    
    timeLabel: {
      fontSize: '0.8rem',
      color: 'rgba(255,255,255,0.7)',
      marginRight: '5px'
    },
    
    getTimeTextStyle: (timeColor) => ({
      color: timeColor,
      fontWeight: 'bold',
      fontSize: '0.9rem'
    }),
    
    soldTag: {
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      padding: '6px 12px',
      borderRadius: '6px',
      color: '#4CAF50',
      fontWeight: 'bold',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      border: '1px solid rgba(76, 175, 80, 0.3)'
    },
    
    yourAuctionTag: {
      backgroundColor: 'rgba(33, 150, 243, 0.2)',
      padding: '6px 12px',
      borderRadius: '6px',
      color: '#2196F3',
      fontWeight: 'bold',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      border: '1px solid rgba(33, 150, 243, 0.3)'
    },
    
    buyButtonContainer: {
      display: 'flex',
      gap: '6px'
    },
    
    buyButton: (hasSufficientFunds) => ({
      background: hasSufficientFunds ? '#2196F3' : '#666',
      color: 'white',
      padding: '8px 14px',
      border: 'none',
      borderRadius: '6px',
      cursor: hasSufficientFunds ? 'pointer' : 'not-allowed',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      fontWeight: 'bold',
      transform: isHovered && hasSufficientFunds ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.2s ease'
    }),
    
    confirmButton: {
      background: '#4CAF50', 
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 14px',
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      fontWeight: 'bold'
    },
    
    cancelButton: {
      background: '#F44336', 
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 14px',
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      fontWeight: 'bold'
    },
    
    loadingEffect: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: '12px',
      background: `linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.05) 50%, 
        transparent 100%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      pointerEvents: 'none'
    }
  };
};