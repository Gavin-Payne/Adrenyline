import React, { useState } from 'react';

// Layout Components
import Layout from './layout/Layout';
import Dashboard from './dashboard/Dashboard';
import TradingInterface from './trading/TradingInterface';
import AuctionHouse from './auctions/AuctionHouse';
import ActiveAuctions from './auctions/ActiveAuctions';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import Settings from './settings/Settings';
import PlayerBoxScores from './results/playerBoxScores';
import LiveGames from './LiveGames/LiveGames';
import InAppPurchases from './shop/InAppPurchases';
import AnimatedBackground from './layout/AnimatedBackground';
import TutorialManager from './tutorial/TutorialManager';
import CurrencyLeaderboard from './leaderboard/currencyLeaderboard';

// Custom Hooks
import { useAuth } from '../hooks/useAuth';
import { useAuctions } from '../hooks/useAuctions';
import { useCurrency } from '../hooks/useCurrency';

import { 
  darkAppStyle, 
  darkHeaderStyle,
  darkContainerStyle,
  darkSubscriptButtonStyle,
  interfaceContainerStyle
} from '../styles/components/app.styles';

function App() { 
  const { 
    token, 
    userData, 
    login, 
    logout, 
    refreshUserData
  } = useAuth();

  const {
    allAuctions,
    activeAuctions,
    successfulAuctions,
    handleSearch,
    handleBuyAuction,
    handleCreateAuction
  } = useAuctions(token);

  const {
    dailyCollected,
    handleDailyAllowance
  } = useCurrency(token);

  const [activeTab, setActiveTab] = useState(0);
  const [isSignUp, setIsSignUp] = useState(false);
  const [forceShowTutorial, setForceShowTutorial] = useState(false);

  // Render the appropriate content based on selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Dashboard 
            userData={userData}
            successfulAuctions={successfulAuctions}
            dailyCollected={dailyCollected}
            onDailyCollect={handleDailyAllowance}
          />
        );
      case 1:
        return (
          <TradingInterface 
            onSubmit={handleCreateAuction}
            userData={userData}
            token={token}
          />
        );
      case 2:
        return (
          <ActiveAuctions 
            auctions={activeAuctions}
            currentUserId={userData?._id}
            token={token}
          />
        );
      case 3:
        return (
          <AuctionHouse
            auctions={allAuctions}
            currentUserId={userData?._id}
            onBuy={handleBuyAuction}
            onSearch={handleSearch}
            userData={userData}
            token={token}
          />
        );
      case 4:
        return (
          <Settings 
            userData={userData} 
            token={token}
            successfulAuctions={successfulAuctions}
          />
        );
      case 5:
        return (
          <PlayerBoxScores 
            token={token}
          />
        );
      case 6:
        return <LiveGames />;
      case 7:
        return <CurrencyLeaderboard />;
      case 8:
        return <InAppPurchases />;
      default:
        return null;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <AnimatedBackground />
      {token ? (
        <>
          <Layout
            token={token}
            userData={userData}
            onLogout={logout}
            currentTab={activeTab}
            onTabChange={setActiveTab}
          >
            <div style={{
              ...interfaceContainerStyle,
              position: 'relative',
              zIndex: 2,
              backgroundColor: 'transparent'
            }}>
              {renderTabContent()}
            </div>
          </Layout>
          <TutorialManager 
            activeTab={activeTab} 
            onChangeTab={setActiveTab} 
            forceShow={forceShowTutorial}
            userData={userData}
            refreshUserData={refreshUserData}
          />
        </>
      ) : (
        <div style={{
          ...darkAppStyle,
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent'
        }}>
          <AnimatedBackground />
          <div style={{
            position: 'relative',
            zIndex: 3,
            textAlign: 'center',
            padding: '40px 0'
          }}>
            <h1 style={{
              ...darkHeaderStyle,
              textShadow: '0 2px 15px rgba(0,0,0,0.5)',
              background: 'linear-gradient(45deg, #6366F1, #8B5CF6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Adrenyline</h1>
            <div style={{
              ...darkContainerStyle,
              backgroundColor: 'rgba(28, 28, 40, 0.7)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}>
              {isSignUp ? (
                <SignUp setToken={login} />
              ) : (
                <SignIn setToken={login} />
              )}
              <p style={{ textAlign: 'center', marginTop: '10px', color: '#ccc' }}>
                {isSignUp ? (
                  <span>
                    Already have an account?{' '}
                    <button onClick={() => setIsSignUp(false)} style={darkSubscriptButtonStyle}>
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    Don't have an account?{' '}
                    <button onClick={() => setIsSignUp(true)} style={darkSubscriptButtonStyle}>
                      Sign Up
                    </button>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
export default App;
