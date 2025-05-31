import React from 'react';
import AuctionCard from './AuctionCard';
import { tabContentStyle, gridContainerStyle } from '../../styles/components/layout.styles';

const ActiveAuctions = ({ auctions, currentUserId }) => {
  return (
    <div style={tabContentStyle}>
      <h2>Active Auctions</h2>
      <div style={{ ...gridContainerStyle, justifyContent: 'center' }}>
        {auctions.length === 0 ? (
          <p>No active auctions.</p>
        ) : (
          auctions.map((auction, index) => (
            <AuctionCard 
              key={index}
              auction={auction}
              currentUserId={currentUserId}
              isPersonal={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveAuctions;