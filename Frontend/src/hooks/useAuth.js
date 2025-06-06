import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUserData();
      const intervalId = setInterval(fetchUserData, 60000);
      return () => clearInterval(intervalId);
    } else {
      setUserData(null);
    }
  }, [token]);

  const fetchUserData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setUserData(data);
      setError(null);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    await fetchUserData();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserData(null);
  };

  const handleDailyAllowance = async () => {
    try {
      const response = await userService.claimDailyAllowance();
      if (response.data) {
        setUserData(prevData => ({ ...prevData, silver: response.data.silver, gold: response.data.gold, dailyCollected: true }));
        return { success: true, collected: true };
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return { success: false, collected: true, message: error.response.data.message };
      }
      return { success: false, collected: false, message: 'Failed to collect daily allowance' };
    }
  };

  return { token, userData, login, logout, handleDailyAllowance, loading, error, refreshUserData: fetchUserData };
};