import React, { useEffect } from 'react';

const MLBGameSelector = ({
  selectedDate,
  selectedGame,
  setSelectedGame,
  availableGames,
  loading,
  fetchGames,
  formError,
  mlbCategory,
  selectedSport
}) => {
  useEffect(() => {
    if (selectedDate && selectedSport === 'mlb') {
      fetchGames(selectedDate, 'mlb', mlbCategory);
    }
  }, [selectedDate, mlbCategory, selectedSport, fetchGames]);

  return (
    <div>
      <label>MLB Game</label>
      <select
        value={selectedGame}
        onChange={e => setSelectedGame(e.target.value)}
        disabled={loading || !availableGames.length}
        required
      >
        <option value="">Select Game</option>
        {availableGames.map((game, idx) => (
          <option key={idx} value={game}>{game}</option>
        ))}
      </select>
      {loading && <div>Loading games...</div>}
      {formError && <div style={{ color: 'red' }}>{formError}</div>}
    </div>
  );
};

export default MLBGameSelector;