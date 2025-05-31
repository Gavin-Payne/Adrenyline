// Updated official NBA team colors using RGB values
const teamColors = {
  // Atlanta Hawks
  'Hawks': ['rgb(225, 68, 52)', 'rgb(196, 214, 0)', 'rgb(38, 40, 42)'],
  'Atlanta': ['rgb(225, 68, 52)', 'rgb(196, 214, 0)', 'rgb(38, 40, 42)'],
  
  // Boston Celtics
  'Celtics': ['rgb(0, 122, 51)', 'rgb(139, 111, 78)', 'rgb(150, 56, 33)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)'],
  'Boston': ['rgb(0, 122, 51)', 'rgb(139, 111, 78)', 'rgb(150, 56, 33)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)'],
  
  // Brooklyn Nets
  'Nets': ['rgb(0, 0, 0)', 'rgb(255, 255, 255)'],
  'Brooklyn': ['rgb(0, 0, 0)', 'rgb(255, 255, 255)'],
  
  // Charlotte Hornets
  'Hornets': ['rgb(29, 17, 96)', 'rgb(0, 120, 140)', 'rgb(161, 161, 164)'],
  'Charlotte': ['rgb(29, 17, 96)', 'rgb(0, 120, 140)', 'rgb(161, 161, 164)'],
  
  // Chicago Bulls
  'Bulls': ['rgb(206, 17, 65)', 'rgb(6, 25, 34)'],
  'Chicago': ['rgb(206, 17, 65)', 'rgb(6, 25, 34)'],
  
  // Cleveland Cavaliers
  'Cavaliers': ['rgb(134, 0, 56)', 'rgb(4, 30, 66)', 'rgb(253, 187, 48)', 'rgb(0, 0, 0)'],
  'Cleveland': ['rgb(134, 0, 56)', 'rgb(4, 30, 66)', 'rgb(253, 187, 48)', 'rgb(0, 0, 0)'],
  'Cavs': ['rgb(134, 0, 56)', 'rgb(4, 30, 66)', 'rgb(253, 187, 48)', 'rgb(0, 0, 0)'],
  
  // Dallas Mavericks
  'Mavericks': ['rgb(0, 83, 188)', 'rgb(0, 43, 92)', 'rgb(187, 196, 202)', 'rgb(6, 25, 34)'],
  'Dallas': ['rgb(0, 83, 188)', 'rgb(0, 43, 92)', 'rgb(187, 196, 202)', 'rgb(6, 25, 34)'],
  'Mavs': ['rgb(0, 83, 188)', 'rgb(0, 43, 92)', 'rgb(187, 196, 202)', 'rgb(6, 25, 34)'],
  
  // Denver Nuggets
  'Nuggets': ['rgb(13, 34, 64)', 'rgb(255, 198, 39)', 'rgb(139, 35, 50)', 'rgb(29, 66, 138)'],
  'Denver': ['rgb(13, 34, 64)', 'rgb(255, 198, 39)', 'rgb(139, 35, 50)', 'rgb(29, 66, 138)'],
  
  // Detroit Pistons
  'Pistons': ['rgb(200, 16, 46)', 'rgb(29, 66, 138)', 'rgb(181, 179, 179)', 'rgb(0, 45, 98)'],
  'Detroit': ['rgb(200, 16, 46)', 'rgb(29, 66, 138)', 'rgb(181, 179, 179)', 'rgb(0, 45, 98)'],
  
  // Golden State Warriors
  'Warriors': ['rgb(29, 66, 138)', 'rgb(255, 199, 44)'],
  'Golden State': ['rgb(29, 66, 138)', 'rgb(255, 199, 44)'],
  'GSW': ['rgb(29, 66, 138)', 'rgb(255, 199, 44)'],
  
  // Houston Rockets
  'Rockets': ['rgb(206, 17, 65)', 'rgb(6, 25, 34)', 'rgb(196, 206, 211)'],
  'Houston': ['rgb(206, 17, 65)', 'rgb(6, 25, 34)', 'rgb(196, 206, 211)'],
  
  // Indiana Pacers
  'Pacers': ['rgb(0, 45, 98)', 'rgb(253, 187, 48)', 'rgb(190, 192, 194)'],
  'Indiana': ['rgb(0, 45, 98)', 'rgb(253, 187, 48)', 'rgb(190, 192, 194)'],
  
  // Los Angeles Clippers
  'Clippers': ['rgb(200, 16, 46)', 'rgb(29, 66, 148)', 'rgb(190, 192, 194)', 'rgb(0, 0, 0)'],
  'LAC': ['rgb(200, 16, 46)', 'rgb(29, 66, 148)', 'rgb(190, 192, 194)', 'rgb(0, 0, 0)'],
  
  // Los Angeles Lakers
  'Lakers': ['rgb(85, 37, 130)', 'rgb(253, 185, 39)', 'rgb(6, 25, 34)'],
  'LAL': ['rgb(85, 37, 130)', 'rgb(253, 185, 39)', 'rgb(6, 25, 34)'],
  
  // Memphis Grizzlies
  'Grizzlies': ['rgb(93, 118, 169)', 'rgb(18, 23, 63)', 'rgb(255, 187, 34)', 'rgb(112, 114, 113)'],
  'Memphis': ['rgb(93, 118, 169)', 'rgb(18, 23, 63)', 'rgb(255, 187, 34)', 'rgb(112, 114, 113)'],
  
  // Miami Heat
  'Heat': ['rgb(152, 0, 46)', 'rgb(249, 160, 27)', 'rgb(6, 25, 34)'],
  'Miami': ['rgb(152, 0, 46)', 'rgb(249, 160, 27)', 'rgb(6, 25, 34)'],
  
  // Milwaukee Bucks
  'Bucks': ['rgb(0, 71, 27)', 'rgb(240, 235, 210)', 'rgb(0, 125, 197)', 'rgb(6, 25, 34)'],
  'Milwaukee': ['rgb(0, 71, 27)', 'rgb(240, 235, 210)', 'rgb(0, 125, 197)', 'rgb(6, 25, 34)'],
  
  // Minnesota Timberwolves
  'Timberwolves': ['rgb(12, 35, 64)', 'rgb(35, 97, 146)', 'rgb(158, 162, 162)', 'rgb(120, 190, 32)'],
  'Minnesota': ['rgb(12, 35, 64)', 'rgb(35, 97, 146)', 'rgb(158, 162, 162)', 'rgb(120, 190, 32)'],
  'Wolves': ['rgb(12, 35, 64)', 'rgb(35, 97, 146)', 'rgb(158, 162, 162)', 'rgb(120, 190, 32)'],
  
  // New Orleans Pelicans
  'Pelicans': ['rgb(0, 22, 65)', 'rgb(225, 58, 62)', 'rgb(180, 151, 90)'],
  'New Orleans': ['rgb(0, 22, 65)', 'rgb(225, 58, 62)', 'rgb(180, 151, 90)'],
  
  // New York Knicks
  'Knicks': ['rgb(0, 107, 182)', 'rgb(245, 132, 38)', 'rgb(190, 192, 194)', 'rgb(35, 31, 32)'],
  'New York': ['rgb(0, 107, 182)', 'rgb(245, 132, 38)', 'rgb(190, 192, 194)', 'rgb(35, 31, 32)'],
  'NY': ['rgb(0, 107, 182)', 'rgb(245, 132, 38)', 'rgb(190, 192, 194)', 'rgb(35, 31, 32)'],
  
  // Oklahoma City Thunder
  'Thunder': ['rgb(0, 125, 195)', 'rgb(239, 59, 36)', 'rgb(0, 45, 98)', 'rgb(253, 187, 48)'],
  'Oklahoma City': ['rgb(0, 125, 195)', 'rgb(239, 59, 36)', 'rgb(0, 45, 98)', 'rgb(253, 187, 48)'],
  'OKC': ['rgb(0, 125, 195)', 'rgb(239, 59, 36)', 'rgb(0, 45, 98)', 'rgb(253, 187, 48)'],
  
  // Orlando Magic
  'Magic': ['rgb(0, 125, 197)', 'rgb(196, 206, 211)', 'rgb(6, 25, 34)'],
  'Orlando': ['rgb(0, 125, 197)', 'rgb(196, 206, 211)', 'rgb(6, 25, 34)'],
  
  // Philadelphia 76ers
  '76ers': ['rgb(0, 107, 182)', 'rgb(237, 23, 76)', 'rgb(0, 43, 92)', 'rgb(196, 206, 211)'],
  'Philadelphia': ['rgb(0, 107, 182)', 'rgb(237, 23, 76)', 'rgb(0, 43, 92)', 'rgb(196, 206, 211)'],
  'Sixers': ['rgb(0, 107, 182)', 'rgb(237, 23, 76)', 'rgb(0, 43, 92)', 'rgb(196, 206, 211)'],
  
  // Phoenix Suns
  'Suns': ['rgb(29, 17, 96)', 'rgb(229, 95, 32)', 'rgb(6, 25, 34)', 'rgb(99, 113, 122)', 'rgb(249, 160, 27)'],
  'Phoenix': ['rgb(29, 17, 96)', 'rgb(229, 95, 32)', 'rgb(6, 25, 34)', 'rgb(99, 113, 122)', 'rgb(249, 160, 27)'],
  
  // Portland Trail Blazers
  'Trail Blazers': ['rgb(224, 58, 62)', 'rgb(6, 25, 34)'],
  'Blazers': ['rgb(224, 58, 62)', 'rgb(6, 25, 34)'],
  'Portland': ['rgb(224, 58, 62)', 'rgb(6, 25, 34)'],
  
  // Sacramento Kings
  'Kings': ['rgb(91, 43, 130)', 'rgb(99, 113, 122)', 'rgb(6, 25, 34)'],
  'Sacramento': ['rgb(91, 43, 130)', 'rgb(99, 113, 122)', 'rgb(6, 25, 34)'],
  
  // San Antonio Spurs
  'Spurs': ['rgb(196, 206, 211)', 'rgb(6, 25, 34)'],
  'San Antonio': ['rgb(196, 206, 211)', 'rgb(6, 25, 34)'],
  
  // Toronto Raptors
  'Raptors': ['rgb(206, 17, 65)', 'rgb(6, 25, 34)', 'rgb(161, 161, 164)', 'rgb(180, 151, 90)'],
  'Toronto': ['rgb(206, 17, 65)', 'rgb(6, 25, 34)', 'rgb(161, 161, 164)', 'rgb(180, 151, 90)'],
  
  // Utah Jazz
  'Jazz': ['rgb(0, 43, 92)', 'rgb(0, 71, 27)', 'rgb(249, 160, 27)'],
  'Utah': ['rgb(0, 43, 92)', 'rgb(0, 71, 27)', 'rgb(249, 160, 27)'],
  
  // Washington Wizards
  'Wizards': ['rgb(0, 43, 92)', 'rgb(227, 24, 55)', 'rgb(196, 206, 212)'],
  'Washington': ['rgb(0, 43, 92)', 'rgb(227, 24, 55)', 'rgb(196, 206, 212)'],
  
  // Default fallback
  'Team A': ['rgb(52, 152, 219)', 'rgb(41, 128, 185)'],
  'Team B': ['rgb(231, 76, 60)', 'rgb(192, 57, 43)']
};

