import api from './api';

export const auctionService = {
  createAuction: async (auctionData) => {
    try {
      const response = await api.post('/auctions', auctionData);
      return response.data;
    } catch (error) {
      console.error("Error creating auction:", error);
      throw error.response?.data || error.message;
    }
  },

  getActiveAuctions: async () => {
    try {
      const response = await api.get('/auctions/active');
      return response.data;
    } catch (error) {
      console.error("Error fetching active auctions:", error);
      throw error.response?.data || error.message;
    }
  },

  getAllAuctions: async () => {
    try {
      const response = await api.get('/auctions/all');
      return response.data;
    } catch (error) {
      console.error("Error fetching all auctions:", error);
      throw error.response?.data || error.message;
    }
  },

  getGames: async (date) => {
    try {
      const response = await api.get(`/auctions/games?date=${date}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching games:", error);
      throw error.response?.data || error.message;
    }
  },

  buyAuction: async (auctionId) => {
    try {
      const response = await api.post(`/auctions/buy/${auctionId}`);
      return response.data;
    } catch (error) {
      console.error("Error buying auction:", error);
      throw error.response?.data || error.message;
    }
  }
};