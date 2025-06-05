import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt, FaUsers, FaUserAlt, FaChartLine, FaClock, FaCoins, FaPercent, FaInfoCircle, FaBasketballBall, FaBaseballBall } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import BetSuggestions from './BetSuggestions';
import GameSelector from './GameSelector';
import { 
  modernInputStyle, 
  modernSelectStyle
} from '../../styles/components/forms.styles';
import {
  enhancedFormStyle,
  formGroupStyle,
  labelStyle,
  iconStyle,
  sectionStyle,
  sectionTitleStyle,
  formTitleStyle,
  betAmountContainerStyle,
  betAmountLabelStyle,
  betAmountIconStyle,
  betInputContainerStyle,
  betInputWrapperStyle,
  betInputStyle,
  currencyDropdownContainerStyle,
  currencyDropdownStyle,
  dropdownArrowStyle,
  balanceContainerStyle,
  balanceLabelStyle,
  balanceAmountContainerStyle,
  currencyIconStyle,
  quickAmountButtonsContainerStyle,
  quickAmountButtonStyle,
  potentialWinningsContainerStyle,
  potentialWinningsAmountStyle,
  betSummaryContainerStyle,
  betSummaryTitleStyle,
  betSummaryTextStyle,
  errorContainerStyle,
  submitButtonStyle,
  submitButtonDisabledStyle,
  metricsGridStyle,
  metricsLabelStyle
} from '../../styles/components/auctionForm.styles';
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';
import { DateTime } from 'luxon';
import api from '../../services/api';

const colors = {
  primary: '#6366F1',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  text: {
    primary: '#FFFFFF',
    secondary: '#AAAAAA',
    disabled: '#777777'
  },
  background: {
    main: '#121212',
    elevated: '#1E1E1E',
    hover: '#2A2A2A'
  }
};

const CURRENCY_NAMES = {
  common: 'SBM',
  premium: 'ALU'
};