// Get team colors by searching for team name
export const getTeamColors = (teamName) => {
  if (!teamName) return ['rgb(44, 62, 80)', 'rgb(52, 73, 94)']; // Default dark colors
  
  const normalizedName = teamName.trim();
  
  // Try to find an exact match first
  if (teamColors[normalizedName]) {
    return teamColors[normalizedName];
  }
  
  // If no exact match, look for keywords in the team name
  for (const key in teamColors) {
    if (normalizedName.includes(key)) {
      return teamColors[key];
    }
  }
  
  // Fallback colors based on first letter - gives unique but consistent colors
  const charCode = normalizedName.charCodeAt(0) || 65;
  const hue1 = (charCode * 15) % 360;
  const hue2 = (hue1 + 40) % 360;
  
  return [
    `hsl(${hue1}, 70%, 45%)`,
    `hsl(${hue2}, 70%, 35%)`
  ];
};

// Helper functions for time visualization
export const getTimeRemaining = (expirationTime) => {
  if (!expirationTime) return { timeString: "Unknown", percentRemaining: 100 };
  
  const now = new Date();
  const expiration = new Date(expirationTime);
  const diff = expiration - now;
  
  if (diff <= 0) return { timeString: "Expired", percentRemaining: 0 };
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const totalDurationMs = 24 * 60 * 60 * 1000;
  const percentRemaining = Math.min(100, (diff / totalDurationMs) * 100);
  
  return { 
    timeString: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    percentRemaining
  };
};

