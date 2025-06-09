import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBasketballBall, FaBaseballBall, FaSpinner, FaCalendarAlt, FaSearch, FaFilter, FaSyncAlt } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../utils/constants';

const PlayerBoxScores = ({ token }) => {
  const [activeTab, setActiveTab] = useState('nba');
  const [nbaBoxScores, setNbaBoxScores] = useState([]);
  const [mlbBoxScores, setMlbBoxScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(() => {
    const pacific = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const pacificDate = new Date(pacific);
    return pacificDate.toISOString().split('T')[0]; 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'pts',
    direction: 'desc'
  });
  const [mlbSubTab, setMlbSubTab] = useState('batters');

  // Fetch NBA box scores
  const fetchNbaBoxScores = async (selectedDate = date) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Format the date for API
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
      
      const response = await axios.get(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.BOX_SCORES.ALL}?date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setNbaBoxScores(response.data.data);
      } else {
        setError('Invalid NBA data format received from server');
        setNbaBoxScores([]);
      }
    } catch (err) {
      console.error('Error fetching NBA box scores:', err);
      setError(`Failed to load NBA box scores: ${err.message || 'Unknown error'}`);
      setNbaBoxScores([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch MLB box scores (from the same endpoint as LiveGames)
  const fetchMlbBoxScores = async (selectedDate = date) => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_ENDPOINTS.BASE_URL}/mlb/boxscores?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        setMlbBoxScores(response.data);
      } else {
        setError('Invalid MLB data format received from server');
        setMlbBoxScores([]);
      }
    } catch (err) {
      console.error('Error fetching MLB box scores:', err);
      setError(`Failed to load MLB box scores: ${err.message || 'Unknown error'}`);
      setMlbBoxScores([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when tab/date changes
  useEffect(() => {
    if (activeTab === 'nba') {
      fetchNbaBoxScores();
    } else {
      fetchMlbBoxScores();
    }
    // eslint-disable-next-line
  }, [activeTab, token, date]);

  // Get unique teams for NBA or MLB
  const getUniqueTeams = () => {
    const data = activeTab === 'nba' ? nbaBoxScores : mlbBoxScores;
    if (activeTab === 'nba') {
      return [...new Set(data.map(score => score.teamAbbr))].sort();
    } else {
      // For MLB, assume each box score has a teamName property
      const teams = [];
      data.forEach(game => {
        if (game.homeTeam?.name) teams.push(game.homeTeam.name);
        if (game.awayTeam?.name) teams.push(game.awayTeam.name);
      });
      return [...new Set(teams)].sort();
    }
  };

  // Filter and sort NBA data
  const getSortedAndFilteredNbaData = () => {
    let filteredData = [...nbaBoxScores];
    
    // Apply team filter
    if (selectedTeam) {
      filteredData = filteredData.filter(player => 
        player.teamAbbr && player.teamAbbr.toLowerCase() === selectedTeam.toLowerCase()
      );
    }
    
    // Apply search filter (case insensitive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(player => 
        (player.playerName && player.playerName.toLowerCase().includes(query)) ||
        (player.teamAbbr && player.teamAbbr.toLowerCase().includes(query)) ||
        (player.matchup && player.matchup.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting (handle numeric vs string values appropriately)
    filteredData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle null/undefined values
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Handle numeric vs string comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Default string comparison
      if (String(aValue).toLowerCase() < String(bValue).toLowerCase()) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (String(aValue).toLowerCase() > String(bValue).toLowerCase()) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return filteredData;
  };

  // MLB Table columns
  const mlbBatterColumns = [
    { key: 'name', label: 'Player' },
    { key: 'teamAbbr', label: 'Team' },
    { key: 'matchup', label: 'Matchup' },
    { key: 'date', label: 'Date' },
    { key: 'gameStatus', label: 'Status' },
    { key: 'position', label: 'Pos' },
    { key: 'atBats', label: 'AB' },
    { key: 'hits', label: 'H' },
    { key: 'runs', label: 'R' },
    { key: 'homeRuns', label: 'HR' },
    { key: 'rbi', label: 'RBI' },
    { key: 'walks', label: 'BB' },
    { key: 'strikeOuts', label: 'K' },
    { key: 'avg', label: 'AVG' },
    { key: 'obp', label: 'OBP' },
    { key: 'slg', label: 'SLG' },
    { key: 'ops', label: 'OPS' }
  ];

  const mlbPitcherColumns = [
    { key: 'name', label: 'Player' },
    { key: 'teamAbbr', label: 'Team' },
    { key: 'matchup', label: 'Matchup' },
    { key: 'date', label: 'Date' },
    { key: 'gameStatus', label: 'Status' },
    { key: 'inningsPitched', label: 'IP' },
    { key: 'hitsAllowed', label: 'H' },
    { key: 'earnedRuns', label: 'ER' },
    { key: 'strikeOuts', label: 'K' },
    { key: 'baseOnBalls', label: 'BB' },
    { key: 'pitchesThrown', label: 'Pitches' },
    { key: 'era', label: 'ERA' }
  ];

  // Helper to get status label
  const getGameStatus = (player) => {
    const status = (player.gameStatus || '').toLowerCase();
    if (status === 'final') return 'Final';
    if (status === 'live') return 'Live';
    if (status === 'delayed') return 'Delayed';
    if (status === 'postponed') return 'Postponed';
    if (status === 'scheduled') return 'Scheduled';
    if (status) return status.charAt(0).toUpperCase() + status.slice(1);
    if (player.gameFinished === true) return 'Final';
    if (player.gameFinished === false) return 'Live';
    return '';
  };

  const getSortedAndFilteredMlbData = () => {
    let players = [...mlbBoxScores]; 
    if (mlbSubTab === 'pitchers') {
      players = players.filter(p => p.type === 'pitcher');
    } else {
      players = players.filter(p => p.type === 'batter');
    }

    // Team filter
    if (selectedTeam) {
      players = players.filter(player =>
        player.team && player.team.toLowerCase() === selectedTeam.toLowerCase()
      );
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      players = players.filter(player =>
        (player.playerName && player.playerName.toLowerCase().includes(query)) ||
        (player.team && player.team.toLowerCase().includes(query)) ||
        (player.matchup && player.matchup.toLowerCase().includes(query))
      );
    }
    // Sort
    players.sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (String(aValue).toLowerCase() < String(bValue).toLowerCase()) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (String(aValue).toLowerCase() > String(bValue).toLowerCase()) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return players;
  };

  const uniqueTeams = getUniqueTeams();
  const sortedAndFilteredData = activeTab === 'nba'
    ? getSortedAndFilteredNbaData()
    : getSortedAndFilteredMlbData();

  // Tab button styles
  const tabBtn = (active) => ({
    padding: '10px 24px',
    border: 'none',
    borderBottom: active ? '3px solid #6366F1' : '3px solid transparent',
    background: 'none',
    color: active ? '#6366F1' : '#aaa',
    fontWeight: active ? 700 : 400,
    fontSize: '1.1rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s'
  });

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const fetchBoxScores = () => {
    if (activeTab === 'nba') {
      fetchNbaBoxScores();
    } else {
      fetchMlbBoxScores();
    }
  };

  return (
    <div style={{
      padding: '20px',
      background: '#1A1F2C',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid rgba(255,255,255,0.05)',
      animation: 'fadeIn 0.5s ease-out',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
        <button style={tabBtn(activeTab === 'nba')} onClick={() => setActiveTab('nba')}>
          <FaBasketballBall style={{ marginRight: 8 }} /> NBA
        </button>
        <button style={tabBtn(activeTab === 'mlb')} onClick={() => setActiveTab('mlb')}>
          <FaBaseballBall style={{ marginRight: 8 }} /> MLB
        </button>
      </div>

      {/* MLB Sub-tabs (Batters/Pitchers) */}
      {activeTab === 'mlb' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
          <button
            style={{
              padding: '8px 20px',
              border: 'none',
              borderBottom: mlbSubTab === 'batters' ? '2px solid #6366F1' : '2px solid transparent',
              background: 'none',
              color: mlbSubTab === 'batters' ? '#6366F1' : '#aaa',
              fontWeight: mlbSubTab === 'batters' ? 700 : 400,
              fontSize: '1rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => setMlbSubTab('batters')}
          >
            Batters
          </button>
          <button
            style={{
              padding: '8px 20px',
              border: 'none',
              borderBottom: mlbSubTab === 'pitchers' ? '2px solid #6366F1' : '2px solid transparent',
              background: 'none',
              color: mlbSubTab === 'pitchers' ? '#6366F1' : '#aaa',
              fontWeight: mlbSubTab === 'pitchers' ? 700 : 400,
              fontSize: '1rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => setMlbSubTab('pitchers')}
          >
            Pitchers
          </button>
        </div>
      )}

      {/* Header and Filters (same as before) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px',
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          color: '#ffffff'
        }}>
          <FaBasketballBall 
            style={{ 
              marginRight: '12px',
              color: '#FF8800'
            }} 
          />
          Player Box Scores
        </h2>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '8px 12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <FaCalendarAlt style={{ color: '#aaa', marginRight: '8px' }} />
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            />
          </div>
          
          <button
            onClick={() => fetchBoxScores()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#8183f4',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
            }}
          >
            <FaSyncAlt style={{ marginRight: '6px' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{
          position: 'relative',
          flex: '1',
          minWidth: '200px',
          maxWidth: '400px'
        }}>
          <FaSearch style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#a0aec0'
          }} />
          <input
            type="text"
            placeholder="Search players or teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 38px',
              fontSize: '1rem',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.2)',
              color: '#fff',
              outline: 'none',
            }}
          />
        </div>

        {/* Team Filter */}
        <div style={{
          position: 'relative',
          minWidth: '180px',
        }}>
          <FaFilter style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#a0aec0',
            pointerEvents: 'none'
          }} />
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 38px',
              appearance: 'none',
              fontSize: '1rem',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.2)',
              color: '#fff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Teams</option>
            {uniqueTeams.map((team, index) => (
              <option key={index} value={team}>{team}</option>
            ))}
          </select>
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#a0aec0'
          }}>
            ▼
          </div>
        </div>
      </div>

      {/* Data Display */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            color: '#a0aec0'
          }}>
            <FaSpinner style={{
              animation: 'spin 1s linear infinite',
              marginRight: '10px',
              fontSize: '1.2rem'
            }} />
            Loading box scores...
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : error ? (
          <div style={{
            padding: '20px',
            color: '#f56565',
            textAlign: 'center'
          }}>
            {error}
          </div>
        ) : sortedAndFilteredData.length === 0 ? (
          <div style={{
            padding: '20px',
            color: '#a0aec0',
            textAlign: 'center'
          }}>
            No box scores found for this date.
          </div>
        ) : (
          <div style={{
            overflowX: 'auto',
            width: '100%'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{
                  background: 'rgba(0,0,0,0.3)',
                  color: '#cbd5e0',
                  textAlign: 'left',
                  fontWeight: '600',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {(activeTab === 'nba'
                    ? [
                        'Player', 'Team', 'Matchup', 'Date', 'W/L', 'MIN', 'PTS', 'FGM', 'FGA', 'FG%', '3PM', '3PA', '3P%', 'FTM', 'FTA', 'FT%', 'REB', 'AST', 'STL', 'BLK', 'TOV', 'PF', '+/-'
                      ]
                    : (mlbSubTab === 'batters' ? mlbBatterColumns : mlbPitcherColumns).map(col => col.label)
                  ).map((label, idx) => (
                    <th key={idx} style={{ padding: '12px 16px' }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredData.map((player, index) => (
                  <tr key={index} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    transition: 'background 0.2s',
                  }}>
                    {activeTab === 'nba' ? (
                      <>
                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>{player.playerName}</td>
                        <td style={{ padding: '12px 16px' }}>{player.teamAbbr}</td>
                        <td style={{ padding: '12px 16px' }}>{player.matchup}</td>
                        <td style={{ padding: '12px 16px' }}>{player.date}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: player.winLoss === 'W' ? '#4ade80' : '#f87171' }}>{player.winLoss}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.min}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: player.pts >= 20 ? '#4ade80' : player.pts >= 10 ? '#fcd34d' : '#fff' }}>{player.pts}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.fgm}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.fga}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.fgp ? (player.fgp).toFixed(1) : '-'}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.tpm}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.tpa}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.tpp ? (player.tpp).toFixed(1) : '-'}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.ftm}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.fta}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.ftp ? (player.ftp).toFixed(1) : '-'}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: player.reb >= 10 ? '700' : '400', color: player.reb >= 10 ? '#4ade80' : '#fff' }}>{player.reb}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: player.ast >= 10 ? '700' : '400', color: player.ast >= 10 ? '#4ade80' : '#fff' }}>{player.ast}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: player.stl >= 3 ? '700' : '400', color: player.stl >= 3 ? '#4ade80' : '#fff' }}>{player.stl}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: player.blk >= 3 ? '700' : '400', color: player.blk >= 3 ? '#4ade80' : '#fff' }}>{player.blk}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.tov}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{player.pf}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: player.plusMinus > 0 ? '#4ade80' : player.plusMinus < 0 ? '#f87171' : '#fff' }}>{player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}</td>
                      </>
                    ) : (
                      (mlbSubTab === 'batters' ? mlbBatterColumns : mlbPitcherColumns).map(col => (
                        <td key={col.key} style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {col.key === 'era'
                            ? (player.era !== undefined && player.era !== null && player.era !== '' ? player.era : '-')
                            : (col.key === 'gameStatus'
                                ? getGameStatus(player)
                                : (player[col.key] !== undefined ? player[col.key] : '-'))}
                        </td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerBoxScores;