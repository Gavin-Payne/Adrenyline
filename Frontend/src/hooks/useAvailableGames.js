import { useState, useCallback } from 'react';

const useAvailableGames = (token) => {
  const [availableGames, setAvailableGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchGames = useCallback(async (date, sport, mlbCategory) => {
    try {
      setLoading(true);
      setFormError('');
      let url;
      if (sport === 'mlb') {
        url = `${process.env.REACT_APP_API_URL}/mlb/games?date=${date}`;
      } else {
        url = `${process.env.REACT_APP_API_URL}/auctions/games?date=${date}&sport=${sport}`;
        if (mlbCategory) url += `&category=${mlbCategory}`;
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`Failed to fetch games (${response.status}): ${response.statusText}`);
      const data = await response.json();
      setAvailableGames(Array.isArray(data) ? data : []);
    } catch (error) {
      setFormError(error.message);
      setAvailableGames([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { availableGames, loading, formError, fetchGames, setAvailableGames, setFormError };
};

export default useAvailableGames;