export const getTimeColor = (percentRemaining) => {
  if (percentRemaining > 50) return '#4CAF50';
  if (percentRemaining > 20) return '#FFC107';
  return '#F44336';
};

export const extractTeams = (gameString) => {
  if (!gameString) return ['Team A', 'Team B'];
  return gameString.split(' vs ');
};

// Function to get opposite condition for non-sellers
export const getOppositeCondition = (condition) => {
  if (!condition) return '';
  
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition === 'over') return 'under';
  if (lowerCondition === 'under') return 'over';
  if (lowerCondition === 'exactly') return 'not exactly';
  if (lowerCondition === 'not exactly') return 'exactly';
  
  return condition; // Return original if no match
};

// Helper function to get team logos
export const getTeamLogo = (teamName) => {
  if (!teamName) return null;
  
  const normalizedName = teamName.trim().toLowerCase();
  
  // Map of team names to logo paths
  // You would need to add actual logo files to your assets folder
  const teamLogos = {
    'hawks': '/assets/team-logos/hawks.png',
    'atlanta': '/assets/team-logos/hawks.png',
    'celtics': '/assets/team-logos/celtics.png',
    'boston': '/assets/team-logos/celtics.png',
    // Add all other teams similarly
  };
  
  // Try to find an exact match
  for (const key in teamLogos) {
    if (normalizedName === key || normalizedName.includes(key)) {
      return teamLogos[key];
    }
  }
  
  return null; // No matching logo found
};

