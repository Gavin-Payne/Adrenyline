import React, { useState } from 'react';
import { modernInputStyle, modernSelectStyle, modernButtonStyle } from '../../styles/components/forms.styles';

const AuctionSearch = ({ onSearch }) => {
  // Add state for search fields
  const [searchDate, setSearchDate] = useState('');
  const [searchTeam, setSearchTeam] = useState('');
  const [searchPlayer, setSearchPlayer] = useState('');
  const [searchMetric, setSearchMetric] = useState('');
  const [searchSport, setSearchSport] = useState('nba');
  const [mlbCategory, setMlbCategory] = useState('hitting');

  // Add the missing style definition
  const searchContainerStyle = {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
  };

  // NBA and MLB team lists
  const NBA_TEAMS = [
    'Hawks', 'Celtics', 'Nets', 'Hornets', 'Bulls', 'Cavaliers', 'Mavericks', 'Nuggets', 'Pistons', 'Warriors',
    'Rockets', 'Pacers', 'Clippers', 'Lakers', 'Grizzlies', 'Heat', 'Bucks', 'Timberwolves', 'Pelicans', 'Knicks',
    'Thunder', 'Magic', '76ers', 'Suns', 'Blazers', 'Kings', 'Spurs', 'Raptors', 'Jazz', 'Wizards'
  ];
  const MLB_TEAMS = [
    'Angels', 'Astros', 'Athletics', 'Blue Jays', 'Braves', 'Brewers', 'Cardinals', 'Cubs', 'Diamondbacks', 'Dodgers',
    'Giants', 'Guardians', 'Mariners', 'Marlins', 'Mets', 'Nationals', 'Orioles', 'Padres', 'Phillies', 'Pirates',
    'Rangers', 'Rays', 'Red Sox', 'Reds', 'Rockies', 'Royals', 'Tigers', 'Twins', 'White Sox', 'Yankees'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      date: searchDate,
      team: searchTeam,
      player: searchPlayer,
      metric: searchMetric,
      sport: searchSport,
      mlbCategory: searchSport === 'mlb' ? mlbCategory : undefined
    };
    console.log('[AuctionSearch] handleSubmit called, payload:', payload);
    if (typeof onSearch !== 'function') {
      console.error('[AuctionSearch] onSearch prop is not a function:', onSearch);
    }
    onSearch(payload);
  };

  return (
    <div style={searchContainerStyle}>
      <form onSubmit={handleSubmit}>
        <select
          value={searchSport}
          onChange={e => {
            setSearchSport(e.target.value);
            if (e.target.value !== 'mlb') setMlbCategory('hitting');
            setSearchMetric('');
          }}
          style={modernSelectStyle}
        >
          <option value="nba">NBA</option>
          <option value="mlb">MLB</option>
        </select>
        {searchSport === 'mlb' && (
          <select
            value={mlbCategory}
            onChange={e => {
              setMlbCategory(e.target.value);
              setSearchMetric('');
            }}
            style={modernSelectStyle}
          >
            <option value="hitting">Hitting</option>
            <option value="pitching">Pitching</option>
          </select>
        )}
        <input 
          type="date" 
          value={searchDate} 
          onChange={(e) => setSearchDate(e.target.value)} 
          style={modernInputStyle}
        />
        <select
          value={searchTeam}
          onChange={e => setSearchTeam(e.target.value)}
          style={modernSelectStyle}
        >
          <option value="">Select Team</option>
          {(searchSport === 'nba' ? NBA_TEAMS : MLB_TEAMS).map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
        <input 
          type="text" 
          placeholder="Player" 
          value={searchPlayer} 
          onChange={(e) => setSearchPlayer(e.target.value)} 
          style={modernInputStyle}
        />
        <select 
          value={searchMetric} 
          onChange={(e) => setSearchMetric(e.target.value)} 
          style={modernSelectStyle}
        >
          <option value="">Select Metric</option>
          {searchSport === 'nba' && (
            <>
              <option value="points">Points</option>
              <option value="rebounds">Rebounds</option>
              <option value="assists">Assists</option>
              <option value="steals">Steals</option>
              <option value="blocks">Blocks</option>
              <option value="points + rebounds">Points + Rebounds</option>
              <option value="points + assists">Points + Assists</option>
              <option value="points + assists + rebounds">Points + Assists + Rebounds</option>
              <option value="assists + rebounds">Assists + Rebounds</option>
              <option value="blocks + steals">Blocks + Steals</option>
            </>
          )}
          {searchSport === 'mlb' && mlbCategory === 'hitting' && (
            <>
              <option value="hits">Hits</option>
              <option value="walks">Walks</option>
              <option value="strikeouts">Strikeouts</option>
              <option value="total bases">Total Bases</option>
              <option value="steals">Steals</option>
              <option value="homeruns">Home Runs</option>
            </>
          )}
          {searchSport === 'mlb' && mlbCategory === 'pitching' && (
            <>
              <option value="walks">Walks</option>
              <option value="hits">Hits</option>
              <option value="strikeouts">Strikeouts</option>
              <option value="pitching outs">Pitching Outs</option>
              <option value="earned runs">Earned Runs</option>
            </>
          )}
        </select>
        <button type="submit" style={modernButtonStyle}>
          Search Auctions
        </button>
      </form>
    </div>
  );
};

export default AuctionSearch;