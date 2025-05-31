import React, { useState, useEffect } from 'react';
import { FaStore, FaInfoCircle, FaSortAmountDown, FaCalendarAlt } from 'react-icons/fa';
import AuctionCard from './AuctionCard';
import AuctionSearch from './AuctionSearch';
import Tips from './Tips';
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';

const AuctionHouse = ({ 
  auctions = [], 
  currentUserId, 
  onBuy, 
  onSearch,
  userData 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [displayedAuctions, setDisplayedAuctions] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [animateCards, setAnimateCards] = useState(false);

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    dates.push({
      value: today.toISOString().split('T')[0],
      label: 'Today',
      date: new Date(today),
      isToday: true
    });
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const value = date.toISOString().split('T')[0];
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      const label = date.toLocaleDateString('en-US', options);
      const dayDescription = i === 1 ? 'Tomorrow' : label;
      dates.push({ 
        value, 
        label: dayDescription, 
        date,
        isToday: false 
      });
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  useEffect(() => {
    setIsLoaded(true);
    applyFiltersAndSort();
    setTimeout(() => {
      setAnimateCards(true);
    }, 300);
  }, [auctions]);

  const applyFiltersAndSort = () => {
    let filtered = [...auctions];
    if (currencyFilter !== 'all') {
      filtered = filtered.filter(auction => auction.betType === currencyFilter);
    }
    if (dateFilter !== 'all') {
      filtered = filtered.filter(auction => {
        const auctionDate = new Date(auction.gameDate);
        const filterDate = new Date(dateFilter);
        return (
          auctionDate.getFullYear() === filterDate.getFullYear() &&
          auctionDate.getMonth() === filterDate.getMonth() &&
          auctionDate.getDate() === filterDate.getDate()
        );
      });
    }
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'highValue':
          return b.betSize - a.betSize;
        case 'lowValue':
          return a.betSize - b.betSize;
        case 'highMultiplier':
          return b.multiplier - a.multiplier;
        case 'lowMultiplier':
          return a.multiplier - b.multiplier;
        default:
          return 0;
      }
    });
    setDisplayedAuctions(filtered);
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [sortOrder, currencyFilter, dateFilter]);

  const getAuctionGradient = (auction) => {
    const baseColors = {
      common: ['rgba(73, 191, 162, 0.2)', 'rgba(73, 191, 162, 0)'],
      premium: ['rgba(240, 185, 11, 0.2)', 'rgba(240, 185, 11, 0)']
    };
    return auction.betType === 'premium' 
      ? `radial-gradient(circle at top right, ${baseColors.premium[0]}, ${baseColors.premium[1]} 70%)`
      : `radial-gradient(circle at top right, ${baseColors.common[0]}, ${baseColors.common[1]} 70%)`;
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      animation: isLoaded ? 'fadeIn 0.5s ease-out' : 'none',
    }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        transform: 'perspective(1000px) rotateX(1deg)',
      }}>
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)',
          animation: 'pulse 8s infinite alternate ease-in-out',
          zIndex: 0,
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,209,197,0.1) 0%, rgba(79,209,197,0) 70%)',
          animation: 'pulse 12s infinite alternate-reverse ease-in-out',
          zIndex: 0,
        }}></div>

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="particle"
              style={{
                position: 'absolute',
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              }}
            />
          ))}
        </div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              background: 'rgba(99, 102, 241, 0.15)',
              padding: '12px',
              borderRadius: '50%',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)',
              marginRight: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FaStore style={{ 
                fontSize: '1.8rem',
                color: '#6366F1',
              }} />
            </div>
            <h2 style={{ 
              margin: 0,
              fontSize: '2rem',
              fontWeight: '700',
              background: 'linear-gradient(45deg, #6366F1, #8B5CF6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}>
              Auction House
            </h2>
            <button 
              onClick={() => setShowTips(!showTips)}
              style={{
                marginLeft: 'auto',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                color: '#aaa',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backdropFilter: 'blur(5px)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FaInfoCircle style={{ marginRight: '6px' }} />
              {showTips ? 'Hide Tips' : 'Show Tips'}
            </button>
          </div>
          
          {userData && (
            <div style={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
              padding: '16px',
              background: 'rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.03)',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(73, 191, 162, 0.1)',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(73, 191, 162, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(73, 191, 162, 0.15)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px'
                }}>
                  <img 
                    src={commonIcon} 
                    alt="SBM" 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      filter: 'drop-shadow(0 0 5px rgba(73, 191, 162, 0.5))'
                    }}
                  />
                </div>
                <div>
                  <div style={{ 
                    fontSize: '0.75rem',
                    color: '#888',
                    marginBottom: '2px'
                  }}>
                    SBM Balance
                  </div>
                  <div style={{ 
                    color: '#49bfa2',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    {userData.silver?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(240, 185, 11, 0.1)',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(240, 185, 11, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(240, 185, 11, 0.15)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px'
                }}>
                  <img 
                    src={premiumIcon} 
                    alt="ALU" 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      filter: 'drop-shadow(0 0 5px rgba(240, 185, 11, 0.5))'
                    }}
                  />
                </div>
                <div>
                  <div style={{ 
                    fontSize: '0.75rem',
                    color: '#888',
                    marginBottom: '2px'
                  }}>
                    ALU Balance
                  </div>
                  <div style={{ 
                    color: '#f0b90b',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    {userData.gold?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <AuctionSearch onSearch={onSearch} />
        </div>
      </div>
      
      {showTips && (
        <div style={{
          background: 'rgba(41, 37, 36, 0.6)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.05)',
          animation: 'slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(10px)',
        }}>
          <Tips />
        </div>
      )}
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 5,
        padding: '16px',
        background: 'rgba(30, 30, 30, 0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{ 
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'center',
          }}>
            <FaStore style={{ color: '#6366F1', marginRight: '8px' }} />
            <span style={{ 
              color: '#fff',
              fontWeight: '600'
            }}>
              {displayedAuctions.length}
            </span>
            <span style={{ 
              color: '#aaa',
              marginLeft: '4px',
            }}>
              {displayedAuctions.length === 1 ? 'auction' : 'auctions'}
            </span>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{
            position: 'relative',
            zIndex: 10,
          }}>
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px',
            }}>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  paddingRight: '32px',
                  paddingLeft: '36px',
                  background: 'rgba(41, 37, 36, 0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#ccc',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23ccc' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'calc(100% - 12px) center',
                  transition: 'all 0.2s',
                  boxShadow: dateFilter !== 'all' ? '0 0 10px rgba(99, 102, 241, 0.2)' : 'none',
                  borderColor: dateFilter !== 'all' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.1)',
                }}
              >
                <option value="all">All Dates</option>
                {availableDates.map(date => (
                  <option key={date.value} value={date.value}>
                    {date.label} {date.isToday && '(Today)'}
                  </option>
                ))}
              </select>
              <div style={{
                position: 'absolute',
                left: '0',
                top: '0',
                width: '3px',
                height: '100%',
                background: dateFilter !== 'all' ? 'linear-gradient(to bottom, #6366F1, #8B5CF6)' : 'transparent',
                transition: 'all 0.3s ease',
              }}/>
              <FaCalendarAlt style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: dateFilter !== 'all' ? '#6366F1' : '#777',
                filter: dateFilter !== 'all' ? 'drop-shadow(0 0 3px rgba(99, 102, 241, 0.5))' : 'none',
                pointerEvents: 'none',
                transition: 'all 0.2s ease',
              }} />
            </div>
            
            {dateFilter !== 'all' && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-3px',
                background: '#6366F1',
                color: 'white',
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                animation: 'fadeIn 0.3s ease-out',
              }}>
                {availableDates.find(date => date.value === dateFilter)?.isToday ? 'TODAY' : 
                  dateFilter === availableDates[1]?.value ? 'TOMORROW' : 'UPCOMING'}
              </div>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(41, 37, 36, 0.6)',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <button 
              onClick={() => setCurrencyFilter('all')}
              style={{
                padding: '8px 12px',
                background: currencyFilter === 'all' ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                color: currencyFilter === 'all' ? '#fff' : '#aaa',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
            >
              All
            </button>
            <button 
              onClick={() => setCurrencyFilter('common')}
              style={{
                padding: '8px 12px',
                background: currencyFilter === 'common' ? 'rgba(73, 191, 162, 0.15)' : 'transparent',
                border: 'none',
                color: currencyFilter === 'common' ? '#49bfa2' : '#aaa',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img 
                src={commonIcon} 
                alt="SBM" 
                style={{ 
                  width: '14px', 
                  height: '14px', 
                  marginRight: '4px',
                }}
              />
              SBM
            </button>
            <button 
              onClick={() => setCurrencyFilter('premium')}
              style={{
                padding: '8px 12px',
                background: currencyFilter === 'premium' ? 'rgba(240, 185, 11, 0.15)' : 'transparent',
                border: 'none',
                color: currencyFilter === 'premium' ? '#f0b90b' : '#aaa',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img 
                src={premiumIcon} 
                alt="ALU" 
                style={{ 
                  width: '14px', 
                  height: '14px', 
                  marginRight: '4px',
                }}
              />
              ALU
            </button>
          </div>
          
          <div style={{
            position: 'relative'
          }}>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                padding: '8px 12px',
                paddingRight: '32px',
                paddingLeft: '36px',
                background: 'rgba(41, 37, 36, 0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#ccc',
                fontSize: '0.9rem',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23ccc' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'calc(100% - 12px) center',
                transition: 'all 0.2s',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highValue">Highest Value</option>
              <option value="lowValue">Lowest Value</option>
              <option value="highMultiplier">Highest Multiplier</option>
              <option value="lowMultiplier">Lowest Multiplier</option>
            </select>
            <FaSortAmountDown style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#777',
              pointerEvents: 'none'
            }} />
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
      }}>
        {!displayedAuctions || displayedAuctions.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1',
            padding: '60px 20px', 
            textAlign: 'center',
            background: 'rgba(30, 30, 30, 0.4)',
            borderRadius: '12px',
            border: '1px dashed rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 20px auto',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FaStore style={{
                fontSize: '2rem',
                color: 'rgba(255,255,255,0.1)',
              }} />
            </div>
            <h3 style={{ 
              margin: '0 0 8px 0',
              color: '#aaa',
              fontWeight: '500',
              fontSize: '1.3rem'
            }}>
              No auctions available
            </h3>
            <p style={{ 
              margin: '0 auto',
              maxWidth: '300px',
              color: '#777',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              Try adjusting your filters or check back later for new auctions
            </p>
          </div>
        ) : (
          displayedAuctions.map((auction, index) => (
            <div 
              key={auction._id}
              style={{
                opacity: animateCards ? 1 : 0,
                transform: animateCards ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${0.07 * index}s`,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.zIndex = 2;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.zIndex = 1;
              }}
            >
              {auction.gameNumber && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: auction.gameNumber === 2 ? 'linear-gradient(90deg, #f0b90b, #f59e42)' : 'linear-gradient(90deg, #6366F1, #49bfa2)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  zIndex: 10,
                  letterSpacing: '0.5px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.12)'
                }}>
                  {`Game ${auction.gameNumber}`}
                </div>
              )}
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: getAuctionGradient(auction),
                zIndex: -1,
                opacity: 0.3,
                transition: 'all 0.3s ease',
              }} />
              
              <AuctionCard
                auction={auction}
                currentUserId={currentUserId}
                onBuy={onBuy}
                showBuyButton={true}
                userData={userData}
                isPersonal={false}
              />
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-200px) translateX(100px);
            opacity: 0;
          }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.6); }
          100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.3); }
        }
        
        @keyframes shimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        
        .date-badge {
          background: linear-gradient(45deg, #6366F1, #8B5CF6, #6366F1);
          background-size: 200% 200%;
          animation: shimmer 3s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default AuctionHouse;