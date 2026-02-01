'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { menuApi, analyticsApi } from '@/lib/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [menuItems, setMenuItems] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });

  const fetchMenuItems = async () => {
    try {
      const response = await menuApi.getAll({ limit: 100 });
      setMenuItems(response.data);
      
      // Calculate stats
      const available = response.data.filter(item => item.isAvailable).length;
      setStats(prev => ({
        ...prev,
        totalItems: response.data.length,
        availableItems: available,
      }));
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  const fetchTopSellers = async () => {
    try {
      const response = await analyticsApi.getTopSellers();
      setTopSellers(response.data);
    } catch (error) {
      console.error('Failed to fetch top sellers:', error);
    }
  };

  const updateStats = (newStats) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchMenuItems(), fetchTopSellers()]);
      setLoading(false);
    };
    
    initializeData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        menuItems,
        setMenuItems,
        topSellers,
        stats,
        updateStats,
        loading,
        refetchMenuItems: fetchMenuItems,
        refetchTopSellers: fetchTopSellers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};