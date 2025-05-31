import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/constants';
import { FaCoins, FaTrophy, FaCrown, FaUserAstronaut, FaMedal, FaStar } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import './currencyLeaderboard.css';

const CELEBRATION_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];

const Confetti = ({ active, intense }) => (
  <div className={`confetti-container${active ? ' active' : ''}${intense ? ' intense' : ''}`}>
    {Array.from({ length: intense ? 80 : 30 }).map((_, i) => (
      <div
        key={i}
        className="confetti"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 1.5}s`,
          background: CELEBRATION_COLORS[i % 3],
        }}
      />
    ))}
  </div>
);

const Fireworks = ({ show }) =>
  show ? (
    <div className="fireworks">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`firework firework-${i + 1}`}></div>
      ))}
    </div>
  ) : null;

const getBadge = (rank) => {
  if (rank === 0)
    return (
      <span className="placement-badge champion">
        <FaStar style={{ marginRight: 4 }} />
        Champion
      </span>
    );
  if (rank === 1)
    return (
      <span className="placement-badge runnerup">
        <FaMedal style={{ marginRight: 4 }} />
        Runner Up
      </span>
    );
  if (rank === 2)
    return (
      <span className="placement-badge bronze">
        <FaMedal style={{ marginRight: 4 }} />
        Bronze
      </span>
    );
  return null;
};

const CurrencyLeaderboard = () => {
  const { userData } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState({ sbm: [], alu: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sbm');
  const [showcase, setShowcase] = useState(false); 

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const sbmResponse = await axios.get(`${API_ENDPOINTS.BASE_URL}/leaderboard/sbm`);
        const aluResponse = await axios.get(`${API_ENDPOINTS.BASE_URL}/leaderboard/alu`);
        setLeaderboardData({
          sbm: sbmResponse.data,
          alu: aluResponse.data
        });
      } catch (err) {
        setError('Failed to load leaderboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const activeData = leaderboardData[activeTab];

  let currentUserIndex = -1;
  if (userData && activeData) {
    currentUserIndex = activeData.findIndex(
      (user) => user._id === userData._id || user.username === userData.username
    );
  }
  const isCurrentUserTop3 = currentUserIndex > -1 && currentUserIndex < 3;

  const renderRow = (user, index, currency) => {
    const isTop3 = index < 3;
    const isCurrentUser =
      userData &&
      (user._id === userData._id || user.username === userData.username);

    return (
      <tr
        key={user._id}
        className={
          `currency-leaderboard-row${isTop3 ? ` top${index + 1}` : ''}` +
          (isCurrentUser ? ' currency-leaderboard-current-user' : '') +
          (isCurrentUser && isTop3 ? ' current-user-top3-row' : '')
        }
        style={{
          animationDelay: `${index * 0.03 + 0.2}s`
        }}
      >
        <td className={`currency-leaderboard-rank top${isTop3 ? index + 1 : ''}`}>
          {isTop3 && (
            <span className="crown-anim">
              <FaCrown style={{
                color: CELEBRATION_COLORS[index],
                fontSize: '1.5em',
                filter: `drop-shadow(0 0 8px ${CELEBRATION_COLORS[index]}88)`
              }} />
            </span>
          )}
          {index + 1}
        </td>
        <td className="currency-leaderboard-username" style={{ position: 'relative' }}>
          <span className={isTop3 ? 'username-glow' : ''}>
            {user.username}
            {isCurrentUser && (
              <>
                <span className="current-user-badge">
                  <FaUserAstronaut style={{ marginRight: 4 }} />
                  YOU
                </span>
                {isTop3 && getBadge(index)}
                {isTop3 && <Fireworks show />}
              </>
            )}
          </span>
        </td>
        <td className="currency-leaderboard-balance">
          {currency === 'sbm'
            ? user.silver?.toLocaleString()
            : user.gold?.toLocaleString()}
        </td>
      </tr>
    );
  };

  useEffect(() => {
    if (!userData || !activeData) return;
    const idx = activeData.findIndex(
      (user) => user._id === userData._id || user.username === userData.username
    );
    if (idx > -1 && idx < 3) {
      setShowcase(true);
      const timeout = setTimeout(() => setShowcase(false), 5000); // 5 seconds
      return () => clearTimeout(timeout);
    }
  }, [activeTab, leaderboardData, userData]);

  return (
    <div className="currency-leaderboard-container">
      <div className="currency-leaderboard-title">
        <FaTrophy style={{ color: "#ffd700", fontSize: "2rem" }} />
        Currency Leaderboard
      </div>

      <div className="currency-leaderboard-tabs">
        <button
          className={activeTab === 'sbm' ? 'active' : ''}
          onClick={() => {
            setActiveTab('sbm');
            const idx = leaderboardData.sbm.findIndex(
              (user) => userData && (user._id === userData._id || user.username === userData.username)
            );
            if (idx > -1 && idx < 3) {
              setShowcase(true);
              setTimeout(() => setShowcase(false), 3000);
            }
          }}
        >
          <FaCoins style={{ color: '#49bfa2', marginRight: 6 }} />
          Soybean Meal (SBM)
        </button>
        <button
          className={activeTab === 'alu' ? 'active' : ''}
          onClick={() => {
            setActiveTab('alu');
            const idx = leaderboardData.alu.findIndex(
              (user) => userData && (user._id === userData._id || user.username === userData.username)
            );
            if (idx > -1 && idx < 3) {
              setShowcase(true);
              setTimeout(() => setShowcase(false), 3000);
            }
          }}
        >
          <FaCoins style={{ color: '#f0b90b', marginRight: 6 }} />
          Aluminum (ALU)
        </button>
      </div>

      <Confetti active={activeData && activeData.length > 0} intense={isCurrentUserTop3} />
      {isCurrentUserTop3 && <Fireworks show />}

      {loading && <p style={{ textAlign: 'center', color: '#bbb', padding: 24 }}>Loading leaderboard data...</p>}
      {error && <p style={{ textAlign: 'center', color: '#e53e3e', padding: 24 }}>{error}</p>}

      {!loading && !error && (
        <div className="currency-leaderboard-section" style={{ marginTop: 24 }}>
          <table className="currency-leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {activeData.map((user, index) => {
                const isTop3 = index < 3;
                const isCurrentUser =
                  userData &&
                  (user._id === userData._id || user.username === userData.username);

                // Black out all other rows during showcase
                if (showcase && !isCurrentUser) {
                  return (
                    <tr key={user._id} className="leaderboard-blackout-row">
                      <td colSpan={3}></td>
                    </tr>
                  );
                }

                // Over-the-top celebration for current user
                if (showcase && isCurrentUser) {
                  return (
                    <tr key={user._id} className="leaderboard-showcase-row">
                      <td colSpan={3}>
                        <div className="showcase-crown">
                          <FaCrown size={100} style={{ color: '#fff700', filter: 'drop-shadow(0 0 32px #fff)' }} />
                        </div>
                        <div className="showcase-congrats">CONGRATULATIONS!</div>
                        <div className="showcase-username">
                          <FaUserAstronaut style={{ marginRight: 16, fontSize: 48, color: '#fff' }} />
                          {user.username}
                        </div>
                        <div className="showcase-balance">
                          {activeTab === 'sbm'
                            ? user.silver?.toLocaleString()
                            : user.gold?.toLocaleString()}
                        </div>
                        <div className="showcase-badge">
                          {getBadge(index)}
                        </div>
                        <div className="showcase-flashes">
                          {Array.from({ length: 32 }).map((_, i) => (
                            <div key={i} className="showcase-flash" />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                }

                // Normal row
                return renderRow(user, index, activeTab);
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CurrencyLeaderboard;