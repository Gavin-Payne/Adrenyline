import React from 'react';
import PropTypes from 'prop-types'; // Add this import
import AuctionCard from './AuctionCard';
import { gridContainerStyle } from '../../styles/components/layout.styles';

const AuctionGrid = ({ 
  auctions, 
  currentUserId, 
  onBuy, 
  userData,
  isPersonal = false,
  emptyMessage = "No auctions available." 
}) => {
  // Sort auctions by expiration time
  const sortedAuctions = [...auctions].sort(
    (a, b) => new Date(a.expirationTime) - new Date(b.expirationTime)
  );

  if (!auctions.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '20px',
        color: '#999'
      }}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      ...gridContainerStyle, 
      justifyContent: 'center',
      minHeight: '200px' 
    }}>
      {sortedAuctions.map((auction, index) => (
        <AuctionCard
          key={`${auction._id}-${index}`}
          auction={auction}
          currentUserId={currentUserId}
          onBuy={onBuy}
          userData={userData}
          isPersonal={isPersonal}
        />
      ))}
    </div>
  );
};

AuctionGrid.propTypes = {
  auctions: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    game: PropTypes.string.isRequired,
    player: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    condition: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    metric: PropTypes.string.isRequired,
    betSize: PropTypes.number.isRequired,
    betType: PropTypes.string.isRequired,
    multiplier: PropTypes.number.isRequired,
    expirationTime: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired,
    soldTo: PropTypes.string
  })).isRequired,
  currentUserId: PropTypes.string,
  onBuy: PropTypes.func,
  userData: PropTypes.object,
  isPersonal: PropTypes.bool,
  emptyMessage: PropTypes.string
};

export default AuctionGrid;