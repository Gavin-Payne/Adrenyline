import React from 'react';
import { formatWithSymbol, formatCurrency } from '../../utils/currency';
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';
import { FaClock } from 'react-icons/fa';

const SuccessfulAuctions = ({ successfulAuctions, userId }) => {

  console.log('SuccessfulAuctions component rendered with:', {
    auctionsCount: successfulAuctions?.length || 0,
    userId: userId,
    firstAuction: successfulAuctions?.[0] || 'None',
    completed: successfulAuctions?.filter(a => a.completed)?.length || 0,
    pending: successfulAuctions?.filter(a => !a.completed)?.length || 0
  });

  if (!successfulAuctions || !Array.isArray(successfulAuctions) || !userId) {
    console.warn('Missing required props:', {
      hasAuctions: !!successfulAuctions,
      isArray: Array.isArray(successfulAuctions),
      hasUserId: !!userId
    });
    return (
      <div style={{
        backgroundColor: '#2c2c2c',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h3>Pending Outcomes</h3>
        <p>No pending auction outcomes available.</p>
      </div>
    );
  }

  const isSameId = (id1, id2) => {
    if (!id1 || !id2) return false;

    const str1 = typeof id1 === 'object' ? id1._id?.toString() || id1.toString() : id1.toString();
    const str2 = typeof id2 === 'object' ? id2._id?.toString() || id2.toString() : id2.toString();
    
    return str1 === str2;
  };

  const pendingAuctions = successfulAuctions?.filter(auction => 
    auction.soldTo && !auction.completed
  ) || [];
  
  console.log(`Filtered ${successfulAuctions.length} auctions down to ${pendingAuctions.length} with pending outcomes`);

  const processedAuctions = pendingAuctions.map(auction => {

    const isSeller = isSameId(auction.user, userId);
    const isBuyer = isSameId(auction.soldTo, userId);

    const totalPot = auction.betSize * auction.multiplier;
    
    const userStake = isSeller 
      ? auction.betSize 
      : auction.betSize * (auction.multiplier - 1);

    const displayCondition = isBuyer ? getOppositeCondition(auction.condition) : auction.condition;

    const gameDateObj = auction.gameDate ? new Date(auction.gameDate) : new Date(auction.date);
    const formattedGameDate = gameDateObj.toLocaleDateString(undefined, { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });

    let countdownText = '';
    const now = new Date();
    const timeUntilGame = gameDateObj - now;
    
    if (timeUntilGame > 0) {
      const days = Math.floor(timeUntilGame / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeUntilGame % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        countdownText = `${days}d ${hours}h until game`;
      } else if (hours > 0) {
        countdownText = `${hours}h until game`;
      } else {
        countdownText = 'Game starting soon';
      }
    } else {
      countdownText = 'Waiting for results';
    }
    
    return {
      ...auction,
      totalPot,
      userStake,
      currency: auction.betType,
      role: isSeller ? 'seller' : 'buyer',
      displayCondition,
      formattedGameDate,
      countdownText
    };
  });

  // Function to get opposite condition for buyers
  function getOppositeCondition(condition) {
    if (!condition) return '';
    
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition === 'over') return 'under';
    if (lowerCondition === 'under') return 'over';
    if (lowerCondition === 'exactly') return 'not exactly';
    if (lowerCondition === 'not exactly') return 'exactly';
    
    return condition; 
  }

  return (
    <div style={{
      backgroundColor: '#2c2c2c',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    }}>
      <h3 style={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '10px',
        marginTop: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <FaClock style={{ color: '#6366F1' }} />
        Pending Outcomes
        <span style={{ 
          fontSize: '0.8rem',
          background: '#6366F1',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          marginLeft: '8px'
        }}>
          {pendingAuctions.length}
        </span>
      </h3>
      
      {processedAuctions.length === 0 ? (
        <p>No pending auction outcomes yet.</p>
      ) : (
        <div style={{
          display: 'grid',
          gap: '15px',
          marginTop: '15px'
        }}>
          {processedAuctions.map((auction, index) => (
            <div 
              key={auction._id || index}
              style={{
                backgroundColor: '#1a1a1a',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '8px'
              }}>
                <p style={{
                  fontWeight: 'bold', 
                  margin: '0',
                  fontSize: '1.05rem',
                  color: '#ffffff'
                }}>
                  {auction.game}
                </p>
                <span style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: '#bbb'
                }}>
                  {auction.formattedGameDate}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div>
                  <p style={{margin: '0 0 6px 0', fontSize: '0.95rem'}}>
                    <span style={{opacity: '0.7'}}>Player:</span> {auction.player}
                  </p>
                  <p style={{
                    margin: '0', 
                    padding: '5px 10px', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    <span style={{textTransform: 'capitalize'}}>{auction.displayCondition}</span> {auction.value} {auction.metric}
                  </p>
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  opacity: '0.7',
                  textAlign: 'right',
                  alignSelf: 'flex-start'
                }}>
                  {auction.role === 'seller' ? 'You created this auction' : 'You bought this auction'}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '6px',
                marginBottom: '12px',
                color: '#8B5CF6',
                fontSize: '0.85rem',
              }}>
                <FaClock size={12} />
                {auction.countdownText}
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                marginTop: '12px'
              }}>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  backgroundColor: 'rgba(76,175,80,0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(76,175,80,0.2)',
                }}>
                  <span style={{fontSize: '0.8rem', marginBottom: '4px', color: '#7cb342'}}>
                    Potential Winnings
                  </span>
                  <span style={{
                    fontSize: '1.2rem', 
                    fontWeight: 'bold',
                    color: '#4caf50',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <img 
                      src={auction.currency === 'premium' || auction.currency === 'gold' ? premiumIcon : commonIcon}
                      alt={auction.currency === 'premium' || auction.currency === 'gold' ? 'ALU' : 'SBM'}
                      style={{ width: '18px', height: '18px', marginRight: '6px' }}
                    />
                    {formatCurrency(auction.totalPot)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  backgroundColor: 'rgba(244,67,54,0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(244,67,54,0.2)',
                }}>
                  <span style={{fontSize: '0.8rem', marginBottom: '4px', color: '#e57373'}}>
                    Your Stake
                  </span>
                  <span style={{
                    fontSize: '1.2rem', 
                    fontWeight: 'bold',
                    color: '#f44336',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <img 
                      src={auction.currency === 'premium' || auction.currency === 'gold' ? premiumIcon : commonIcon}
                      alt={auction.currency === 'premium' || auction.currency === 'gold' ? 'ALU' : 'SBM'}
                      style={{ width: '18px', height: '18px', marginRight: '6px' }}
                    />
                    {formatCurrency(auction.userStake)}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '10px',
                padding: '5px',
                fontSize: '0.8rem',
                color: '#bbb'
              }}>
                <span>Multiplier: <strong>{auction.multiplier}x</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuccessfulAuctions;