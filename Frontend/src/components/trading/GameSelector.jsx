import React from 'react';
import PropTypes from 'prop-types';
import { modernSelectStyle } from '../../styles/components/forms.styles';

const slabStyle = {
  background: '#23272f',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '8px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  border: '2px solid transparent',
  transition: 'border 0.2s, box-shadow 0.2s',
};
const selectedSlabStyle = {
  ...slabStyle,
  border: '2px solid #6366F1',
  boxShadow: '0 0 8px #6366F1',
};
const timeStyle = {
  color: '#FFC107',
  fontWeight: 600,
  fontSize: '1.1em',
  marginLeft: 16,
};
const playerSlabStyle = {
  background: '#181c22',
  borderRadius: '10px',
  padding: '10px 12px',
  margin: '6px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: '2px solid transparent',
  transition: 'border 0.2s, box-shadow 0.2s',
  fontWeight: 500,
  fontSize: '1em',
  minHeight: 36,
};
const selectedPlayerSlabStyle = {
  ...playerSlabStyle,
  border: '2px solid #10B981',
  boxShadow: '0 0 8px #10B981',
};
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
};
const playerGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '8px',
  marginTop: 8,
};

function formatGameTime(timeStr) {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  if (isNaN(d)) return timeStr;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getGameTime(game) {
  if (typeof game === 'object' && game !== null) {
    if (game.game_time && typeof game.game_time === 'string' && game.game_time.trim()) return game.game_time;
    if (game.gameTime && typeof game.gameTime === 'string' && game.gameTime.trim()) return game.gameTime;
    if (game.startTime && typeof game.startTime === 'string' && game.startTime.trim()) return game.startTime;
    if (game.time && typeof game.time === 'string' && game.time.trim()) return game.time;
  }
  return '';
}

function getGameDisplay(game) {
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

const GameSelector = ({
  games, selectedGame, onGameChange, loading, error,
  players, selectedPlayer, onPlayerChange, playersLoading, playersError,
  mlbCategory
}) => {
  let displayPlayers = players;
  if ((!players || players.length === 0) && selectedGame && (
    Array.isArray(selectedGame.team1_batters) ||
    Array.isArray(selectedGame.team2_batters) ||
    selectedGame.team1_pitcher ||
    selectedGame.team2_pitcher
  )) {
    if (mlbCategory === 'hitting') {
      const batters = [
        ...(Array.isArray(selectedGame.team1_batters) ? selectedGame.team1_batters : []),
        ...(Array.isArray(selectedGame.team2_batters) ? selectedGame.team2_batters : [])
      ];
      displayPlayers = batters.map(name => ({ name }));
    } else if (mlbCategory === 'pitching') {
      const pitchers = [
        selectedGame.team1_pitcher,
        selectedGame.team2_pitcher
      ].filter(Boolean);
      displayPlayers = pitchers.map(name => ({ name }));
    }
  }

  if (loading) return <div style={{ color: '#aaa', margin: '12px 0' }}>Loading games...</div>;
  if (error) return <div style={{ color: '#F44336', margin: '12px 0' }}>{error}</div>;
  if (!games || games.length === 0) return <div style={{ color: '#aaa', margin: '12px 0' }}>No games available.</div>;

  return (
    <div style={{ margin: '12px 0' }}>
      <div style={{ ...gridStyle, marginBottom: 16 }}>
        {games.map((game, idx) => {
          let display = getGameDisplay(game);
          let time = getGameTime(game);
          let key = game.game_id || game.id || display || idx;
          if (!display && typeof game === 'string') display = game;
          if (!display && game && game.team1 && game.team2) display = `${game.team1} vs ${game.team2}`;
          if (!display) display = key;
          return (
            <div
              key={key}
              style={selectedGame && selectedGame.game_id === game.game_id ? selectedSlabStyle : slabStyle}
              onClick={() => onGameChange(game)}
              tabIndex={0}
              role="button"
              aria-pressed={selectedGame && selectedGame.game_id === game.game_id}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onGameChange(game); }}
            >
              <span>{display}</span>
              {time && <span style={timeStyle}>{time}</span>}
            </div>
          );
        })}
      </div>
      {selectedGame && (
        <div>
          <div style={{ fontWeight: 600, color: '#aaa', marginBottom: 6 }}>Select Player</div>
          {playersLoading ? (
            <div style={{ color: '#aaa', margin: '8px 0' }}>Loading players...</div>
          ) : playersError ? (
            <div style={{ color: '#F44336', margin: '8px 0' }}>{playersError}</div>
          ) : (!displayPlayers || displayPlayers.length === 0) ? (
            <div style={{ color: '#aaa', margin: '8px 0' }}>No players available.</div>
          ) : (
            <div style={playerGridStyle}>
              {displayPlayers.map((player, idx) => (
                <div
                  key={player.id || player.name || idx}
                  style={selectedPlayer === player.name ? selectedPlayerSlabStyle : playerSlabStyle}
                  onClick={() => onPlayerChange(player.name)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPlayer === player.name}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onPlayerChange(player.name); }}
                >
                  {player.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

GameSelector.propTypes = {
  games: PropTypes.array,
  selectedGame: PropTypes.object,
  onGameChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  players: PropTypes.array,
  selectedPlayer: PropTypes.string,
  onPlayerChange: PropTypes.func.isRequired,
  playersLoading: PropTypes.bool,
  playersError: PropTypes.string,
};

export default GameSelector;