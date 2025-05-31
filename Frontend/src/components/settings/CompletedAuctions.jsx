import React from 'react';
import { formatCurrency } from '../../utils/currency';
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';
import { FaCheckCircle, FaTimesCircle, FaHistory, FaCalendarAlt, FaBasketballBall } from 'react-icons/fa';

const CompletedAuctions = ({ successfulAuctions, userId, loading, error }) => {
  // Helper function to compare MongoDB IDs
  const isSameId = (id1, id2) => {
    if (!id1 || !id2) return false;
    const str1 = typeof id1 === 'object' ? id1._id?.toString() || id1.toString() : id1.toString();
    const str2 = typeof id2 === 'object' ? id2._id?.toString() || id2.toString() : id2.toString();
    return str1 === str2;
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#2c2c2c',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #6366F1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <h3 style={{marginTop: '0'}}>Loading Auction History</h3>
        <p style={{color: '#aaa'}}>Please wait while we fetch your past results...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#2c2c2c',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        borderLeft: '4px solid #f44336'
      }}>
        <h3 style={{color: '#f44336', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <FaTimesCircle /> Error Loading Auction History
        </h3>
        <p style={{ color: '#f87171' }}>{error}</p>
      </div>
    );
  }

  const completedAuctions = successfulAuctions?.filter(auction => 
    auction.soldTo && auction.completed
  ) || [];

  if (!successfulAuctions || !Array.isArray(successfulAuctions) || completedAuctions.length === 0) {
    return (
      <div style={{
        backgroundColor: '#2c2c2c',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <FaHistory style={{fontSize: '32px', color: '#8B5CF6', opacity: 0.8}} />
        </div>
        <h3 style={{fontSize: '1.3rem', marginBottom: '8px'}}>No Completed Auctions Yet</h3>
        <p style={{color: '#aaa', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5'}}>
          Completed auctions will appear here once positions have been settled. Check back after games have finished.
        </p>
      </div>
    );
  }

  const processedAuctions = completedAuctions.map(auction => {
    const isUserSeller = isSameId(auction.user, userId);
    const isUserBuyer = isSameId(auction.soldTo, userId);
    const isUserWinner = auction.winner && isSameId(auction.winner, userId);

    function getOppositeCondition(condition) {
      if (!condition) return '';
      const lowerCondition = condition.toLowerCase();
      if (lowerCondition === 'over') return 'under';
      if (lowerCondition === 'under') return 'over';
      if (lowerCondition === 'exactly') return 'not exactly';
      if (lowerCondition === 'not exactly') return 'exactly';
      return condition;
    }

    const displayCondition = isUserBuyer ? getOppositeCondition(auction.condition) : auction.condition;
    const dateObj = new Date(auction.completedAt || auction.date);
    const formattedDate = dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const formattedTime = dateObj.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      ...auction,
      isUserSeller,
      isUserBuyer,
      isUserWinner,
      isRefunded: auction.refunded === true,
      displayCondition,
      formattedDate,
      formattedTime,
      profit: isUserWinner ? auction.totalPot - (isUserSeller ? auction.betSize : 0) : 0,
      loss: !isUserWinner && !auction.refunded ? (isUserSeller ? auction.betSize : auction.betSize * (auction.multiplier - 1)) : 0
    };
  });

  const groupedAuctions = {};
  processedAuctions.forEach(auction => {
    const date = auction.formattedDate;
    if (!groupedAuctions[date]) {
      groupedAuctions[date] = [];
    }
    groupedAuctions[date].push(auction);
  });

  const sortedDates = Object.keys(groupedAuctions).sort((a, b) => {
    return new Date(b) - new Date(a);
  });

  return (
    <div style={{
      backgroundColor: '#2c2c2c',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{
          margin: '0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '1.3rem',
          fontWeight: '600'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaHistory style={{ color: '#6366F1', fontSize: '18px' }} />
          </div>
          Auction History
        </h3>
        <span style={{ 
          fontSize: '0.85rem',
          background: 'rgba(99, 102, 241, 0.15)',
          color: '#8B5CF6',
          padding: '6px 12px',
          borderRadius: '20px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <FaCheckCircle size={14} />
          {processedAuctions.length} Results
        </span>
      </div>
      {sortedDates.map(date => (
        <div key={date} style={{marginBottom: '24px'}}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            color: '#9CA3AF'
          }}>
            <FaCalendarAlt size={14} />
            <span style={{fontWeight: '600', fontSize: '0.9rem'}}>{date}</span>
          </div>
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            {groupedAuctions[date].map((auction, index) => (
              <div 
                key={auction._id || index}
                style={{
                  backgroundColor: auction.isUserWinner ? 'rgba(76,175,80,0.08)' : 
                                 auction.isRefunded ? 'rgba(117, 117, 117, 0.08)' :
                                 'rgba(244,67,54,0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                  boxShadow: auction.isUserWinner ? '0 4px 12px rgba(76,175,80,0.1)' : 
                            auction.isRefunded ? '0 4px 12px rgba(117, 117, 117, 0.1)' :
                            '0 4px 12px rgba(244,67,54,0.1)',
                  border: `1px solid ${auction.isUserWinner ? 'rgba(76,175,80,0.15)' : 
                                    auction.isRefunded ? 'rgba(117, 117, 117, 0.15)' :
                                    'rgba(244,67,54,0.15)'}`
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = auction.isUserWinner ? 
                    '0 8px 24px rgba(76,175,80,0.2)' : 
                    auction.isRefunded ?
                    '0 8px 24px rgba(117, 117, 117, 0.2)' :
                    '0 8px 24px rgba(244,67,54,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = auction.isUserWinner ? 
                    '0 4px 12px rgba(76,175,80,0.1)' : 
                    auction.isRefunded ?
                    '0 4px 12px rgba(117, 117, 117, 0.1)' :
                    '0 4px 12px rgba(244,67,54,0.1)';
                }}
              >
                <div style={{
                  height: '4px',
                  background: auction.isUserWinner ? '#4caf50' : 
                              auction.isRefunded ? '#757575' : 
                              '#f44336',
                  width: '100%'
                }}></div>
                <div style={{padding: '16px'}}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'rgba(30, 30, 30, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FaBasketballBall style={{
                          fontSize: '20px',
                          color: auction.isUserWinner ? '#4caf50' : 
                                auction.isRefunded ? '#757575' : 
                                '#f44336',
                        }} />
                      </div>
                      <div>
                        <div style={{fontWeight: '600', fontSize: '1.1rem'}}>
                          {auction.player}
                        </div>
                        <div style={{
                          fontSize: '0.85rem',
                          color: '#9CA3AF'
                        }}>
                          {auction.game}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: auction.isUserWinner ? 'rgba(76,175,80,0.15)' : 
                                auction.isRefunded ? 'rgba(117,117,117,0.15)' : 
                                'rgba(244,67,54,0.15)',
                      color: auction.isUserWinner ? '#4caf50' : 
                            auction.isRefunded ? '#757575' : 
                            '#f44336',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {auction.isUserWinner && <FaCheckCircle size={14} />}
                      {!auction.isUserWinner && !auction.isRefunded && <FaTimesCircle size={14} />}
                      {auction.isUserWinner ? 'WIN' : auction.isRefunded ? 'REFUND' : 'LOSS'}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    marginBottom: '14px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#9CA3AF',
                        marginBottom: '4px'
                      }}>Prediction</div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '600'
                      }}>
                        <span style={{
                          color: auction.isUserWinner ? '#4caf50' : 
                                auction.isRefunded ? '#757575' : 
                                '#f44336'
                        }}>
                          {auction.displayCondition}
                        </span>
                        <span>{auction.value}</span>
                        <span style={{color: '#9CA3AF'}}>{auction.metric}</span>
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#9CA3AF',
                        marginBottom: '4px'
                      }}>Actual Result</div>
                      <div style={{fontWeight: '600'}}>
                        {auction.actualValue}
                        <span style={{color: '#9CA3AF', marginLeft: '4px'}}>{auction.metric}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#9CA3AF',
                        marginBottom: '4px'
                      }}>
                        {auction.isUserSeller ? "You Created" : "You Bought"}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '600'
                      }}>
                        <img 
                          src={auction.betType === 'premium' || auction.betType === 'gold' ? premiumIcon : commonIcon}
                          alt={auction.betType === 'premium' || auction.betType === 'gold' ? 'ALU' : 'SBM'}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>{auction.betSize} × {auction.multiplier}x</span>
                      </div>
                    </div>
                    {auction.isUserWinner ? (
                      <div style={{
                        background: 'rgba(76,175,80,0.15)',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end'
                      }}>
                        <div style={{fontSize: '0.8rem', color: '#4caf50'}}>Profit</div>
                        <div style={{ 
                          color: '#4caf50', 
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '1.1rem'
                        }}>
                          <img 
                            src={auction.betType === 'premium' || auction.betType === 'gold' ? premiumIcon : commonIcon}
                            alt={auction.betType}
                            style={{ width: '18px', height: '18px' }}
                          />
                          +{formatCurrency(auction.profit)}
                        </div>
                      </div>
                    ) : auction.isRefunded ? (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#757575' }}>Refunded</div>
                        <div style={{ 
                          color: '#757575', 
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px' 
                        }}>
                          <img 
                            src={auction.betType === 'premium' || auction.betType === 'gold' ? premiumIcon : commonIcon}
                            alt={auction.betType}
                            style={{ width: '16px', height: '16px' }}
                          />
                          {formatCurrency(auction.isUserSeller ? auction.betSize : auction.betSize * (auction.multiplier - 1))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#f44336' }}>Loss</div>
                        <div style={{ 
                          color: '#f44336', 
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px' 
                        }}>
                          <img 
                            src={auction.betType === 'premium' || auction.betType === 'gold' ? premiumIcon : commonIcon}
                            alt={auction.betType}
                            style={{ width: '16px', height: '16px' }}
                          />
                          -{formatCurrency(auction.loss)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompletedAuctions;