import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrophy, FaExchangeAlt, FaCoins, FaHistory, FaQuestionCircle } from 'react-icons/fa';
import { colors, spacing } from '../../styles/theme';
import { API_ENDPOINTS } from '../../utils/constants';
import CompletedAuctions from './CompletedAuctions';
import { motion } from 'framer-motion';

const Settings = ({ userData, token, successfulAuctions }) => {
  const [completedAuctions, setCompletedAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCompletedAuctions();
    }
  }, [token]);

  const fetchCompletedAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_ENDPOINTS.BASE_URL}/auctions/completed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(response.data)) {
        setCompletedAuctions(response.data);
      } else {
        setCompletedAuctions([]);
      }
    } catch (err) {
      setError(`Failed to load completed auctions: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateWinRate = () => {
    if (!userData) return '0%';
    const wins = userData.wins || 0;
    const losses = userData.losses || 0;
    const total = wins + losses;
    if (total === 0) return '0%';
    return `${Math.round((wins / total) * 100)}%`;
  };
  
  const modernHeadingStyle = {
    color: colors.text.primary,
    fontSize: '1.8rem',
    marginBottom: spacing.lg,
    fontWeight: 600,
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: spacing.sm,
    display: 'inline-block'
  };
  
  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: spacing.lg,
    marginBottom: spacing.xl
  };
  
  const statStyle = {
    backgroundColor: colors.background.elevated,
    borderRadius: '12px',
    padding: spacing.lg,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    border: `1px solid ${colors.border}`,
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-5px)'
    },
    minHeight: '160px'
  };
  
  const completedAuctionStyle = {
    backgroundColor: colors.background.elevated,
    borderRadius: '12px',
    padding: spacing.md,
    marginBottom: spacing.md,
    border: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  
  const winStyle = {
    color: '#4ade80',
    fontWeight: 'bold'
  };
  
  const lossStyle = {
    color: '#f87171',
    fontWeight: 'normal'
  };

  const settingSectionStyle = {
    backgroundColor: colors.background.elevated,
    borderRadius: '12px',
    padding: spacing.lg,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    border: `1px solid ${colors.border}`,
    marginBottom: spacing.xl
  };

  const settingHeadingStyle = {
    color: colors.text.highlight,
    fontSize: '1.5rem',
    marginBottom: spacing.md,
    display: 'flex',
    alignItems: 'center'
  };

  const settingButtonStyle = {
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: `${spacing.sm} ${spacing.md}`,
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.2s, color 0.2s'
  };

  const settingDescriptionStyle = {
    marginTop: spacing.md,
    color: colors.text.secondary
  };

  if (!userData) {
    return (
      <div style={{ 
        padding: spacing.lg,
        textAlign: 'center',
        backgroundColor: colors.background.elevated,
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          margin: '0 auto 20px',
          border: `3px solid ${colors.border}`,
          borderTopColor: colors.primary,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading user profile...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: spacing.lg }}>
      <h2 style={modernHeadingStyle}>Settings & Statistics</h2>

      <div style={statsGridStyle}>
        <div style={statStyle}>
          <h3 style={{ color: colors.text.highlight }}>
            <FaCoins style={{ marginRight: spacing.sm }} /> Currency
          </h3>
          <p>SBM: ○ {userData?.silver?.toFixed(2) || '0.00'}</p>
          <p>ALU: ✦ {userData?.gold?.toFixed(2) || '0.00'}</p>
        </div>

        <div style={statStyle}>
          <h3 style={{ color: colors.text.highlight }}>
            <FaTrophy style={{ marginRight: spacing.sm }} /> Trading Stats
          </h3>
          <p>Wins: {userData?.wins || 0}</p>
          <p>Losses: {userData?.losses || 0}</p>
          <p>Win Rate: {calculateWinRate()}</p>
          <p>Total Transactions: {userData?.transactions || 0}</p>
          <p>Total Winnings: ○ {userData?.winnings ? userData.winnings.toFixed(2) : '0.00'}</p>
        </div>

        <div style={statStyle}>
          <h3 style={{ color: colors.text.highlight }}>
            <FaExchangeAlt style={{ marginRight: spacing.sm }} /> Account Info
          </h3>
          <p>Username: {userData?.username || 'N/A'}</p>
          <p>Email: {userData?.email || 'Not set'}</p>
          <p>Member Since: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
      <CompletedAuctions 
        successfulAuctions={successfulAuctions} 
        userId={userData?._id} 
        loading={false}
        error={null}
      />
      <div style={settingSectionStyle}>
        <h3 style={settingHeadingStyle}>
          <FaQuestionCircle style={{ marginRight: '10px' }} />
          Help & Tutorial
        </h3>
        
        <motion.button
          style={settingButtonStyle}
          whileHover={{ backgroundColor: '#6366F1', color: '#fff' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            localStorage.removeItem('tutorialCompleted');
            window.location.reload(); // Reload to trigger tutorial
          }}
        >
          Restart Tutorial
        </motion.button>
        
        <p style={settingDescriptionStyle}>
          View the tutorial again to learn about the platform's features.
        </p>
      </div>
    </div>
  );
};

export default Settings;