// Get a contrasting text color for background
export const getContrastColor = (backgroundColor) => {
  // Extract RGB from the color string
  const rgbMatch = backgroundColor.match(/\d+/g);
  if (!rgbMatch || rgbMatch.length < 3) {
    return '#ffffff'; // Default to white
  }
  
  const r = parseInt(rgbMatch[0]);
  const g = parseInt(rgbMatch[1]);
  const b = parseInt(rgbMatch[2]);
  
  // Calculate luminance - weights from WCAG 2.0
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white or black based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const MLB_TEAM_COLORS = {
  Angels: ['#BA0021', '#862633'],
  Astros: ['#EB6E1F', '#002D62'],
  Athletics: ['#003831', '#EFB21E'],
  BlueJays: ['#134A8E', '#1D2D5C'],
  Braves: ['#CE1141', '#13274F'],
  Brewers: ['#FFC52F', '#12284B'],
  Cardinals: ['#C41E3A', '#0C2340'],
  Cubs: ['#0E3386', '#CC3433'],
  Diamondbacks: ['#A71930', '#E3D4AD'],
  Dodgers: ['#005A9C', '#EF3E42'],
  Giants: ['#FD5A1E', '#27251F'],
  Guardians: ['#E31937', '#002D62'],
  Mariners: ['#0C2C56', '#005C5C'],
  Marlins: ['#00A3E0', '#EF3340'],
  Mets: ['#FF5910', '#002D72'],
  Nationals: ['#AB0003', '#14225A'],
  Orioles: ['#DF4601', '#000000'],
  Padres: ['#2F241D', '#FFC425'],
  Phillies: ['#E81828', '#002D72'],
  Pirates: ['#FDB827', '#27251F'],
  Rangers: ['#003278', '#C0111F'],
  Rays: ['#8FBCE6', '#092C5C'],
  RedSox: ['#BD3039', '#0C2340'],
  Reds: ['#C6011F', '#000000'],
  Rockies: ['#333366', '#C4CED4'],
  Royals: ['#004687', '#C09A5B'],
  Tigers: ['#0C2340', '#FA4616'],
  Twins: ['#002B5C', '#D31145'],
  WhiteSox: ['#27251F', '#C4CED4'],
  Yankees: ['#132448', '#C4CED4'],
};

export function getMLBTeamColors(team) {
  if (!team) return ['#888', '#444'];
  // Try exact match first
  if (MLB_TEAM_COLORS[team]) return MLB_TEAM_COLORS[team];

  // Try partial/case-insensitive match
  const normalized = team.toLowerCase();
  for (const key in MLB_TEAM_COLORS) {
    if (normalized.includes(key.toLowerCase())) {
      return MLB_TEAM_COLORS[key];
    }
  }
  return ['#888', '#444'];
}