import React, { useState, useEffect, useRef } from 'react';
import { FaSyncAlt, FaArrowLeft, FaChartBar, FaBasketballBall, FaBaseballBall, FaRunning } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { getMLBTeamColors } from '../../utils/teamColors';
import { simulatePitchPath } from '../../utils/pitchSim';
import './LiveGames.css';
import PitchSimulation from './PitchSimulation';

const TABS = [
  { key: 'nba', label: 'NBA', icon: <FaBasketballBall /> },
  { key: 'mlb', label: 'MLB', icon: <FaBaseballBall /> }
];

const LiveGames = () => {
  const [activeSport, setActiveSport] = useState('nba');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeTab, setActiveTab] = useState('game');
  const [sortBy, setSortBy] = useState('points');
  const [sortOrder, setSortOrder] = useState('desc');
  const topRef = useRef(null);

  //mlb play by play
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [mlbActiveTab, setMlbActiveTab] = useState('playbyplay');
  const [selectedPitchIdx, setSelectedPitchIdx] = useState(null);
  const [animIdx, setAnimIdx] = React.useState(0);

  const [pitchAnimIdx, setPitchAnimIdx] = useState(null);
  const [autoAdvanceTimeout, setAutoAdvanceTimeout] = useState(null);

  const transformGameData = (game) => {
    if (!game) return null;

    const homePlayers = game.homePlayers || game.homeTeam?.players || [];
    const awayPlayers = game.awayPlayers || game.awayTeam?.players || [];

    const arenaName = game.arena?.arenaName || '';
    const arenaCity = game.arena?.arenaCity || '';
    const arenaState = game.arena?.arenaState || '';
    const arenaCountry = game.arena?.arenaCountry || '';

    return {
      ...game,
      arenaName,
      arenaCity,
      arenaState,
      arenaCountry,
      arenaFullName: `${arenaName}${arenaCity ? ', ' + arenaCity : ''}${arenaState ? ', ' + arenaState : ''}`,
      
      homeTeam: {
        ...(game.homeTeam || {}),
        teamId: game.homeTeamId || game.homeTeam?.teamId,
        teamName: game.homeTeamName || game.homeTeam?.teamName,
        teamCity: game.homeTeamCity || game.homeTeam?.teamCity,
        teamTricode: game.homeTeamTricode || game.homeTeam?.teamTricode,
        score: game.homeScore || game.homeTeam?.score || 0,
        players: homePlayers
      },
      awayTeam: {
        ...(game.awayTeam || {}),
        teamId: game.awayTeamId || game.awayTeam?.teamId,
        teamName: game.awayTeamName || game.awayTeam?.teamName,
        teamCity: game.awayTeamCity || game.awayTeam?.teamCity,
        teamTricode: game.awayTeamTricode || game.awayTeam?.teamTricode,
        score: game.awayScore || game.awayTeam?.score || 0,
        players: awayPlayers
      },
      gameStatusId: game.gameStatusId || game.status,
      plays: game.plays || game.recentPlays || []
    };
  };

  const fetchLiveGames = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      let url;
      if (activeSport === 'nba') {
        url = forceRefresh ? '/games/live?refresh=true' : '/games/live';
      } else {
        url = '/mlb/live';
      }
      const response = await api.get(url);

      if (response.data && Array.isArray(response.data)) {
        const transformedGames = activeSport === 'nba'
          ? response.data.map(transformGameData)
          : response.data;
        setGames(transformedGames);

        if (selectedGame) {
          const updatedGame = transformedGames.find(g => g.gameId === selectedGame.gameId);
          if (updatedGame) setSelectedGame(updatedGame);
        }
        setLastUpdated(new Date());
      } else {
        setGames([]);
      }
    } catch (error) {
      setError(error.message || 'Failed to load live games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedGame(null);
    fetchLiveGames(false);
  }, [activeSport]);

  useEffect(() => {
    let interval = 45000;
    if (
      activeSport === 'mlb' &&
      selectedGame &&
      mlbActiveTab === 'playbyplay'
    ) {
      interval = 1000;
    }
    const intervalId = setInterval(() => fetchLiveGames(false), interval);
    return () => clearInterval(intervalId);
  }, [activeSport, selectedGame, mlbActiveTab]);

  const selectGame = (game) => {
    setSelectedGame(game);
    setActiveTab('game');
    if (game && activeSport === 'mlb') {
      setMlbActiveTab('playbyplay');
    }

    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const backToGameList = () => {
    setSelectedGame(null);
  };
  const formatGameClock = (clock) => {
    if (!clock) return '';

    if (clock.startsWith('PT')) {
      let minutes = 0;
      let seconds = 0;
      
      const minutesMatch = clock.match(/(\d+)M/);
      if (minutesMatch) {
        minutes = parseInt(minutesMatch[1], 10);
      }
      
      const secondsMatch = clock.match(/(\d+(?:\.\d+)?)S/);
      if (secondsMatch) {

        seconds = Math.round(parseFloat(secondsMatch[1]));
      }

      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return clock;
  };

  const getPeriodText = (period) => {
    if (period === 0) return '';
    if (period <= 4) return `Q${period}`;
    return `OT${period - 4}`;
  };
  
  const getGameStatusText = (game) => {
    if (game.gameStatusId === 1) return 'Not Started';
    if (game.gameStatusId === 2) {
      return `${getPeriodText(game.period)} ${formatGameClock(game.gameClock)}`;
    }
    return game.gameStatus || 'Unknown';
  };

  const teamColorStyle = (teamTricode) => {
    const teamColors = {
      ATL: '#E03A3E', BOS: '#007A33', BKN: '#000000', CHA: '#1D1160', CHI: '#CE1141', 
      CLE: '#860038', DET: '#C8102E', IND: '#002D62', MIA: '#98002E', MIL: '#00471B',
      NYK: '#006BB6', ORL: '#0077C0', PHI: '#006BB6', TOR: '#CE1141', WAS: '#002B5C',
      DAL: '#00538C', DEN: '#0E2240', GSW: '#1D428A', HOU: '#CE1141', LAC: '#C8102E',
      LAL: '#552583', MEM: '#5D76A9', MIN: '#0C2340', NOP: '#0C2340', OKC: '#007AC1',
      PHX: '#1D1160', POR: '#E03A3E', SAC: '#5A2D81', SAS: '#C4CED4', UTA: '#002B5C'
    };
    
    return {
      backgroundColor: teamColors[teamTricode] || '#333',
      color: '#fff'
    };
  };
  const sortPlayers = (players) => {
    if (!players) return [];
    return [...players].sort((a, b) => {
      let aValue = a[sortBy] || 0;
      let bValue = b[sortBy] || 0;

      if (sortBy === 'minutes') {
        aValue = convertMinutesToSeconds(a.minutes);
        bValue = convertMinutesToSeconds(b.minutes);
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  };

  const convertMinutesToSeconds = (minutesString) => {
    if (!minutesString) return 0;
    
    if (minutesString.startsWith('PT') && minutesString.endsWith('M')) {
      const minutes = minutesString.substring(2, minutesString.length - 1);
      return parseInt(minutes, 10) * 60;
    }
    
    const [minutes, seconds] = minutesString.split(':').map(Number);
    return minutes * 60 + (seconds || 0);
  };

  const formatMinutes = (minutesString) => {
    if (!minutesString) return '0:00';
    
    if (minutesString.startsWith('PT') && minutesString.endsWith('M')) {
      const minutes = minutesString.substring(2, minutesString.length - 1);
      
      if (minutes.includes('.') || minutes.includes(':')) {
        return minutes;
      }
      
      return `${parseInt(minutes, 10)}:00`;
    }
    
    return minutesString;
  };

  const getStatHighlight = (stat, statType) => {
    const thresholds = {
      points: 20,
      rebounds: 10,
      assists: 7,
      steals: 3,
      blocks: 2
    };
    
    if (stat >= (thresholds[statType] || 0)) {
      return 'stat-highlight';
    }
    return '';
  };
  
  const formatPlayerName = (player) => {
    if (player.firstName && player.lastName) {
      return `${player.firstName} ${player.lastName}`;
    } else if (player.firstName) {
      return player.firstName;
    } else if (player.lastName) {
      return player.lastName;
    } else {
      return "Unknown Player";
    }
  };

  const sortGames = (games) => {
    return [...games].sort((a, b) => {
      const getStatusRank = (g) => {
        if (g.status === 'LIVE' || g.gameStatusId === 2) return 0; // live/in progress
        if (g.status === 'SCHEDULED' || g.gameStatusId === 1) return 1; // not started
        if (g.status === 'FINAL' || g.status === 'COMPLETED' || g.gameStatusId === 3) return 2; // finished
        return 3;
      };
      const rankA = getStatusRank(a);
      const rankB = getStatusRank(b);
      if (rankA !== rankB) return rankA - rankB;
      if (a.startTime && b.startTime) {
        return new Date(b.startTime) - new Date(a.startTime);
      }
      return (b.gameId || 0) - (a.gameId || 0);
    });
  };

  const sortPlays = (plays) => {
    if (!Array.isArray(plays)) return [];
    let currentIdx = plays.findIndex(p => p.isCurrent || p.isLive);
    let maxId = -1;
    if (currentIdx === -1 && plays.length > 0) {
      maxId = Math.max(...plays.map(p => p.playId || 0));
      currentIdx = plays.findIndex(p => p.playId === maxId);
    }
    let sorted = [...plays];
    let current = null;
    if (currentIdx >= 0) {
      [current] = sorted.splice(currentIdx, 1);
    }
    if (current && current.playId) {
      sorted = sorted.filter(p => p.playId !== current.playId);
    }
    sorted.sort((a, b) => (b.playId || 0) - (a.playId || 0));
    return current ? [current, ...sorted] : sorted;
  };

  function getPitchResultType(pitch, playResult) {
    const desc = (pitch.result || pitch.description || '').toLowerCase();
    const playRes = (playResult || '').toLowerCase();
    if ((desc.includes('foul tip') && (desc.includes('strikeout') || playRes.includes('strikeout'))) ||
        (desc.includes('foul tip') && playRes.includes('out'))) {
      return 'swinging-strike';
    }
    if (desc.includes('called strike')) return 'called-strike';
    if (desc.includes('swinging strike')) return 'swinging-strike';
    if (desc.includes('strikeout')) return 'strike';
    if (desc.includes('foul tip')) return 'foul';
    if (desc.includes('strike')) return 'strike';
    if (desc.includes('ball') && !desc.includes('hit by pitch')) return 'ball';
    if (desc.includes('foul')) return 'foul';
    if (desc.includes('hit by pitch')) return 'hbp';
    if (desc.includes('in play, out')) return 'inplay-out';
    if (desc.includes('in play, run')) return 'inplay-hit-run';
    if (desc.includes('in play')) {
      if (playResult && playResult.toLowerCase().includes('single')) return 'inplay-hit';
      if (playResult && playResult.toLowerCase().includes('double')) return 'inplay-hit';
      if (playResult && playResult.toLowerCase().includes('triple')) return 'inplay-hit';
      if (playResult && playResult.toLowerCase().includes('home run')) return 'inplay-hit-run';
      return 'inplay-hit';
    }
    if (playResult) {
      const pr = playResult.toLowerCase();
      if (pr.includes('called strike')) return 'called-strike';
      if (pr.includes('swinging strike')) return 'swinging-strike';
      if (pr.includes('strikeout')) return 'strike';
      if (pr.includes('walk')) return 'ball';
      if (pr.includes('foul')) return 'foul';
      if (pr.includes('hit by pitch')) return 'hbp';
      if (pr.includes('out')) return 'inplay-out';
      if (pr.includes('single') || pr.includes('double') || pr.includes('triple')) return 'inplay-hit';
      if (pr.includes('home run')) return 'inplay-hit-run';
    }
    return 'other';
  }

  const getPitchAnimation = (pitchType) => {
    switch ((pitchType || '').toLowerCase()) {
      case 'fastball':
      case 'four-seam fastball':
      case '2-seam fastball':
      case 'sinker':
        return 'fastball-anim'; // quick fade/scale
      case 'slider':
        return 'slider-anim'; // curve path
      case 'curveball':
        return 'curveball-anim'; // bounce/arc
      case 'changeup':
        return 'changeup-anim'; // slow fade/scale
      case 'cutter':
        return 'cutter-anim'; // quick side move
      case 'splitter':
        return 'splitter-anim'; // drop
      default:
        return 'generic-anim';
    }
  };

  useEffect(() => {
    if (activeSport !== 'mlb' || !selectedGame || mlbActiveTab !== 'playbyplay') return;
    if (!selectedGame.playByPlay) return;
    const plays = Array.isArray(selectedGame.playByPlay) ? selectedGame.playByPlay : [selectedGame.playByPlay];
    const sortedPlays = [...plays].reverse();
    if (selectedPlay === null || selectedPlay >= sortedPlays.length - 1) return;
    const play = sortedPlays[selectedPlay];
    if (play && play.result && play.pitches && play.pitches.length > 0) {
      if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
      const timeout = setTimeout(() => {
        setSelectedPlay(selectedPlay + 1);
      }, 7000); // 7 seconds
      setAutoAdvanceTimeout(timeout);
      return () => clearTimeout(timeout);
    }
  }, [selectedPlay, selectedGame, mlbActiveTab, activeSport]);

  const renderMLBPlayByPlay = (game) => {
    if (!game.playByPlay) return <div>No play-by-play data available.</div>;

    const getStrikeZoneHelpers = (play) => {
      // Use a true 1:1 aspect ratio: 1 foot = 120px
      // Statcast pX: -1.5 to +1.5 ft (3.0 ft total)
      // Typical vertical: 0.5 to 4.0 ft (3.5 ft total)
      const FEET_TO_PX = 120; // 1 foot = 120px
      const displayWidth = 3.0 * FEET_TO_PX; // 360px
      const displayHeight = 3.5 * FEET_TO_PX; // 420px
      const szBoxWidth = 1.4167 * FEET_TO_PX; // 17 inches in px
      const szBoxX = ((displayWidth - szBoxWidth) / 2);
      const szTop = play.strikeZoneTop ?? 3.5;
      const szBot = play.strikeZoneBottom ?? 1.5;
      const verticalMin = szBot - 0.5;
      const verticalMax = szTop + 0.5;
      const szBoxHeight = (szTop - szBot) * FEET_TO_PX;
      const szBoxY = (verticalMax - szTop) * FEET_TO_PX;
      const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
      const pzToY = (pz) => clamp((verticalMax - pz) * FEET_TO_PX, 0, displayHeight);
      const pxToX = (px) => clamp(((px + 1.5) * FEET_TO_PX), 8, displayWidth - 8);
      return { szTop, szBot, pzToY, pxToX, szBoxY, szBoxHeight, szBoxX, szBoxWidth, displayWidth, displayHeight, verticalMin, verticalMax };
    };

    const plays = sortPlays(Array.isArray(game.playByPlay) ? game.playByPlay : [game.playByPlay]);
    const reversedPlays = [...plays].reverse();
    return (
      <div className="mlb-playbyplay-section dark-mode">
        <h3 style={{color: '#fff', marginBottom: 16}}>Play-by-Play (At Bat by At Bat)</h3>
        <div className="mlb-plays-list">
          {reversedPlays.map((play, idx) => {
            const { szTop, szBot, pzToY, pxToX, szBoxY, szBoxHeight, szBoxX, szBoxWidth, displayWidth, displayHeight } = getStrikeZoneHelpers(play);
            return (
              <React.Fragment key={idx}>
                <div
                  className={`mlb-play-item${selectedPlay === idx ? ' selected' : ''}`}
                  onClick={() => setSelectedPlay(idx)}
                  style={{
                    cursor: 'pointer',
                    background: selectedPlay === idx ? '#23263a' : '#181a25',
                    borderRadius: 8,
                    marginBottom: 10,
                    padding: 12,
                    border: selectedPlay === idx ? '2px solid #6366F1' : '1px solid #23263a',
                    color: '#fff',
                    boxShadow: selectedPlay === idx ? '0 2px 12px #6366F133' : 'none',
                    transition: 'all 0.2s'
                  }}>
                  <div style={{fontWeight: 600, fontSize: 17}}><b>{play.batter}</b> vs <b>{play.pitcher}</b></div>
                  <div style={{color: '#a5b4fc', fontSize: 15}}>{play.result} &mdash; {play.description}</div>
                  <div style={{color: '#cbd5e1', fontSize: 14}}>Balls: {play.count?.balls} Strikes: {play.count?.strikes} Outs: {play.count?.outs}</div>
                </div>
                {selectedPlay === idx && play && (
                  <div className="mlb-play-detail-modal" style={{marginTop: 0, marginBottom: 18, background: '#181a25', border: '2px solid #6366F1', borderRadius: 12, padding: 20, boxShadow: '0 4px 24px #0008', color: '#fff', position: 'relative'}}>
                    <button onClick={() => setSelectedPlay(null)} style={{position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#fff', cursor: 'pointer'}}>&times;</button>
                    <h4 style={{marginBottom: 8, color: '#fff'}}>At Bat: {play.batter} (ID: {play.batterId}) vs {play.pitcher}</h4>
                    <div style={{marginBottom: 6}}><b>Result:</b> <span style={{color: '#fbbf24'}}>{play.result}</span></div>
                    <div style={{marginBottom: 6}}><b>Description:</b> <span style={{color: '#a5b4fc'}}>{play.description}</span></div>
                    <div style={{marginBottom: 6}}><b>Strike Zone Top:</b> {play.strikeZoneTop} ft, <b>Bottom:</b> {play.strikeZoneBottom} ft</div>
                    <div style={{marginBottom: 12}}><b>Count:</b> Balls: {play.count?.balls}, Strikes: {play.count?.strikes}, Outs: {play.count?.outs}</div>
                    <h5 style={{marginTop: 16, color: '#fff'}}>Pitches</h5>
                    <div style={{display: 'flex', gap: 32, alignItems: 'flex-start'}}>
                      <table className="mlb-pitch-table" style={{minWidth: 380, background: '#23263a', color: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0004', borderSpacing: 0, borderCollapse: 'separate', margin: '0 0 0 0'}}>
                        <thead>
                          <tr style={{background: '#23263a', color: '#a5b4fc'}}>
                            <th style={{padding: '8px 16px'}}>#</th>
                            <th style={{padding: '8px 16px'}}>Type</th>
                            <th style={{color: '#f472b6', padding: '8px 16px'}}>Speed (mph)</th>
                            <th style={{color: '#fbbf24', padding: '8px 16px'}}>Spin</th>
                            <th style={{color: '#06b6d4', padding: '8px 16px'}}>Exit Velo</th>
                            <th style={{padding: '8px 16px'}}>Zone</th>
                            <th style={{padding: '8px 16px', textAlign: 'center'}}>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {play.pitches?.map((pitch, i) => {
                            const type = getPitchResultType(pitch, play.result);
                            const resultColors = {
                              'ball': { fill: '#22c55e', text: '#fff' },
                              'foul': { fill: '#fde047', text: '#333' },
                              'called-strike': { fill: '#ef4444', text: '#fff' },
                              'swinging-strike': { fill: '#ef4444', text: '#fff' },
                              'inplay-out': { fill: '#fb923c', text: '#fff' },
                              'inplay-hit': { fill: '#38bdf8', text: '#fff' },
                              'inplay-hit-run': { fill: '#38bdf8', text: '#fff' },
                              'other': { fill: '#cbd5e1', text: '#333' }
                            };
                            let colorKey = type;
                            if (type === 'strike') colorKey = 'called-strike';
                            if (type === 'inplay-hit-run') colorKey = 'inplay-hit-run';
                            if (type === 'inplay-hit') colorKey = 'inplay-hit';
                            if (type === 'inplay-out') colorKey = 'inplay-out';
                            if (type === 'ball') colorKey = 'ball';
                            if (type === 'foul') colorKey = 'foul';
                            if (type === 'swinging-strike') colorKey = 'swinging-strike';
                            if (type === 'called-strike') colorKey = 'called-strike';
                            const { fill } = resultColors[colorKey] || resultColors['other'];
                            let rowStyle = {
                              background: 'rgba(24,26,37,0.82)',
                              color: '#fff',
                              fontWeight: 500,
                              borderBottom: '1px solid #23263a',
                              cursor: 'pointer',
                              outline: selectedPitchIdx === i ? '2px solid #f472b6' : undefined,
                              height: 44,
                              fontSize: 16,
                              letterSpacing: 0.5,
                              lineHeight: 1.3,
                              transition: 'background 0.18s, color 0.18s, outline 0.18s'
                            };
                            let anim = {};
                            if (i === play.pitches.length - 1) anim.animation = 'fadeInPitch 0.7s';
                            return (
                              <tr key={i} style={{...rowStyle, ...anim}}
                                onClick={() => setSelectedPitchIdx(i)}
                              >
                                <td style={{padding: '6px 14px', textAlign: 'center'}}>{i+1}</td>
                                <td style={{padding: '6px 14px', textAlign: 'center'}}>{pitch.pitchType}</td>
                                <td style={{color: '#f472b6', padding: '6px 14px', textAlign: 'center'}}>{pitch.pitchSpeed ? pitch.pitchSpeed.toFixed(1) : '-'}</td>
                                <td style={{color: '#fbbf24', padding: '6px 14px', textAlign: 'center'}}>{pitch.spinRate || '-'}</td>
                                <td style={{color: '#06b6d4', padding: '6px 14px', textAlign: 'center'}}>{pitch.exitVelocity || '-'}</td>
                                <td style={{padding: '6px 14px', textAlign: 'center'}}>{pitch.zone || '-'}</td>
                                <td style={{
                                  textTransform: 'capitalize',
                                  padding: '6px 14px',
                                  textAlign: 'center',
                                  fontWeight: 700,
                                  color: fill
                                }}>{type.replace(/-/g, ' ')}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 32, position: 'relative', minWidth: 440}}>
                        <svg width={displayWidth} height={displayHeight} viewBox={`0 0 ${displayWidth} ${displayHeight}`} style={{background: '#181a25', border: '2px solid #6366F1', borderRadius: 18, boxShadow: '0 2px 12px #6366F133', position: 'relative', zIndex: 1}}>
                          <defs>
                            <filter id="strikeShadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#8B5CF6" flood-opacity="0.7"/>
                            </filter>
                            <filter id="ballShadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#06b6d4" flood-opacity="0.7"/>
                            </filter>
                            <filter id="inPlayShadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#fbbf24" flood-opacity="0.7"/>
                            </filter>
                            <radialGradient id="sz3d" cx="50%" cy="40%" r="80%">
                              <stop offset="0%" stopColor="#23263a" stopOpacity="1"/>
                              <stop offset="80%" stopColor="#181a25" stopOpacity="1"/>
                              <stop offset="100%" stopColor="#0e101a" stopOpacity="1"/>
                            </radialGradient>
                            {/* Pitch type animations */}
                            <style>{`
                              .fastball-anim { animation: fastballFade 0.4s cubic-bezier(.4,2,.6,1) both; }
                              .slider-anim { animation: sliderCurve 0.7s cubic-bezier(.4,2,.6,1) both; }
                              .curveball-anim { animation: curveBounce 0.7s cubic-bezier(.4,2,.6,1) both; }
                              .changeup-anim { animation: changeupFade 0.8s cubic-bezier(.4,2,.6,1) both; }
                              .cutter-anim { animation: cutterSide 0.5s cubic-bezier(.4,2,.6,1) both; }
                              .splitter-anim { animation: splitterDrop 0.7s cubic-bezier(.4,2,.6,1) both; }
                              .generic-anim { animation: genericPop 0.5s cubic-bezier(.4,2,.6,1) both; }
                              @keyframes fastballFade { from { opacity:0; transform:scale(0.7);} to { opacity:1; transform:scale(1);} }
                              @keyframes sliderCurve { 0%{opacity:0;transform:translateX(-18px);} 100%{opacity:1;transform:translateX(0);} }
                              @keyframes curveBounce { 0%{opacity:0;transform:translateY(-18px);} 100%{opacity:1;transform:translateY(0);} }
                              @keyframes changeupFade { from { opacity:0; transform:scale(1.3);} to { opacity:1; transform:scale(1);} }
                              @keyframes cutterSide { 0%{opacity:0;transform:translateX(18px);} 100%{opacity:1;transform:translateX(0);} }
                              @keyframes splitterDrop { 0%{opacity:0;transform:translateY(18px);} 100%{opacity:1;transform:translateY(0);} }
                              @keyframes genericPop { from { opacity:0; transform:scale(0.5);} to { opacity:1; transform:scale(1);} }
                            `}</style>
                          </defs>
                          <rect x={0} y={0} width={displayWidth} height={displayHeight} fill="#181a25" stroke="#333" strokeWidth="2" rx="28" />
                          <rect x={szBoxX} y={szBoxY} width={szBoxWidth} height={szBoxHeight} fill="url(#sz3d)" stroke="#8B5CF6" strokeWidth="4" rx="18" style={{filter:'drop-shadow(0 12px 24px #0008)'}} />
                          {Array.from({length:2}).map((_,i)=>(
                            <line key={'v'+i} x1={szBoxX + ((i+1)*szBoxWidth/3)} y1={szBoxY} x2={szBoxX + ((i+1)*szBoxWidth/3)} y2={szBoxY + szBoxHeight} stroke="#444" strokeWidth="1.5" opacity="0.7" />
                          ))}
                          {Array.from({length:2}).map((_,i)=>(
                            <line key={'h'+i} x1={szBoxX} y1={szBoxY + ((i+1)*szBoxHeight/3)} x2={szBoxX + szBoxWidth} y2={szBoxY + ((i+1)*szBoxHeight/3)} stroke="#444" strokeWidth="1.5" opacity="0.7" />
                          ))}
                          <ellipse cx={displayWidth/2} cy={szBoxY + szBoxHeight + 32} rx={szBoxWidth/1.7} ry="18" fill="#000" opacity="0.18" />
                          {play.pitches?.map((pitch, i) => {
                            if (!pitch.coordinates || pitch.coordinates.pX === undefined || pitch.coordinates.pZ === undefined) return null;
                            const FEET_TO_PX = 120;
                            const px = pxToX(pitch.coordinates.pX);
                            const pz = pzToY(pitch.coordinates.pZ);
                            const ballRadiusPx = 0.1208 * FEET_TO_PX;
                            const type = getPitchResultType(pitch, play.result);
                            const resultColors = {
                              'ball': { fill: '#22c55e', text: '#fff' },
                              'foul': { fill: '#fde047', text: '#333' },
                              'called-strike': { fill: '#ef4444', text: '#fff' },
                              'swinging-strike': { fill: '#ef4444', text: '#fff' },
                              'inplay-out': { fill: '#fb923c', text: '#fff' },
                              'inplay-hit': { fill: '#38bdf8', text: '#fff' },
                              'inplay-hit-run': { fill: '#38bdf8', text: '#fff' },
                              'other': { fill: '#cbd5e1', text: '#333' }
                            };
                            let colorKey = type;
                            if (type === 'strike') colorKey = 'called-strike';
                            if (type === 'inplay-hit-run') colorKey = 'inplay-hit-run';
                            if (type === 'inplay-hit') colorKey = 'inplay-hit';
                            if (type === 'inplay-out') colorKey = 'inplay-out';
                            if (type === 'ball') colorKey = 'ball';
                            if (type === 'foul') colorKey = 'foul';
                            if (type === 'swinging-strike') colorKey = 'swinging-strike';
                            if (type === 'called-strike') colorKey = 'called-strike';
                            const { fill, text } = resultColors[colorKey] || resultColors['other'];
                            const outline = selectedPitchIdx === i ? '#f472b6' : 'none';
                            const outlineWidth = selectedPitchIdx === i ? 2 : 0;
                            const gradId = `pitchGrad${i}`;
                            return (
                              <g key={i} style={{cursor: 'pointer'}} onClick={() => setSelectedPitchIdx(i)}>
                                <defs>
                                  <radialGradient id={gradId} cx="45%" cy="40%" r="60%">
                                    <stop offset="0%" stopColor="#fff" stopOpacity="0.65" />
                                    <stop offset="55%" stopColor={fill} stopOpacity="0.95" />
                                    <stop offset="100%" stopColor={fill} stopOpacity="1" />
                                  </radialGradient>
                                </defs>
                                <circle
                                  className={getPitchAnimation(pitch.pitchType)}
                                  cx={px}
                                  cy={pz}
                                  r={ballRadiusPx}
                                  fill={`url(#${gradId})`}
                                  stroke={outline}
                                  strokeWidth={outlineWidth}
                                  filter={'url(#strikeShadow)'}
                                  style={{transition: 'all 0.18s', boxShadow: `0 0 8px ${fill}cc`}}
                                />
                                <text
                                  x={px}
                                  y={pz + 5}
                                  textAnchor="middle"
                                  fontSize={ballRadiusPx * 1.1}
                                  fontWeight="bold"
                                  fill={text}
                                  pointerEvents="none"
                                  style={{userSelect: 'none'}}
                                >
                                  {i + 1}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                        {play.pitches && selectedPitchIdx != null && play.pitches[selectedPitchIdx] && (
                          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 170}}>
                            <div style={{fontWeight: 600, fontSize: 15, marginBottom: 6}}>Pitch Spin & Break</div>
                            <PitchSimulation pitch={play.pitches[selectedPitchIdx]} size={120} field />
                            <div style={{marginTop: 10, fontSize: 14, color: '#a5b4fc', textAlign: 'center'}}>
                              <div><b>Spin Rate:</b> {play.pitches[selectedPitchIdx].spinRate ? play.pitches[selectedPitchIdx].spinRate + ' rpm' : '-'}</div>
                              <div><b>Break Angle:</b> {play.pitches[selectedPitchIdx].breakAngle ? play.pitches[selectedPitchIdx].breakAngle + '°' : '-'}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  const renderMLBGameTabs = (game) => (
    <div style={{marginBottom: 18, display: 'flex', gap: 12}}>
      <button
        onClick={() => setMlbActiveTab('playbyplay')}
        style={{
          background: mlbActiveTab === 'playbyplay' ? '#6366F1' : '#23263a',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 22px',
          fontWeight: 600,
          fontSize: 16,
          boxShadow: mlbActiveTab === 'playbyplay' ? '0 2px 8px #6366F133' : 'none',
          cursor: 'pointer',
          transition: 'all 0.18s'
        }}
      >
        Play-by-Play
      </button>
      <button
        onClick={() => setMlbActiveTab('boxscore')}
        style={{
          background: mlbActiveTab === 'boxscore' ? '#6366F1' : '#23263a',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 22px',
          fontWeight: 600,
          fontSize: 16,
          boxShadow: mlbActiveTab === 'boxscore' ? '0 2px 8px #6366F133' : 'none',
          cursor: 'pointer',
          transition: 'all 0.18s'
        }}
      >
        Box Score
      </button>
    </div>
  );

  const renderMLBGameDetail = (game) => (
    <div>
      {renderMLBGameTabs(game)}
      {mlbActiveTab === 'playbyplay' ? renderMLBPlayByPlay(game) : renderMLBBoxScore(game)}
    </div>
  );

  // --- MLB Box Score Tab ---
  function renderMLBBoxScore(game) {
    if (!game) return null;
    return (
      <div className="mlb-boxscore-tab">
        <div className="mlb-team-players">
          <div className="mlb-team-label">{game.awayTeam?.abbreviation || game.awayTeam?.name} Batters</div>
          <table className="mlb-player-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>AB</th>
                <th>H</th>
                <th>RBI</th>
              </tr>
            </thead>
            <tbody>
              {game.awayTeam?.players?.map((player, idx) => (
                <tr key={idx}>
                  <td>{player.name}</td>
                  <td>{player.atBats}</td>
                  <td>{player.hits}</td>
                  <td>{player.rbi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mlb-team-players">
          <div className="mlb-team-label">{game.homeTeam?.abbreviation || game.homeTeam?.name} Batters</div>
          <table className="mlb-player-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>AB</th>
                <th>H</th>
                <th>RBI</th>
              </tr>
            </thead>
            <tbody>
              {game.homeTeam?.players?.map((player, idx) => (
                <tr key={idx}>
                  <td>{player.name}</td>
                  <td>{player.atBats}</td>
                  <td>{player.hits}</td>
                  <td>{player.rbi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const sortedGames = sortGames(games);

  return (
    <div className="live-games-container" ref={topRef}>
      {/* Tabs for NBA/MLB */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-button ${activeSport === tab.key ? 'active' : ''}`}
            onClick={() => setActiveSport(tab.key)}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderBottom: activeSport === tab.key ? '3px solid #6366F1' : '3px solid transparent',
              background: 'none',
              color: activeSport === tab.key
                ? (tab.key === 'mlb' ? '#8B5CF6' : '#6366F1')
                : '#aaa',
              fontWeight: activeSport === tab.key ? 700 : 400,
              fontSize: '1.1rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      {activeSport === 'nba' ? (
        <>
          <div className="games-header">
            <h2>Live NBA Games</h2>
            <div>
              {lastUpdated && (
                <span className="last-updated">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => fetchLiveGames(true)}
                className="refresh-button"
              >
                <FaSyncAlt /> Refresh
              </button>
            </div>
          </div>

          {loading && games.length === 0 && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading games...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {!loading && games.length === 0 && !error && (
            <div className="no-games-message">
              No live games at the moment.
            </div>
          )}

          <div className="games-grid">
            <AnimatePresence>
              {games.map((game) => (
                (game.homeTeam && game.awayTeam) && (
                  <motion.div 
                    key={game.gameId} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="game-card-container"
                  >
                    <div
                      onClick={() => selectGame(game)}
                      className="game-card"
                    >
                      <div className="game-status-bar">
                        <span className={`status-badge-small ${game.gameStatusId === 2 ? 'live' : 'final'}`}>
                          {getGameStatusText(game)}
                        </span>
                      </div>

                      {/* Teams */}
                      <div className="game-teams">
                        {/* Away Team */}
                        <div className="game-team">
                          <div className="team-logo-small" style={teamColorStyle(game.awayTeam.teamTricode)}>
                            {game.awayTeam.teamTricode}
                          </div>
                          <div className="team-name-small">
                            {game.awayTeam.teamCity} {game.awayTeam.teamName}
                          </div>
                          <div className="team-score-small">
                            {game.awayTeam.score}
                          </div>
                        </div>

                        <div className="game-team">
                          <div className="team-logo-small" style={teamColorStyle(game.homeTeam.teamTricode)}>
                            {game.homeTeam.teamTricode}
                          </div>
                          <div className="team-name-small">
                            {game.homeTeam.teamCity} {game.homeTeam.teamName}
                          </div>
                          <div className="team-score-small">
                            {game.homeTeam.score}
                          </div>
                        </div>
                      </div>

                      {/* Recent Plays */}
                      {game.gameStatusId === 2 && game.plays && game.plays.length > 0 && (
                        <div className="recent-plays-small">
                          <div className="recent-plays-title">Recent Plays:</div>
                          {game.plays.slice(0, 2).map((play, index) => (
                            <div key={index} className="recent-play-small">
                              <span className="play-time-small">
                                {getPeriodText(play.period)} {formatGameClock(play.clock)}:
                              </span>
                              <span className="play-desc-small">{play.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </>
      ) : (
        // --- MLB RENDERING ---
        <>
          {selectedGame ? (
            <div className="mlb-game-detail-view">
              <button onClick={backToGameList} className="back-button" style={{marginBottom: 16}}>
                <FaArrowLeft /> Back to Games
              </button>
              <div className="mlb-detail-header">
                <div className="mlb-detail-teams">
                  <span className="mlb-detail-team">{selectedGame.awayTeam?.name} ({selectedGame.awayTeam?.score})</span>
                  <span style={{margin: '0 12px', fontWeight: 700}}>@</span>
                  <span className="mlb-detail-team">{selectedGame.homeTeam?.name} ({selectedGame.homeTeam?.score})</span>
                </div>
                <div className="mlb-detail-status">
                  <span className={`status-badge-small ${selectedGame.status === 'LIVE' ? 'live' : 'final'}`}>{selectedGame.status}</span>
                  <span className="inning-info">{selectedGame.inningHalf} {selectedGame.inning ? `Inning ${selectedGame.inning}` : ''}</span>
                </div>
              </div>
              {/* Tabs */}
              <div className="mlb-tabs" style={{display: 'flex', gap: 16, margin: '24px 0'}}>
                <button
                  className={`tab-button ${mlbActiveTab === 'playbyplay' ? 'active' : ''}`}
                  onClick={() => setMlbActiveTab('playbyplay')}
                  style={{padding: '10px 24px', border: 'none', borderBottom: mlbActiveTab === 'playbyplay' ? '3px solid #6366F1' : '3px solid transparent', background: 'none', color: mlbActiveTab === 'playbyplay' ? '#8B5CF6' : '#aaa', fontWeight: mlbActiveTab === 'playbyplay' ? 700 : 400, fontSize: '1.1rem', cursor: 'pointer', outline: 'none', transition: 'all 0.2s'}}
                >
                  Play by Play
                </button>
                <button
                  className={`tab-button ${mlbActiveTab === 'boxscore' ? 'active' : ''}`}
                  onClick={() => setMlbActiveTab('boxscore')}
                  style={{padding: '10px 24px', border: 'none', borderBottom: mlbActiveTab === 'boxscore' ? '3px solid #6366F1' : '3px solid transparent', background: 'none', color: mlbActiveTab === 'boxscore' ? '#8B5CF6' : '#aaa', fontWeight: mlbActiveTab === 'boxscore' ? 700 : 400, fontSize: '1.1rem', cursor: 'pointer', outline: 'none', transition: 'all 0.2s'}}
                >
                  Box Score
                </button>
              </div>
              {/* Tab content */}
              {mlbActiveTab === 'boxscore' && (
                <div className="mlb-boxscore-tab">
                  <div className="mlb-team-players">
                    <div className="mlb-team-label">{selectedGame.awayTeam?.abbreviation || selectedGame.awayTeam?.name} Batters</div>
                    <table className="mlb-player-table">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>AB</th>
                          <th>H</th>
                          <th>RBI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGame.awayTeam?.players?.map((player, idx) => (
                          <tr key={idx}>
                            <td>{player.name}</td>
                            <td>{player.atBats}</td>
                            <td>{player.hits}</td>
                            <td>{player.rbi}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mlb-team-players">
                    <div className="mlb-team-label">{selectedGame.homeTeam?.abbreviation || selectedGame.homeTeam?.name} Batters</div>
                    <table className="mlb-player-table">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>AB</th>
                          <th>H</th>
                          <th>RBI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGame.homeTeam?.players?.map((player, idx) => (
                          <tr key={idx}>
                            <td>{player.name}</td>
                            <td>{player.atBats}</td>
                            <td>{player.hits}</td>
                            <td>{player.rbi}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {mlbActiveTab === 'playbyplay' && (
                <div className="mlb-playbyplay-tab">
                  {renderMLBPlayByPlay(selectedGame)}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="games-header">
                <h2>Live MLB Games</h2>
                <div>
                  {lastUpdated && (
                    <span className="last-updated">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={() => fetchLiveGames(true)}
                    className="refresh-button"
                  >
                    <FaSyncAlt /> Refresh
                  </button>
                </div>
              </div>
              {loading && games.length === 0 && (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading games...</p>
                </div>
              )}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              {!loading && games.length === 0 && !error && (
                <div className="no-games-message">
                  No live MLB games at the moment.
                </div>
              )}
              <div className="games-grid">
                <AnimatePresence>
                  {games.map((game) => (
                    <motion.div
                      key={game.gameId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="game-card-container mlb-card"
                    >
                      <div
                        onClick={() => setSelectedGame(game)}
                        className="game-card"
                      >
                        <div className="game-status-bar mlb-status">
                          <span className={`status-badge-small ${game.status === 'LIVE' ? 'live' : 'final'}`}>
                            {game.status}
                          </span>
                          <span className="inning-info">
                            {game.inningHalf} {game.inning ? `Inning ${game.inning}` : ''}
                          </span>
                        </div>
                        <div className="game-teams mlb-teams">
                          <div className="game-team">
                            {(() => {
                              const [primary, secondary] = getMLBTeamColors(game.awayTeam.name);
                              return (
                                <div
                                  className="team-logo-small mlb-logo"
                                  style={{
                                    background: primary,
                                    color: secondary,
                                    border: `2px solid ${secondary}`
                                  }}
                                >
                                  {game.awayTeam.abbreviation || (game.awayTeam.name ? game.awayTeam.name.substring(0, 3) : '')}
                                </div>
                              );
                            })()}
                            <div className="team-name-small">{game.awayTeam?.name}</div>
                            <div className="team-score-small">{game.awayTeam?.score}</div>
                          </div>
                          <div className="game-team">
                            {(() => {
                              const [primary, secondary] = getMLBTeamColors(game.homeTeam.name);
                              return (
                                <div
                                  className="team-logo-small mlb-logo"
                                  style={{
                                    background: primary,
                                    color: secondary,
                                    border: `2px solid ${secondary}`
                                  }}
                                >
                                  {game.homeTeam.abbreviation || (game.homeTeam.name ? game.homeTeam.name.substring(0, 3) : '')}
                                </div>
                              );
                            })()}
                            <div className="team-name-small">{game.homeTeam?.name}</div>
                            <div className="team-score-small">{game.homeTeam?.score}</div> 
                          </div>
                        </div>
                        {/* MLB Player Table Preview */}
                        <div className="mlb-players-preview">
                          <div className="mlb-team-players">
                            <div className="mlb-team-label">{game.awayTeam?.abbreviation || game.awayTeam?.name} Batters</div>
                            <table className="mlb-player-table">
                              <thead>
                                <tr>
                                  <th>Player</th>
                                  <th>AB</th>
                                  <th>H</th>
                                  <th>RBI</th>
                                </tr>
                              </thead>
                              <tbody>
                                {game.awayTeam?.players
                                  ?.filter(p => p.atBats > 0)
                                  .sort((a, b) => b.atBats - a.atBats || b.hits - a.hits)
                                  .slice(0, 3)
                                  .map((player, idx) => (
                                    <tr key={idx}>
                                      <td>{player.name}</td>
                                      <td>{player.atBats}</td>
                                      <td>{player.hits}</td>
                                      <td>{player.rbi}</td>
                                    </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mlb-team-players">
                            <div className="mlb-team-label">{game.homeTeam?.abbreviation || game.homeTeam?.name} Batters</div>
                            <table className="mlb-player-table">
                              <thead>
                                <tr>
                                  <th>Player</th>
                                  <th>AB</th>
                                  <th>H</th>
                                  <th>RBI</th>
                                </tr>
                              </thead>
                              <tbody>
                                {game.homeTeam?.players
                                  ?.filter(p => p.atBats > 0)
                                  .sort((a, b) => b.atBats - a.atBats || b.hits - a.hits)
                                  .slice(0, 3)
                                  .map((player, idx) => (
                                    <tr key={idx}>
                                      <td>{player.name}</td>
                                      <td>{player.atBats}</td>
                                      <td>{player.hits}</td>
                                      <td>{player.rbi}</td>
                                    </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LiveGames;