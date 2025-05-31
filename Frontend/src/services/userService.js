import api from './api';

export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error.response?.data || error.message;
    }
  },

  claimDailyAllowance: async () => {
    try {
      const response = await api.post('/user/dailyAllowance');
      return response.data;
    } catch (error) {
      console.error("Error claiming daily allowance:", error);
      throw error.response?.data || error.message;
    }
  }
};