const AuctionForm = ({ onSubmit, userData, token }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('over');
  const [metricValue, setMetricValue] = useState('');
  const [betType, setBetType] = useState('common');
  const [betSize, setBetSize] = useState('');
  const [multiplier, setMultiplier] = useState(2.0);
  const [duration, setDuration] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [potentialWinnings, setPotentialWinnings] = useState(0);
  const [activeSection, setActiveSection] = useState(1);
  const [multiplierInputFocused, setMultiplierInputFocused] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [selectedSport, setSelectedSport] = useState('nba');
  const [mlbCategory, setMlbCategory] = useState('hitting');

  const [gameNumber, setGameNumber] = useState('1');
  const [isDoubleheader, setIsDoubleheader] = useState(false);

  const [availableGames, setAvailableGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState('');

  const uniqueGames = React.useMemo(() => {
    const baseNames = {};
    (availableGames || []).forEach(g => {
      const display = getGameDisplay(g);
      const base = display.replace(/\s*\(Game 2\)/i, '').trim();
      if (!baseNames[base]) baseNames[base] = [];
      baseNames[base].push(g);
    });
    return Object.keys(baseNames);
  }, [availableGames]);

  useEffect(() => {
    if (!selectedGame) {
      setIsDoubleheader(false);
      setGameNumber('1');
      return;
    }
    const base = getGameDisplay(selectedGame).replace(/\s*\(Game 2\)/i, '').trim();
    const matches = (availableGames || []).filter(g => getGameDisplay(g).replace(/\s*\(Game 2\)/i, '').trim() === base);
    setIsDoubleheader(matches.length > 1);
    setGameNumber('1');
  }, [selectedGame, availableGames]);

  useEffect(() => {
    if (betSize && multiplier) {
      const winnings = betSize * multiplier;
      setPotentialWinnings(winnings);
    } else {
      setPotentialWinnings(0);
    }
  }, [betSize, multiplier]);
  
  const validateFunds = () => {
    if (!userData) return false;
    
    if (betType === 'premium' && betSize > userData.gold) {
      setFormError('You do not have enough ALU for this bet.');
      return false;
    }
    
    if (betType === 'common' && betSize > userData.silver) {
      setFormError('You do not have enough SBM for this bet.');
      return false;
    }
    
    return true;
  };

  const fetchPlayers = useCallback(async (game) => {
    if (!selectedDate) {
      setFormError('Please select a date first.');
      setAvailablePlayers([]);
      return;
    }
    try {
      setLoading(true);
      setFormError('');
      const teams = game.split(' vs ');
      if (teams.length !== 2) {
        setFormError('Invalid game format');
        setAvailablePlayers([]);
        setLoading(false);
        return;
      }
      let team1Players = [];
      let team2Players = [];
      if (selectedSport === 'mlb') {
        const [team1Res, team2Res] = await Promise.all([
          api.get(`/mlb/players/${encodeURIComponent(teams[0])}?category=${mlbCategory}&date=${selectedDate}`),
          api.get(`/mlb/players/${encodeURIComponent(teams[1])}?category=${mlbCategory}&date=${selectedDate}`)
        ]);
        team1Players = team1Res.data;
        team2Players = team2Res.data;
      } else {
        const categoryParam = selectedSport === 'nba' ? '' : `&category=${mlbCategory}`;
        const [team1Res, team2Res] = await Promise.all([
          api.get(`/players/${encodeURIComponent(teams[0])}?sport=${selectedSport}${categoryParam}`),
          api.get(`/players/${encodeURIComponent(teams[1])}?sport=${selectedSport}${categoryParam}`)
        ]);
        team1Players = team1Res.data;
        team2Players = team2Res.data;
      }
      const normalizePlayers = arr => arr.map(p => typeof p === 'string' ? { name: p } : p);
      if (Array.isArray(team1Players) && Array.isArray(team2Players)) {
        setAvailablePlayers([
          ...normalizePlayers(team1Players),
          ...normalizePlayers(team2Players)
        ]);
      } else {
        setFormError('Invalid player data received');
        setAvailablePlayers([]);
      }
    } catch (error) {
      setFormError(`Failed to load players: ${error.message}`);
      setAvailablePlayers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSport, mlbCategory, token, selectedDate]);

  useEffect(() => {
    if (selectedDate && selectedSport === 'mlb') {
      setGamesLoading(true);
      setGamesError('');
      setAvailableGames([]);
      setSelectedGame(null);
      setSelectedPlayer('');
      const fetchGames = async () => {
        try {
          const response = await api.get(`/mlb/games?date=${selectedDate}`);
          const data = response.data;
          if (Array.isArray(data) && data.length > 0) {
            setAvailableGames(data);
          } else {
            setAvailableGames([]);
            setGamesError('No games found for this date.');
          }
        } catch (error) {
          setAvailableGames([]);
          setGamesError('Error loading games: ' + error.message);
        } finally {
          setGamesLoading(false);
        }
      };
      fetchGames();
    }
  }, [selectedDate, selectedSport, token]);

  useEffect(() => {
    if (selectedGame && selectedDate) {
      fetchPlayers(getGameDisplay(selectedGame));
    }
  }, [selectedGame, selectedSport, mlbCategory, fetchPlayers, selectedDate]);

  useEffect(() => {
    setSelectedGame(null);
  }, [selectedDate, selectedSport]);

  const handleSportChange = (sport) => {
    setSelectedSport(sport);
    setSelectedGame(null);
    setSelectedPlayer('');
    setAvailableGames([]);
    setGamesError('');
    setGamesLoading(false);
    if (sport === 'mlb') setMlbCategory('hitting');
  };

  const canSelectPlayer = React.useMemo(() => {
    if (!selectedGame) return false;
    if (isDoubleheader && !gameNumber) return false;
    return true;
  }, [selectedGame, isDoubleheader, gameNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!userData) {
      setFormError('User data not available. Please try again or reload the page.');
      return;
    }
    
    if (betSize === '' || parseFloat(betSize) <= 0) {
      setFormError('Please enter a positive bet amount');
      return;
    }
    
    const valueNum = parseFloat(metricValue);
    if (isNaN(valueNum) || valueNum <= 0 || valueNum % 0.5 !== 0) {
      setFormError('Value must be a positive multiple of 0.5 (e.g. 0.5, 1.0, 1.5, etc.)');
      return;
    }
    
    if (!validateFunds()) {
      return;
    }
      
      setLoading(true);
      
      const correctedDate = new Date(selectedDate + 'T12:00:00');
      
      console.log('Date submitted:', {
        selectedDate,
        correctedDate,
        correctedDateISO: correctedDate.toISOString(),
        localDate: correctedDate.toLocaleDateString()
      });

      let finalDuration = duration;
      if (selectedGame) {
        const minutesLeft = getMinutesUntilGame(selectedGame);
        if (parseInt(duration) > minutesLeft) {
          finalDuration = minutesLeft.toString();
        }
      }

      const payload = {
        date: correctedDate.toISOString(),
        gameDate: correctedDate.toISOString(),
        game: getGameDisplay(selectedGame),
        player: selectedPlayer,
        condition: selectedCondition,
        value: metricValue,
        metric: selectedMetric,
        betSize: betSize,
        betType: betType,
        multiplier: multiplier,
        duration: finalDuration,
        sport: selectedSport,
        sportCategory: selectedSport === 'mlb' ? mlbCategory : null
      };
      if (isDoubleheader) payload.gameNumber = parseInt(gameNumber);
      if ('gameNumber' in payload && !payload.gameNumber) delete payload.gameNumber;
      onSubmit(payload)
        .then(() => {
          setSelectedDate('');
          setSelectedGame(null);
          setSelectedPlayer('');
          setSelectedMetric('');
          setMetricValue('');
          setBetSize('');
          setMultiplier(2.0);
          setDuration('');
          setShowSuccessModal(true);
        })
        .catch(err => {
          setFormError(err.message || 'Failed to create auction. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }; 

    const formatCurrency = (value) => {
      return value ? value.toFixed(2) : "0.00";
    };

    const getAmericanOdds = (multiplier) => {
      const mult = parseFloat(multiplier);
      if (isNaN(mult) || mult <= 1) return "N/A";
      
      if (mult >= 2) {
        return `+${Math.round((mult - 1) * 100)}`;
      } else {
        return `-${Math.round(100 / (mult - 1))}`;
      }
    };
    
    const getOddsColor = (odds) => {
      if (odds === "N/A") return colors.text.secondary;
      return odds.startsWith('+') ? colors.success : colors.danger;
    };

    const getDateBoundaries = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayFormatted = today.toISOString().split('T')[0];
      
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 7);
      const maxDateFormatted = maxDate.toISOString().split('T')[0];
      
      return { min: todayFormatted, max: maxDateFormatted };
    };

    const handleSuggestionSelect = (suggestion) => {
      setSelectedGame(suggestion.game);
      setSelectedPlayer(suggestion.player);
      setSelectedMetric(suggestion.metric);
      setSelectedCondition(suggestion.condition);
      setMetricValue(suggestion.value.toString());
      
      setSuggestion(suggestion);
      
      document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
    };

    const metricRanges = {
      points: { min: 0.5, max: 80 },
      rebounds: { min: 0.5, max: 40 },
      assists: { min: 0.5, max: 30 },
      steals: { min: 0.5, max: 15 },
      blocks: { min: 0.5, max: 15 },
      'points + rebounds': { min: 0.5, max: 100 },
      'points + assists': { min: 0.5, max: 100 },
      'points + assists + rebounds': { min: 0.5, max: 120 },
      'assists + rebounds': { min: 0.5, max: 60 },
      'blocks + steals': { min: 0.5, max: 30 },
      hits: { min: 0.5, max: 6.5 },
      walks: { min: 0.5, max: 5.5 },
      strikeouts: { min: 0.5, max: 15.5 },
      'total bases': { min: 0.5, max: 10.5 },
      steals: { min: 0.5, max: 4.5 },
      homeruns: { min: 0.5, max: 4.5 },
      'pitching outs': { min: 0.5, max: 26.5 },
      'earned runs': { min: 0.5, max: 10.5 },
    };

    function getGameDisplay(game) {
      if (!game) return '';
      if (game.displayName) return game.displayName;
      if (game.matchup) return game.matchup;
      if (game.teams) return game.teams;
      if (game.team1 && game.team2) return `${game.team1} vs ${game.team2}`;
      if (game.game_id && typeof game.game_id === 'string') {
        const match = game.game_id.match(/([A-Za-z]+)VS([A-Za-z]+)_/);
        if (match) return `${match[1]} vs ${match[2]}`;
      }
      return game.gameName || game.game || '';
    }

    function getGameStartDateTime(game) {
      const dateStr = game.game_date || game.date;
      const timeStr = (game.game_time || '').replace(' ET', '');
      if (!dateStr || !timeStr) return null;
      return DateTime.fromFormat(`${dateStr} ${timeStr}`, 'yyyy-MM-dd h:mm a', { zone: 'America/New_York' });
    }

    function getMinutesUntilGame(game) {
      const start = getGameStartDateTime(game);
      if (!start || !start.isValid) return 0;
      const now = DateTime.now().setZone('America/New_York');
      const diff = start.diff(now, 'minutes').toObject().minutes;
      return Math.max(0, Math.round(diff));
    }

    const bettableGames = React.useMemo(() => {
      return (availableGames || []).filter(g => getMinutesUntilGame(g) > 0);
    }, [availableGames]);

    const [durationWarning, setDurationWarning] = useState('');
    React.useEffect(() => {
      if (!selectedGame || !duration) {
        setDurationWarning('');
        return;
      }
      const minutesLeft = getMinutesUntilGame(selectedGame);
      if (parseInt(duration) > minutesLeft) {
        setDurationWarning(`Auction duration will be reduced to ${minutesLeft} minutes because the game starts at ${selectedGame.game_time}.`);
      } else {
        setDurationWarning('');
      }
    }, [selectedGame, duration]);

    React.useEffect(() => {
      if (!selectedGame) {
        setAvailablePlayers([]);
        console.log('[AuctionForm] No selectedGame, clearing availablePlayers');
        return;
      }
      if (
        selectedSport === 'mlb' &&
        typeof selectedGame === 'object' &&
        (Array.isArray(selectedGame.team1_batters) || Array.isArray(selectedGame.team2_batters) || selectedGame.team1_pitcher || selectedGame.team2_pitcher)
      ) {
        const batters = [
          ...(Array.isArray(selectedGame.team1_batters) ? selectedGame.team1_batters : []),
          ...(Array.isArray(selectedGame.team2_batters) ? selectedGame.team2_batters : [])
        ];
        const pitchers = [
          selectedGame.team1_pitcher,
          selectedGame.team2_pitcher
        ].filter(Boolean);
        const allPlayers = [
          ...batters.map(name => ({ name })),
          ...pitchers.map(name => ({ name }))
        ];
        setAvailablePlayers(allPlayers);
        console.log('[AuctionForm] Set availablePlayers:', allPlayers, 'from selectedGame:', selectedGame);
      } else {
        setAvailablePlayers([]);
        console.log('[AuctionForm] selectedGame missing MLB player arrays, selectedGame:', selectedGame);
      }
    }, [selectedSport, selectedGame]);

    return (
      <form onSubmit={handleSubmit} style={enhancedFormStyle}>
        <h2 style={formTitleStyle}>
          Create New Auction
        </h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '20px',
          background: 'rgba(0,0,0,0.2)',
          padding: '10px',
          borderRadius: '8px',
        }}> 
          <button
            type="button"
            onClick={() => handleSportChange('nba')}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              background: selectedSport === 'nba' 
                ? 'linear-gradient(135deg, #6366F1, #4F46E5)' 
                : 'rgba(255,255,255,0.1)',
              color: selectedSport === 'nba' ? 'white' : '#aaa',
              fontWeight: selectedSport === 'nba' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FaBasketballBall size={16} />
            NBA
          </button>
          <button
            type="button"
            onClick={() => handleSportChange('mlb')}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              background: selectedSport === 'mlb' 
                ? 'linear-gradient(135deg, #EF4444, #B91C1C)' 
                : 'rgba(255,255,255,0.1)',
              color: selectedSport === 'mlb' ? 'white' : '#aaa',
              fontWeight: selectedSport === 'mlb' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FaBaseballBall size={16} />
            MLB
          </button>
        </div>

        {selectedSport === 'mlb' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '10px',
            marginBottom: '20px',
          }}>
            <button
              type="button"
              onClick={() => setMlbCategory('hitting')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: mlbCategory === 'hitting' 
                  ? 'linear-gradient(135deg, #F59E0B, #D97706)' 
                  : 'rgba(255,255,255,0.1)',
                color: mlbCategory === 'hitting' ? 'white' : '#aaa',
                fontWeight: mlbCategory === 'hitting' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
              }}
            >
              Hitting
            </button>
            <button
              type="button"
              onClick={() => setMlbCategory('pitching')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: mlbCategory === 'pitching' 
                  ? 'linear-gradient(135deg, #10B981, #059669)' 
                  : 'rgba(255,255,255,0.1)',
                color: mlbCategory === 'pitching' ? 'white' : '#aaa',
                fontWeight: mlbCategory === 'pitching' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
              }}
            >
              Pitching
            </button>
          </div>
        )}
        
        <BetSuggestions 
          selectedDate={selectedDate}
          token={token}
          onSuggestionSelect={handleSuggestionSelect}
        />

        <div style={{ margin: '16px 0' }}>
          <label style={labelStyle}>
            <FaCalendarAlt style={iconStyle} /> Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={modernInputStyle}
            min={getDateBoundaries().min}
            max={getDateBoundaries().max}
          />
        </div>

        {selectedSport === 'mlb' && selectedDate && (
          <div style={{ margin: '16px 0' }}>
            <label style={labelStyle}>
              <FaBaseballBall style={iconStyle} /> Select MLB Game
            </label>
            <GameSelector
              games={bettableGames}
              selectedGame={selectedGame}
              onGameChange={setSelectedGame}
              loading={gamesLoading}
              error={gamesError}
              players={availablePlayers}
              selectedPlayer={selectedPlayer}
              onPlayerChange={setSelectedPlayer}
              playersLoading={loading}
              playersError={formError && selectedGame ? formError : ''}
              mlbCategory={mlbCategory} 
            />
          </div>
        )}
        
        <div 
          style={{
            ...sectionStyle,
            border: activeSection === 2 ? `1px solid ${colors.primary}` : '1px solid rgba(255,255,255,0.05)',
            boxShadow: activeSection === 2 ? `0 0 15px rgba(99, 102,241, 0.15)` : 'none',
            transition: 'all 0.3s ease'
          }}
          onClick={() => setActiveSection(2)}
        >
          <h3 style={sectionTitleStyle}>
            <span style={{
              display: 'inline-block', 
              width: '24px',
              height: '24px',
              lineHeight: '24px',
              textAlign: 'center',
              borderRadius: '50%',
              background: activeSection === 2 ? colors.primary : 'rgba(255,255,255,0.1)',
              marginRight: '10px',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}>2</span>
            Performance Metrics
          </h3>
          
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              <FaChartLine style={iconStyle} />
              Performance Prediction
            </label>
            <div style={metricsGridStyle}>
              <div>
                <label style={metricsLabelStyle}>Condition</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  style={{
                    ...modernSelectStyle,
                    height: '46px',
                    fontSize: '1rem',
                  }}
                  required
                >
                  <option value="">Select</option>
                  <option value="Over">Over</option>
                  <option value="Under">Under</option>
                  <option value="Exactly">Exactly</option>
                  <option value="Not Exactly">Not Exactly</option>
                </select>
              </div>

              <div>
                <label style={metricsLabelStyle}>Value</label>
                {!selectedMetric && (
                  <div style={{color: '#f87171', fontSize: 14, marginTop: 4, fontWeight: 500}}>
                    Please select a metric first.
                  </div>
                )}
                {selectedMetric && metricRanges[selectedMetric] && (
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 200}}>
                    <input
                      type="range"
                      min={metricRanges[selectedMetric].min}
                      max={metricRanges[selectedMetric].max}
                      step={0.5}
                      value={metricValue || metricRanges[selectedMetric].min}
                      onChange={e => setMetricValue(parseFloat(e.target.value))}
                      style={{width: 180, marginBottom: 4}}
                    />
                    <input
                      type="number"
                      min={metricRanges[selectedMetric].min}
                      max={metricRanges[selectedMetric].max}
                      step={0.5}
                      value={metricValue || metricRanges[selectedMetric].min}
                      onChange={e => {
                        let val = parseFloat(e.target.value);
                        if (isNaN(val)) val = metricRanges[selectedMetric].min;
                        if (val < metricRanges[selectedMetric].min) val = metricRanges[selectedMetric].min;
                        if (val > metricRanges[selectedMetric].max) val = metricRanges[selectedMetric].max;
                        val = Math.round(val * 2) / 2;
                        setMetricValue(val);
                      }}
                      style={{width: 80, textAlign: 'center', fontWeight: 600, fontSize: 18, color: colors.primary, border: '1px solid #6366F1', borderRadius: 6, padding: 4, background: '#181a25'}}
                    />
                    <div style={{fontWeight: 600, fontSize: 15, color: colors.text.secondary}}>
                      Range: {metricRanges[selectedMetric].min} to {metricRanges[selectedMetric].max} (increments of 0.5)
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={metricsLabelStyle}>Metric</label>
                <select
                  value={selectedMetric}
                  onChange={e => {
                    setSelectedMetric(e.target.value);
                    if (metricRanges[e.target.value]) setMetricValue(metricRanges[e.target.value].min);
                    else setMetricValue('');
                  }}
                  style={{
                    ...modernSelectStyle,
                    height: '46px',
                    fontSize: '1rem',
                  }}
                  required
                >
                  <option value="">Select</option>
                  
                  {selectedSport === 'nba' && (
                    <>
                      <option value="points">Points</option>
                      <option value="rebounds">Rebounds</option>
                      <option value="assists">Assists</option>
                      <option value="steals">Steals</option>
                      <option value="blocks">Blocks</option>
                      <option value="points + rebounds">Points + Rebounds</option>
                      <option value="points + assists">Points + Assists</option>
                      <option value="points + assists + rebounds">P+A+R</option>
                      <option value="assists + rebounds">Assists + Rebounds</option>
                      <option value="blocks + steals">Blocks + Steals</option>
                    </>
                  )}
                  
                  {selectedSport === 'mlb' && mlbCategory === 'hitting' && (
                    <>
                      <option value="hits">Hits</option>
                      <option value="walks">Walks</option>
                      <option value="strikeouts">Strikeouts</option>
                      <option value="total bases">Total Bases</option>
                      <option value="steals">Steals</option>
                      <option value="homeruns">Home Runs</option>
                    </>
                  )}
                  
                  {selectedSport === 'mlb' && mlbCategory === 'pitching' && (
                    <>
                      <option value="walks">Walks</option>
                      <option value="hits">Hits</option>
                      <option value="strikeouts">Strikeouts</option>
                      <option value="pitching outs">Pitching Outs</option>
                      <option value="earned runs">Earned Runs</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div 
          style={{
            ...sectionStyle,
            border: activeSection === 3 ? `1px solid ${colors.primary}` : '1px solid rgba(255,255,255,0.05)',
            boxShadow: activeSection === 3 ? `0 0 15px rgba(99, 102, 241, 0.15)` : 'none',
            transition: 'all 0.3s ease'
          }}
          onClick={() => setActiveSection(3)}
        >
          <h3 style={sectionTitleStyle}>
            <span style={{
              display: 'inline-block', 
              width: '24px',
              height: '24px',
              lineHeight: '24px',
              textAlign: 'center',
              borderRadius: '50%',
              background: activeSection === 3 ? colors.primary : 'rgba(255,255,255,0.1)',
              marginRight: '10px',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}>3</span>
            Betting Details
          </h3>
          
          <div style={{...formGroupStyle, ...betAmountContainerStyle}}>
            <label style={{...labelStyle, ...betAmountLabelStyle}}>
              <FaCoins style={{...iconStyle, ...betAmountIconStyle}} />
              Bet Amount
            </label>
            
            <div style={betInputContainerStyle}>
              <div style={betInputWrapperStyle}>
                <input
                  type="number"
                  placeholder="Enter bet amount"
                  value={betSize === 0 ? '' : betSize}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    
                    const numValue = parseFloat(rawValue);
                    
                    if (rawValue === '') {
                      setBetSize('');
                    } else if (!isNaN(numValue) && numValue > 0) {
                      const decimalPlaces = (rawValue.split('.')[1] || '').length;
                      
                      if (decimalPlaces <= 5) {
                        setBetSize(numValue);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    if (betSize === '' || betSize <= 0) {
                      setBetSize('');
                      setFormError('Please enter a positive bet amount');
                    } else {
                      const formatted = parseFloat(betSize).toFixed(5);
                      const cleanFormatted = parseFloat(formatted);
                      setBetSize(cleanFormatted);
                    }
                  }}
                  min="0.00001"
                  step="0.00001"
                  style={{
                    ...modernInputStyle,
                    ...betInputStyle,
                    borderColor: betSize === '' || betSize <= 0 ? '#F44336' : undefined,
                  }}
                  required
                />
                
                <div style={currencyDropdownContainerStyle}>
                  <select
                    value={betType}
                    onChange={(e) => setBetType(e.target.value)}
                    style={currencyDropdownStyle}
                  >
                    <option value="common">SBM</option>
                    <option value="premium">ALU</option>
                  </select>
                  <div style={dropdownArrowStyle}>▸</div>
                </div>
              </div>

              <div style={{
                fontSize: '0.75rem',
                color: betSize === '' || betSize <= 0 ? '#F44336' : colors.text.secondary,
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FaInfoCircle size={10} />
                <span>Enter a positive amount (up to 5 decimal places)</span>
              </div>
              
              <div style={balanceContainerStyle}>
                <span style={balanceLabelStyle}>Available:</span> 
                <div style={balanceAmountContainerStyle}>
                  <img 
                    src={betType === 'premium' ? premiumIcon : commonIcon}
                    alt={betType === 'premium' ? 'ALU' : 'SBM'}
                    style={currencyIconStyle}
                  />
                  <span>
                    {userData && userData[betType === 'premium' ? 'gold' : 'silver'] !== undefined ? 
                      userData[betType === 'premium' ? 'gold' : 'silver']?.toLocaleString() : 
                      'Loading...'} {CURRENCY_NAMES[betType]}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={quickAmountButtonsContainerStyle}>
              {[10, 25, 50, 100].map(amount => (
                <button 
                  key={amount}
                  type="button"
                  onClick={() => {
                    setBetSize(amount);
                    setFormError('');
                  }}
                  style={{
                    ...quickAmountButtonStyle,
                    fontSize: '0.75rem',
                    backgroundColor: betSize === amount ? 'rgba(99, 102,241, 0.2)' : undefined,
                    borderColor: betSize === amount ? 'rgba(99, 102,241, 0.5)' : undefined,
                  }}
                >
                  {amount.toFixed(amount < 0.0001 ? 5 : amount < 0.01 ? 4 : 3)}
                </button>
              ))}
            </div>
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="multiplier" style={labelStyle}>
              <FaPercent style={iconStyle} />
              Multiplier
            </label>
            <div style={{position: 'relative'}}>
              <input
                type="number"
                id="multiplier"
                placeholder="Multiplier (1.01x-100x)"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                onFocus={() => setMultiplierInputFocused(true)}
                onBlur={() => setMultiplierInputFocused(false)}
                style={{
                  ...modernInputStyle,
                  height: '46px',
                  fontSize: '1rem',
                  borderColor: multiplierInputFocused ? colors.primary : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: multiplierInputFocused ? `0 0 0 2px ${colors.primary}30` : 'none',
                  transition: 'all 0.2s ease',
                }}
                min="1.01"
                max="100"
                step="0.01"
                required
              />
              
              <div style={{
                marginTop: '10px',
                padding: '0 2px',
                position: 'relative'
              }}>
                <input
                  type="range"
                  min="1.01"
                  max="10"
                  step="0.01"
                  value={multiplier > 10 ? 10 : multiplier < 1.01 ? 1.01 : multiplier}
                  onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    height: '5px',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    background: `linear-gradient(90deg, 
                      ${colors.primary} 0%, 
                      ${colors.primary} ${(multiplier - 1.01) / (10 - 1.01) * 100}%, 
                      rgba(255,255,255,0.1) ${(multiplier - 1.01) / (10 - 1.01) * 100}%, 
                      rgba(255,255,255,0.1) 100%)`,
                    borderRadius: '10px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '4px',
                  fontSize: '0.75rem',
                  color: colors.text.secondary,
                }}>
                  <span>1x</span>
                  <span>3x</span>
                  <span>5x</span>
                  <span>7x</span>
                  <span>10x+</span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s ease'
              }}>
                <div>
                  <span style={{
                    fontSize: '0.8rem',
                    color: colors.text.secondary,
                    marginRight: '6px'
                  }}>
                    American Odds:
                  </span>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: getOddsColor(getAmericanOdds(multiplier))
                  }}>
                    {getAmericanOdds(multiplier)}
                  </span>
                </div>
                
                <div style={{
                  fontSize: '0.75rem',
                  color: colors.text.secondary,
                  cursor: 'help',
                  position: 'relative'
                }} 
                title="American odds show your potential profit. +200 means bet 100 to win 200; -200 means bet 200 to win 100.">
                  <FaInfoCircle />
                </div>
              </div>

              {parseFloat(multiplier) > 10 && (
                <div style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(255, 99, 71, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 99, 71, 0.2)',
                  fontSize: '0.85rem',
                  color: '#ff6347',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaInfoCircle size={12} />
                  <span>High multipliers represent very unlikely outcomes</span>
                </div>
              )}
            </div>
            
            <div style={{
              ...potentialWinningsContainerStyle,
              opacity: betSize ? '1' : '0.5',
              transform: betSize ? 'translateY(0)' : 'translateY(5px)',
              transition: 'all 0.3s ease'
            }}>
              <span>Potential Winnings:</span>
              <span style={{
                ...potentialWinningsAmountStyle,
                fontSize: betSize > 100 ? '1.2rem' : '1.1rem',
                transition: 'font-size 0.3s ease'
              }}>
                {formatCurrency(potentialWinnings)} {CURRENCY_NAMES[betType]}
              </span>
            </div>
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="duration" style={labelStyle}>
              <FaClock style={iconStyle} />
              Auction Duration
            </label>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '10px',
              marginTop: '10px'
            }}>
              {[
                { value: "15", label: "15 min" },
                { value: "30", label: "30 min" },
                { value: "60", label: "1 hour" },
                { value: "120", label: "2 hours" },
                { value: "240", label: "4 hours" },
                { value: "480", label: "8 hours" },
                { value: "720", label: "12 hours" },
                { value: "1440", label: "24 hours" }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDuration(option.value)}
                  style={{
                    padding: '10px',
                    backgroundColor: duration === option.value 
                      ? 'rgba(99, 102,241, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: duration === option.value 
                      ? '1px solid rgba(99, 102,241, 0.5)' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: duration === option.value ? '#fff' : '#aaa',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{option.label}</span>
                  <FaClock size={14} color={duration === option.value ? colors.primary : '#777'} />
                </button>
              ))}
            </div>
            
            <input 
              type="hidden" 
              value={duration} 
              required
              name="duration"
            />
          </div>

          {durationWarning && (
          <div style={{
            background: '#F44336',
            color: 'white',
            padding: '8px 14px',
            borderRadius: '6px',
            margin: '10px 0',
            fontWeight: 600,
            fontSize: '0.95em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {durationWarning}
          </div>
        )}
        </div>

        <AnimatePresence>
          {selectedPlayer && selectedMetric && metricValue && selectedCondition && betSize && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              style={betSummaryContainerStyle}
            >
              <h4 style={betSummaryTitleStyle}>Bet Summary</h4>
              <p style={betSummaryTextStyle}>
                You're betting <strong>{formatCurrency(betSize)} {CURRENCY_NAMES[betType]}</strong> that{' '}
                <strong>{selectedPlayer}</strong> will {selectedSport === 'mlb' && mlbCategory === 'pitching' ? 'allow' : 'score'}{' '}
                <strong>{selectedCondition.toLowerCase()} {metricValue} {selectedMetric}</strong>
                {selectedSport === 'mlb' && (
                  <> in <strong>{mlbCategory}</strong></>
                )}.
              </p>
              <p style={betSummaryTextStyle}>
                If you win, you'll receive <strong>{formatCurrency(potentialWinnings)} {CURRENCY_NAMES[betType]}</strong> (a profit of {formatCurrency(potentialWinnings - betSize)} {CURRENCY_NAMES[betType]}).
              </p>
              <div style={{
                marginTop: '15px',
                padding: '10px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.9rem',
                color: colors.text.secondary,
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  marginRight: '10px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary
                }}>
                  <FaInfoCircle size={12} />
                </div>
                <div>
                  <strong>Odds Conversion:</strong> {multiplier}x multiplier = <span style={{
                    color: getOddsColor(getAmericanOdds(multiplier)),
                    fontWeight: 'bold'
                  }}>{getAmericanOdds(multiplier)}</span> in American odds
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={errorContainerStyle}
            >
              <strong>Error:</strong> {formError}
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          type="submit" 
          style={{
            ...(!loading ? submitButtonStyle : submitButtonDisabledStyle),
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
          }}
          disabled={loading}
        >
          {loading ? 'Creating Auction...' : 'Post Auction'}
        </button>
        
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          fontSize: '0.9rem'
        }}>
          <h4 style={{
            margin: '0 0 10px 0',
            fontSize: '1rem',
            color: colors.text.primary,
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: colors.primary,
              marginRight: '8px',
              fontSize: '0.7rem'
            }}>i</span>
            Multiplier to American Odds Conversion
          </h4>
          <p style={{
            margin: '0 0 10px 0',
            color: colors.text.secondary
          }}>
            American odds show how much you win relative to a $100 bet. Positive odds (+) show profit on a $100 bet, while negative odds (-) show how much you need to bet to win $100.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '10px',
            marginTop: '10px'
          }}>
            <div style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>2.0x Multiplier</div>
              <div style={{color: colors.success, fontWeight: 'bold'}}>+100</div>
            </div>
            <div style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>3.0x Multiplier</div>
              <div style={{color: colors.success, fontWeight: 'bold'}}>+200</div>
            </div>
            <div style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>1.5x Multiplier</div>
              <div style={{color: colors.danger, fontWeight: 'bold'}}>-200</div>
            </div>
            <div style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>10x Multiplier</div>
              <div style={{color: colors.success, fontWeight: 'bold'}}>+900</div>
            </div>
            <div style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>50x Multiplier</div>
              <div style={{color: colors.success, fontWeight: 'bold'}}>+4900</div>
            </div>
            <div style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '0.8rem', color: colors.text.secondary}}>100x Multiplier</div>
              <div style={{color: colors.success, fontWeight: 'bold'}}>+9900</div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(76, 175, 80, 0.95)',
                padding: '16px 24px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 1000,
                maxWidth: '90%',
                width: '400px'
              }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="white"/>
                </svg>
              </div>
              <div>
                <h3 style={{ 
                  margin: '0 0 4px 0', 
                  color: 'white', 
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  Auction Created Successfully!
                </h3>
                <p style={{ 
                  margin: '0', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem' 
                }}>
                  Your auction has been posted.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  padding: '4px',
                  opacity: 0.7
                }}
                aria-label="Close notification"
              >
                ×
              </button>
              
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                width: '100%',
                animation: 'countdown 5s linear forwards'
              }} />
              
              <style>{`
                @keyframes countdown {
                  from { width: 100%; }
                  to { width: 0%; }
                }
              `}</style>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    );
  };
  
  export default AuctionForm;