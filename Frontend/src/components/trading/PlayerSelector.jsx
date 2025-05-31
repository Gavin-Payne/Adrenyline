import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { modernSelectStyle } from '../../styles/components/forms.styles';

const PlayerSelector = ({ 
  selectedGame, 
  selectedPlayer, 
  onPlayerChange, 
  token 
}) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!selectedGame) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const teams = selectedGame.split(' vs ');
        if (teams.length === 2) {
          const [team1Response, team2Response] = await Promise.all([
            fetch(`http://localhost:5000/api/players/${teams[0]}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }),
            fetch(`http://localhost:5000/api/players/${teams[1]}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
          ]);

          if (!team1Response.ok || !team2Response.ok) {
            throw new Error('Failed to fetch players');
          }

          const team1Players = await team1Response.json();
          const team2Players = await team2Response.json();
          setPlayers([...team1Players, ...team2Players]);
        }
      } catch (err) {
        setError('Failed to load players');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedGame, token]);

  if (loading) return <p>Loading players...</p>;
  if (error) return <p>{error}</p>;

  return (
    <select
      value={selectedPlayer}
      onChange={onPlayerChange}
      style={modernSelectStyle}
      required
      disabled={!selectedGame}
    >
      <option value="">Select Player</option>
      {players.map((player, index) => (
        <option key={index} value={player}>{player}</option>
      ))}
    </select>
  );
};

PlayerSelector.propTypes = {
  selectedGame: PropTypes.string,
  selectedPlayer: PropTypes.string,
  onPlayerChange: PropTypes.func.isRequired,
  token: PropTypes.string
};

export default PlayerSelector;