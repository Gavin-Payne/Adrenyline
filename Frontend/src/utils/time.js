import moment from 'moment-timezone';

export const getTimeRemaining = (expirationTime) => {
  const now = new Date();
  const expiration = new Date(expirationTime);
  const diff = expiration - now;
  
  if (diff <= 0) {
    return { timeString: "Expired", percentRemaining: 0 };
  }
  
  const totalDurationMs = 24 * 60 * 60 * 1000; // Assume max duration of 24 hours
  const percentRemaining = Math.min(100, (diff / totalDurationMs) * 100);
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return { 
      timeString: `${hours}h ${minutes}m`,
      percentRemaining
    };
  } else {
    return { 
      timeString: `${minutes}m`,
      percentRemaining
    };
  }
};

export const getTimeColor = (percentRemaining) => {
  if (percentRemaining > 50) {
    return '#4CAF50'; // Green for plenty of time
  } else if (percentRemaining > 20) {
    return '#FFC107'; // Yellow/amber for running lower
  } else {
    return '#F44336'; // Red for almost out of time
  }
};