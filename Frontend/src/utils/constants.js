export const METRICS = {
  POINTS: 'points',
  REBOUNDS: 'rebounds',
  ASSISTS: 'assists',
  STEALS: 'steals',
  BLOCKS: 'blocks',
  POINTS_REBOUNDS: 'points + rebounds',
  POINTS_ASSISTS: 'points + assists',
  POINTS_ASSISTS_REBOUNDS: 'points + assists + rebounds',
  ASSISTS_REBOUNDS: 'assists + rebounds',
  BLOCKS_STEALS: 'blocks + steals'
};

export const TEAM_COLORS = {
  "Atlanta Hawks": "#E03A3E",
  "Boston Celtics": "#007A33",
  "Brooklyn Nets": "#000000",
  "Charlotte Hornets": "#1D1160",
  "Chicago Bulls": "#CE1141",
  "Cleveland Cavaliers": "#860038",
  "Dallas Mavericks": "#00538C",
  "Denver Nuggets": "#0E2240",
  "Detroit Pistons": "#C8102E",
  "Golden State Warriors": "#1D428A",
  "Houston Rockets": "#CE1141",
  "Indiana Pacers": "#002D62",
  "Los Angeles Clippers": "#ED174C",
  "Los Angeles Lakers": "#552583",
  "Memphis Grizzlies": "#5D76A9",
  "Miami Heat": "#98002E",
  "Milwaukee Bucks": "#00471B",
  "Minnesota Timberwolves": "#0C2340",
  "New Orleans Pelicans": "#0C2340",
  "New York Knicks": "#006BB6",
  "Oklahoma City Thunder": "#007AC1",
  "Orlando Magic": "#0077C0",
  "Philadelphia 76ers": "#006BB6",
  "Phoenix Suns": "#1D1160",
  "Portland Trail Blazers": "#E03A3E",
  "Sacramento Kings": "#5A2D81",
  "San Antonio Spurs": "#C4CED4",
  "Toronto Raptors": "#CE1141",
  "Utah Jazz": "#002B5C",
  "Washington Wizards": "#002B5C"
};

export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:5000/api',
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    GOOGLE_SIGNIN: '/google-signin'
  },
  USER: {
    PROFILE: '/user/profile',
    DAILY_ALLOWANCE: '/user/dailyAllowance'
  },
  AUCTIONS: {
    CREATE: '/auctions',
    ALL: '/auctions/all',
    ACTIVE: '/auctions/active',
    BUY: '/auctions/buy',
    SUCCESSFUL: '/auctions/successful',
    GAMES: '/auctions/games'
  },
  BOX_SCORES: {
    ALL: '/boxScores',
    PLAYER: '/boxScores/player',
    GAMES: '/boxScores/games'
  },
  LEADERBOARD: {
    SBM: '/leaderboard/sbm',
    ALU: '/leaderboard/alu'
  }
};