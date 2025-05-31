import React, { useState, useMemo, useEffect, useRef } from 'react';
import { formatCurrency } from '../../utils/currency';
import { FaClock, FaCheckCircle, FaRegUser, FaRegCheckCircle, FaTimes, FaChartLine, 
         FaCoins, FaTrophy, FaBasketballBall, FaCaretUp, FaCaretDown, FaBolt } from 'react-icons/fa';
import { GiBaseballBat } from 'react-icons/gi';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { convertCurrencyType } from '../../utils/currency';
import {
  extractTeams, 
  getTimeRemaining, 
  getTimeColor, 
  getOppositeCondition,
  getTeamColors,
  getMLBTeamColors
} from '../../utils/teamColors';

const AuctionCard = ({ 
  auction, 
  currentUserId, 
  onBuy, 
  showBuyButton = true,
  userData,
  isPersonal = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef(null);
  const game = auction?.game || "Team A vs Team B";
  const teams = useMemo(() => extractTeams(game), [game]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  if (!auction) return null;
  const {
    _id,
    player = "Unknown Player",
    condition = "over",
    value = 0,
    metric = "points",
    betSize = 0,
    betType = "CASH",
    multiplier = 1,
    user = null,
    soldTo = null,
    expirationTime = new Date()
  } = auction;
  const userIdStr = user ? (typeof user === 'object' ? user._id?.toString() : user.toString()) : 'unknown';
  const currentUserIdStr = currentUserId ? currentUserId.toString() : 'none';
  const cost = betSize * (multiplier - 1);
  const total = Number(betSize) + cost;
  const isMLB = auction.sport === 'mlb';
  const team1Colors = isMLB ? getMLBTeamColors(teams[0]) : getTeamColors(teams[0]);
  const team2Colors = isMLB ? getMLBTeamColors(teams[1]) : getTeamColors(teams[1]);
  const isUserAuction = userIdStr === currentUserIdStr;
  const isSold = soldTo !== null;
  const hasSufficientFunds = userData && (
    betType === 'common' || betType === 'silver' ? userData.silver >= betSize : 
    betType === 'premium' || betType === 'gold' ? userData.gold >= betSize : 
    false
  );
  const displayCondition = isUserAuction ? condition : getOppositeCondition(condition);
  const { timeString, percentRemaining } = getTimeRemaining(expirationTime);
  const timeColor = getTimeColor(percentRemaining);
  const handleBuy = async () => {
    if (isConfirming) {
      if (onBuy) {
        setBuyLoading(true);
        try {
          await onBuy(_id);
        } catch (error) {
          console.error("Failed to buy auction:", error);
        } finally {
          setBuyLoading(false);
          setIsConfirming(false);
        }
      }
    } else {
      setIsConfirming(true);
    }
  };
  const cancelBuy = (e) => {
    if (e) e.preventDefault();
    setIsConfirming(false);
  };
  const getTheme = () => {
    if (isSold) return {
      primary: '#4CAF50',
      secondary: '#81C784',
      background: 'rgba(76, 175, 80, 0.03)',
      gradient: 'linear-gradient(135deg, rgba(76, 175, 80, 0.8), rgba(139, 195, 74, 0.8))',
      label: 'SOLD'
    };
    if (isUserAuction) return {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      background: 'rgba(139, 92, 246, 0.03)',
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(124, 58, 237, 0.8))',
      label: 'YOUR AUCTION'
    };
    if (betType === 'premium') return {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      background: 'rgba(245, 158, 11, 0.03)',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.8), rgba(217, 119, 6, 0.8))',
      label: 'PREMIUM'
    };
    return {
      primary: '#10B981',
      secondary: '#34D399',
      background: 'rgba(16, 185, 129, 0.03)',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8))',
      label: 'STANDARD'
    };
  };
  const theme = getTheme();
  const getConditionDisplay = () => {
    switch(condition.toLowerCase()) {
      case 'over': return <FaCaretUp style={{color: '#4ADE80'}} />;
      case 'under': return <FaCaretDown style={{color: '#F87171'}} />;
      case 'exactly': return "=";
      case 'not exactly': return "≠";
      default: return displayCondition;
    }
  };
  const getViewerMultiplier = () => {
    if (isUserAuction) {
      return multiplier;
    } 
    const inverseMultiplier = multiplier > 1 ? 
      1 + (1 / (multiplier - 1)) : 
      multiplier;
    return Math.round(inverseMultiplier * 100) / 100;
  };
  const getMultiplierLabel = () => {
    return isUserAuction ? 
      "Your Multiplier" : 
      "Your Position Multiplier";
  };
  return (
    <div 
      className="auction-card"
      ref={cardRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        background: '#111827',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transform: animateIn 
          ? (isHovered ? 'translateY(-8px)' : 'translateY(0)')
          : 'translateY(20px)',
        opacity: animateIn ? 1 : 0,
        boxShadow: isHovered
          ? `0 22px 40px rgba(0,0,0,0.3), 0 10px 10px rgba(0,0,0,0.15), 0 0 0 1px ${theme.primary}30`
          : '0 10px 30px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1)',
        border: `1px solid ${theme.primary}20`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!buyLoading) setIsConfirming(false);
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${team1Colors[0]}, ${team2Colors[0]})`,
        zIndex: 3
      }}/>
      <div style={{ 
        position: 'relative',
        overflow: 'hidden',
        padding: 0,
        height: '180px',
        background: '#0F172A',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background: `linear-gradient(135deg, ${team1Colors[0]}30 0%, transparent 80%)`,
          zIndex: 1,
          opacity: isHovered ? 0.9 : 0.7,
          transition: 'opacity 0.5s ease',
        }}/>
        
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: `linear-gradient(225deg, ${team2Colors[0]}30 0%, transparent 80%)`,
          zIndex: 1,
          opacity: isHovered ? 0.9 : 0.7,
          transition: 'opacity 0.5s ease',
        }}/>
        <div style={{
          position: 'absolute',
          top: '35px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2,
        }}>
          <div style={{
            padding: '4px 12px',
            background: 'rgba(0,0,0,0.7)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '12px',
          }}>
            <span style={{
              color: '#FFF',
              fontSize: '0.8rem',
              fontWeight: '600',
              letterSpacing: '1px',
            }}>MATCHUP</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                border: `2px solid ${team1Colors[0]}`,
                boxShadow: `0 0 15px ${team1Colors[0]}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.2rem',
                color: team1Colors[0],
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}>
                {teams[0].substring(0, 3).toUpperCase()}
              </div>
            </div>
            
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontSize: '0.7rem',
              fontWeight: '600',
            }}>
              VS
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                border: `2px solid ${team2Colors[0]}`,
                boxShadow: `0 0 15px ${team2Colors[0]}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.2rem',
                color: team2Colors[0],
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}>
                {teams[1].substring(0, 3).toUpperCase()}
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: '12px',
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            padding: '0 8px',
          }}>
            <div style={{
              color: team1Colors[0],
              fontWeight: '600',
              fontSize: '0.8rem',
              textAlign: 'center',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              maxWidth: '80px',
            }}>
              {teams[0]}
            </div>
            <div style={{
              color: team2Colors[0],
              fontWeight: '600',
              fontSize: '0.8rem',
              textAlign: 'center',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              maxWidth: '80px',
            }}>
              {teams[1]}
            </div>
          </div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(5px)',
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          zIndex: 2,
        }}>
          {isMLB ? (
            <GiBaseballBat size={16} color={theme.primary} />
          ) : (
            <FaBasketballBall size={14} color={theme.primary} />
          )}
          <h3 style={{
            margin: 0,
            color: '#FFF',
            fontSize: '1.1rem',
            fontWeight: '700',
            textAlign: 'center',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          }}>
            {player}
          </h3>
        </div>
        
        {(isUserAuction || isSold || betType === 'premium') && (
          <div style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 5,
            padding: '5px 10px',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            borderRadius: '20px',
            border: `1px solid ${theme.primary}40`,
            color: theme.primary,
            fontSize: '0.65rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px ${theme.primary}20`,
            letterSpacing: '0.5px',
          }}>
            {isUserAuction && <FaRegUser size={10} />}
            {isSold && <FaCheckCircle size={10} />}
            {!isUserAuction && !isSold && betType === 'premium' && <FaBolt size={10} />}
            {theme.label}
          </div>
        )}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        flexGrow: 1,
        background: '#1A1F2C',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 2,
      }}>
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${theme.primary}20 0%, transparent 70%)`,
          opacity: isHovered ? 0.9 : 0.5,
          filter: 'blur(50px)',
          zIndex: 1,
          transition: 'opacity 0.5s ease',
        }}/>
        
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '14px 16px',
          background: '#0F172A',
          borderRadius: '10px',
          marginBottom: '16px',
          border: '1px solid rgba(255,255,255,0.03)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03)',
        }}>
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '12px',
            padding: '2px 10px',
            background: theme.primary,
            color: '#FFF',
            borderRadius: '10px',
            fontSize: '0.65rem',
            fontWeight: '600',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>
            PREDICTION
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '6px',
            gap: '8px',
          }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              color: theme.secondary,
            }}>
              {getConditionDisplay()}
            </span>
            <span style={{
              color: '#FFF',
              fontSize: '1.1rem',
              fontWeight: '700',
            }}>
              {value}
            </span>
            <span style={{
              color: '#94A3B8',
              fontSize: '1rem',
            }}>
              {metric}
            </span>
          </div>
          
          {!isUserAuction && !isSold && (
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '-6px',
              transform: 'translateY(-50%)',
              padding: '3px 8px',
              background: '#3B82F6',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: '700',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              letterSpacing: '0.5px',
            }}>
              YOUR POSITION
            </div>
          )}
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '16px',
          position: 'relative',
          zIndex: 2,
        }}>
          <div style={{
            padding: '12px 8px',
            background: '#0F172A',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.03)',
          }}>
            <div style={{
              fontSize: '0.65rem',
              color: '#94A3B8',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <FaCoins size={10} />
              Bet Size
            </div>
            <div>
              <CurrencyDisplay 
                amount={auction.betSize} 
                type={convertCurrencyType(auction.betType)} 
                size="medium"
                showName={true}
              />
            </div>
          </div>
          
          <div style={{
            padding: '12px 8px',
            background: '#0F172A',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.03)',
          }}>
            <div style={{
              fontSize: '0.65rem',
              color: '#94A3B8',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <FaChartLine size={10} />
              {getMultiplierLabel()}
            </div>
            <div style={{
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.1rem',
              fontWeight: '800',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}>
              {getViewerMultiplier()}x
            </div>
            
            {!isUserAuction && !isSold && (
              <div style={{
                fontSize: '0.7rem',
                color: '#94A3B8',
                marginTop: '4px',
              }}>
                (seller multiplier: {multiplier}x)
              </div>
            )}
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          background: '#0F172A',
          borderRadius: '10px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid rgba(255,255,255,0.03)',
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${theme.primary}10, transparent)`,
            opacity: isHovered ? 0.8 : 0.3,
            transition: 'opacity 0.3s ease',
            zIndex: 1,
          }}/>
          
          <div style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
            }}>
              <FaTrophy size={12} color={theme.primary} />
              <span style={{
                fontSize: '0.75rem',
                color: '#94A3B8',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Total Pot
              </span>
            </div>
            
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        background: '#0F172A',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: '15px',
        borderBottomRightRadius: '15px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <FaClock size={12} color={timeColor} />
          <div>
            <div style={{
              fontSize: '0.6rem',
              color: '#94A3B8',
              marginBottom: '1px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              ENDS IN
            </div>
            <div style={{
              color: timeColor,
              fontSize: '0.85rem',
              fontWeight: '700',
            }}>
              {timeString}
            </div>
          </div>
        </div>
        
        <div>
          {buyLoading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '6px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: '#60A5FA',
              fontSize: '0.85rem',
              fontWeight: '700',
            }}>
              <div className="loader"></div>
              Processing
            </div>
          ) : isSold ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              background: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              color: '#4CAF50',
              fontSize: '0.85rem',
              fontWeight: '700',
            }}>
              <FaCheckCircle size={12} />
              SOLD
            </div>
          ) : isUserAuction ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              color: '#A78BFA',
              fontSize: '0.85rem',
              fontWeight: '700',
            }}>
              <FaRegUser size={12} />
              YOUR AUCTION
            </div>
          ) : showBuyButton ? (
            isConfirming ? (
              <div style={{
                display: 'flex',
                gap: '6px',
              }}>
                <button 
                  onClick={handleBuy} 
                  style={{
                    background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FaRegCheckCircle size={12} />
                  Confirm
                </button>
                <button 
                  onClick={cancelBuy} 
                  style={{
                    background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(185, 28, 28, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FaTimes size={12} />
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={handleBuy}
                disabled={!hasSufficientFunds}
                onMouseEnter={() => setShowTooltip(!hasSufficientFunds)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{
                  position: 'relative',
                  background: hasSufficientFunds 
                    ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
                    : 'linear-gradient(135deg, #6B7280, #4B5563)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: hasSufficientFunds ? 'pointer' : 'not-allowed',
                  boxShadow: hasSufficientFunds 
                    ? '0 4px 12px rgba(29, 78, 216, 0.3)'
                    : 'none',
                  transform: isHovered && hasSufficientFunds ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.2s ease',
                }}
              >
                Buy ({formatCurrency(cost)})
                {showTooltip && !hasSufficientFunds && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.9)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    You need {formatCurrency(betSize)} {betType === 'premium' || betType === 'gold' ? 'ALU' : 'SBM'} to buy this auction
                  </div>
                )}
              </button>
            )
          ) : null}
        </div>
      </div>
      
      <style jsx>{`
        .loader {
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top: 2px solid #60A5FA;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuctionCard;