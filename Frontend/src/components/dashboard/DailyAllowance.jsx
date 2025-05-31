import React from 'react';
import { formatWithSymbol } from '../../utils/currency';
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';

const DailyAllowance = ({ dailyCollected, onCollect }) => {
  
  // Define the new allowance amounts
  const commonAllowance = 100;
  const premiumAllowance = 10;
  
  return (
    <div style={{
      backgroundColor: '#2c2c2c',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3>Daily Allowance</h3>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '10px'
      }}>
        <div>
          <p style={{ display: 'flex', alignItems: 'center' }}>
            Collect your daily: 
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              marginLeft: '8px',
              backgroundColor: 'rgba(73, 191, 162, 0.1)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              <img src={commonIcon} alt="SBM" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
              <span style={{ color: '#49bfa2' }}>{formatWithSymbol(commonAllowance, 'common')}</span>
            </span>
            <span style={{ margin: '0 8px' }}>&</span>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              backgroundColor: 'rgba(240, 185, 11, 0.1)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              <img src={premiumIcon} alt="ALU" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
              <span style={{ color: '#f0b90b' }}>{formatWithSymbol(premiumAllowance, 'premium')}</span>
            </span>
          </p>
        </div>
        <button
          onClick={onCollect}
          disabled={dailyCollected}
          style={{
            backgroundColor: dailyCollected ? '#666' : '#4caf50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: dailyCollected ? 'not-allowed' : 'pointer'
          }}
        >
          {dailyCollected ? 'Already Collected' : 'Collect'}
        </button>
      </div>
    </div>
  );
};

export default DailyAllowance;