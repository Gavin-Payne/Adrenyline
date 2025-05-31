import React, { useState, useEffect } from 'react';
import { formatCurrency, getCurrencyFullName } from '../../utils/currency';
import { FaChartLine, FaGift, FaHistory, FaStar, FaCoins, FaIndustry, FaLeaf } from 'react-icons/fa';
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';
import CommodityChart from './CommodityChart';
import SuccessfulAuctions from './SuccessfulAuctions';

const Dashboard = ({ userData, successfulAuctions, dailyCollected, onDailyCollect }) => {
  const commonBalance = userData?.silver || 0;
  const premiumBalance = userData?.gold || 0;
  
  // Animation states
  const [showAnimation, setShowAnimation] = useState(false);
  const [collectedAnimation, setCollectedAnimation] = useState(false);
  
  const handleCollect = () => {
    setCollectedAnimation(true);
    onDailyCollect();
    setTimeout(() => setCollectedAnimation(false), 1500);
  };
  
  useEffect(() => {
    setShowAnimation(true);
  }, []);

  return (
    <div style={{ 
      padding: '20px',
      animation: showAnimation ? 'fadeIn 0.5s ease-out' : 'none'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.8rem',
          background: 'linear-gradient(45deg, #6366F1, #8B5CF6)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        }}>
          <FaChartLine 
            style={{ 
              marginRight: '10px',
              verticalAlign: 'middle',
              color: '#6366F1'
            }}
          />
          Dashboard
        </h2>
        
        <div style={{
          fontSize: '0.9rem',
          color: '#aaa',
          background: 'rgba(255,255,255,0.05)',
          padding: '6px 12px',
          borderRadius: '20px',
        }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short', 
            day: 'numeric'
          })}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
      }}>
        <div style={{
          backgroundColor: '#2c2c2c',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
          ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
          }
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(73, 191, 162, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <img 
                  src={commonIcon} 
                  alt="SBM"
                  style={{ width: '24px', height: '24px' }}
                />
              </div>
              <h3 style={{ 
                margin: 0,
                color: '#ffffff',
                fontSize: '1.2rem'
              }}>SBM</h3>
            </div>
            
            <p style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              margin: '0',
              color: '#49bfa2',
              textShadow: '0 0 20px rgba(73, 191, 162, 0.3)'
            }}>
              {formatCurrency(commonBalance)}
            </p>
            
            <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '8px 0 0 0' }}>
              Soybean Meal
            </p>
          </div>
          
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(73, 191, 162, 0.2) 0%, rgba(73, 191, 162, 0) 70%)',
            zIndex: 0
          }}></div>
        </div>

        <div style={{
          backgroundColor: '#2c2c2c',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(240, 185, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <img 
                  src={premiumIcon} 
                  alt="ALU"
                  style={{ width: '24px', height: '24px' }}
                />
              </div>
              <h3 style={{ 
                margin: 0,
                color: '#ffffff',
                fontSize: '1.2rem'
              }}>ALU</h3>
            </div>
            
            <p style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              margin: '0',
              color: '#f0b90b',
              textShadow: '0 0 20px rgba(240, 185, 11, 0.3)'
            }}>
              {formatCurrency(premiumBalance)}
            </p>
            
            <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '8px 0 0 0' }}>
              Aluminum
            </p>
          </div>
          
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(240, 185, 11, 0.2) 0%, rgba(240, 185, 11, 0) 70%)',
            zIndex: 0
          }}></div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#2c2c2c', 
        borderRadius: '12px',
        padding: '24px', 
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: collectedAnimation 
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)' 
            : 'none',
          animation: collectedAnimation 
            ? 'pulse 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
            : 'none',
          zIndex: 0
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <FaGift style={{ 
              fontSize: '1.4rem', 
              color: '#6366F1', 
              marginRight: '12px',
              filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))'
            }}/>
            <h3 style={{ 
              marginTop: '0', 
              marginBottom: 0, 
              fontSize: '1.3rem',
              color: '#ffffff' 
            }}>
              Daily Rewards
            </h3>
          </div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '15px', 
            alignItems: 'center',
            marginTop: '15px' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              background: 'rgba(73, 191, 162, 0.1)',
              padding: '8px 12px',
              borderRadius: '8px',
            }}>
              <img 
                src={commonIcon} 
                alt="SBM" 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  marginRight: '8px', 
                  filter: 'drop-shadow(0 0 3px rgba(73, 191, 162, 0.3))'
                }}
              />
              <span style={{ color: '#49bfa2', fontWeight: '500' }}>100 SBM</span>
            </div>
            
            <span style={{ color: '#aaa', fontSize: '1.2rem' }}>+</span>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              background: 'rgba(240, 185, 11, 0.1)',
              padding: '8px 12px',
              borderRadius: '8px',
            }}>
              <img 
                src={premiumIcon} 
                alt="ALU" 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  marginRight: '8px',
                  filter: 'drop-shadow(0 0 3px rgba(240, 185, 11, 0.3))'
                }}
              />
              <span style={{ color: '#f0b90b', fontWeight: '500' }}>10 ALU</span>
            </div>
            
            <button 
              onClick={handleCollect}
              disabled={dailyCollected}
              style={{
                backgroundColor: dailyCollected ? 'rgba(85, 85, 85, 0.5)' : '#6366F1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                marginLeft: 'auto',
                cursor: dailyCollected ? 'not-allowed' : 'pointer',
                opacity: dailyCollected ? 0.7 : 1,
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                boxShadow: dailyCollected 
                  ? 'none' 
                  : '0 0 15px rgba(99, 102, 241, 0.3), 0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {dailyCollected ? (
                <>
                  <FaStar style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Already Collected Today
                </>
              ) : (
                <>
                  <FaCoins style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Collect Daily Reward
                </>
              )}
            </button>
          </div>
          
          {dailyCollected && (
            <div style={{ 
              marginTop: '15px', 
              fontSize: '0.85rem', 
              color: '#aaa',
              display: 'flex',
              alignItems: 'center' 
            }}>
              <FaHistory style={{ marginRight: '6px' }} />
              Next collection available tomorrow
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        marginBottom: '30px',
        animation: showAnimation ? 'slideUp 0.5s ease-out' : 'none',
      }}>
        <h3 style={{ 
          marginBottom: '20px', 
          color: '#ffffff', 
          fontWeight: '600',
          fontSize: '1.2rem'
        }}>
          Market Trends
        </h3>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          <CommodityChart 
            title="Soybean Meal Futures" 
            commodity="soybean_meal"
            color="#4CAF50" 
            secondaryColor="#2E7D32"
            icon={<FaLeaf size={18} />}
          />

          <CommodityChart 
            title="Aluminum Futures" 
            commodity="aluminum"
            color="#29B6F6" 
            secondaryColor="#0288D1"
            icon={<FaIndustry size={18} />}
          />
        </div>
      </div>

      <div style={{ animation: showAnimation ? 'slideUp 0.5s ease-out' : 'none' }}>
        <SuccessfulAuctions 
          successfulAuctions={successfulAuctions} 
          userId={userData?._id} 
        />
      </div>
      
      {/* CSS animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0% {
              opacity: 0;
              transform: scale(0.5);
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 0;
              transform: scale(2);
            }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;