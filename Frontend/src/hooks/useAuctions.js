import { useState, useEffect } from 'react';
import api from '../services/api';
import moment from 'moment';

const removeDiacritics = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const useAuctions = (token, refreshUserData) => {
  const [allAuctions, setAllAuctions] = useState([]);
  const [allAuctionsMaster, setAllAuctionsMaster] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [successfulAuctions, setSuccessfulAuctions] = useState([]);
  const [completedAuctions, setCompletedAuctions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchAllAuctions();
      fetchActiveAuctions();
      fetchSuccessfulAuctions();
    }
  }, [token]);

  const fetchAllAuctions = async () => {
    try {
      const response = await api.get('/auctions/all');
      const auctions = response.data;
      const validAuctions = auctions.filter(auction => new Date(auction.expirationTime).getTime() > Date.now());
      setAllAuctions(validAuctions);
      setAllAuctionsMaster(validAuctions);
    } catch {}
  };

  const fetchActiveAuctions = async () => {
    try {
      const response = await api.get('/auctions/active');
      setActiveAuctions(response.data);
    } catch {
      setActiveAuctions([]);
    }
  };

  const fetchSuccessfulAuctions = async () => {
    try {
      const response = await api.get('/auctions/successful');
      setSuccessfulAuctions(response.data);
    } catch {
      setSuccessfulAuctions([]);
    }
  };

  const fetchUserAuctions = async () => {
    try {
      await api.get('/auctions');
    } catch {}
  };

  const fetchCompletedAuctions = async () => {
    try {
      const response = await api.get('/auctions/completed');
      setCompletedAuctions(response.data);
    } catch {
      setCompletedAuctions([]);
    }
  };

  const handleSearch = (searchParams) => {
    let filtered = allAuctionsMaster;
    const { date, team, player, metric, sport, mlbCategory } = searchParams;
    if (sport) filtered = filtered.filter(a => (a.sport || 'NBA') === sport);
    if (mlbCategory && sport === 'MLB') filtered = filtered.filter(a => a.mlbCategory === mlbCategory);
    if (date) filtered = filtered.filter(a => moment(a.date).format('YYYY-MM-DD') === date);
    if (team) filtered = filtered.filter(a => removeDiacritics(a.game.toLowerCase()).includes(removeDiacritics(team.toLowerCase())));
    if (player) filtered = filtered.filter(a => removeDiacritics(a.player.toLowerCase()).includes(removeDiacritics(player.toLowerCase())));
    if (metric) filtered = filtered.filter(a => removeDiacritics(a.metric.toLowerCase()) === removeDiacritics(metric.toLowerCase()));
    setAllAuctions(filtered);
  };

  const handleCreateAuction = async (auctionData) => {
    try {
      setLoading(true);
      if (!token) throw new Error('Authentication required');
      const response = await api.post('/auctions/create', auctionData);
      fetchActiveAuctions();
      fetchUserAuctions();
      if (refreshUserData && typeof refreshUserData === 'function') refreshUserData();
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAuction = async (auctionId) => {
    try {
      setLoading(true);
      if (!token) throw new Error('Authentication required');
      await fetchAllAuctions();
      const auction = allAuctions.find(a => a._id === auctionId);
      if (!auction) throw new Error('Auction not found');
      if (auction.soldTo) throw new Error('This auction has already been sold');
      const response = await api.post(`/auctions/buy/${auctionId}`);
      fetchAllAuctions();
      fetchActiveAuctions();
      fetchUserAuctions();
      fetchSuccessfulAuctions();
      if (refreshUserData && typeof refreshUserData === 'function') refreshUserData();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to buy auction';
      throw { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    allAuctions,
    activeAuctions,
    successfulAuctions,
    completedAuctions,
    allAuctionsMaster,
    loading,
    handleSearch,
    fetchAllAuctions,
    fetchActiveAuctions,
    fetchSuccessfulAuctions,
    fetchCompletedAuctions,
    handleCreateAuction,
    handleBuyAuction
  };
};