import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

const DAILY_ALLOWANCE = { common: 100, premium: 10 };
export const getDailyAllowanceAmount = (type) => type === 'premium' ? DAILY_ALLOWANCE.premium : DAILY_ALLOWANCE.common;

export const useCurrency = (token) => {
  const [dailyCollected, setDailyCollected] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const profile = await userService.getProfile();
        const today = new Date().toISOString().slice(0, 10);
        const last = profile.lastDailyAllowance ? profile.lastDailyAllowance.slice(0, 10) : '';
        setDailyCollected(last === today);
      } catch {}
    };
    fetchProfile();
  }, [token]);

  const handleDailyAllowance = async () => {
    try {
      const response = await userService.claimDailyAllowance();
      setDailyCollected(true);
      return { success: true, message: 'Daily allowance collected!', silver: response.silver, gold: response.gold };
    } catch (error) {
      if (error && error.message && error.message.includes('already been collected')) {
        setDailyCollected(true);
        return { success: false, collected: true, message: 'Already collected today' };
      }
      return { success: false, collected: false, message: 'Failed to collect daily allowance' };
    }
  };

  return { dailyCollected, handleDailyAllowance };
};