import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  LoggedItem, 
  addLoggedItem, 
  updateLoggedItem, 
  deleteLoggedItem, 
  getLoggedItemsByDate, 
  getLoggedItemsByDateRange,
  getTodayDateString,
  calculateDailyTotals,
  addMultipleLoggedItems
} from '../services/loggedItemsService';
import { useAuth } from '../hooks/useAuth';

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fibers: number;
  sodium: number;
}

interface LoggedItemsContextType {
  // Current day data
  todayItems: LoggedItem[];
  todayTotals: DailyTotals;
  loading: boolean;
  error: string | null;
  
  // Operations
  addItem: (itemData: Omit<LoggedItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<LoggedItem>;
  addMultipleItems: (items: Omit<LoggedItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) => Promise<LoggedItem[]>;
  updateItem: (itemId: string, itemData: Partial<LoggedItem>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  
  // Date-specific operations
  getItemsForDate: (date: string) => Promise<LoggedItem[]>;
  getItemsForDateRange: (startDate: string, endDate: string) => Promise<LoggedItem[]>;
  
  // Cache management
  refreshTodayData: () => Promise<void>;
  clearCache: () => void;
  
  // Computed values
  remainingCalories: number;
  macroProgress: {
    protein: { current: number; target: number; percentage: number };
    carbs: { current: number; target: number; percentage: number };
    fat: { current: number; target: number; percentage: number };
  };
}

const LoggedItemsContext = createContext<LoggedItemsContextType | undefined>(undefined);

interface LoggedItemsProviderProps {
  children: ReactNode;
  dailyGoals?: DailyTotals;
}

export const LoggedItemsProvider: React.FC<LoggedItemsProviderProps> = ({ 
  children, 
  dailyGoals = { calories: 2000, protein: 150, carbs: 250, fat: 67, sugar: 50, fibers: 25, sodium: 2300 }
}) => {
  const { user, loading: authLoading } = useAuth();
  const [todayItems, setTodayItems] = useState<LoggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchDate, setLastFetchDate] = useState<string>('');
  
  // Cache for date-specific queries
  const [dateCache, setDateCache] = useState<Map<string, { items: LoggedItem[]; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchTodayItems = useCallback(async (forceRefresh = false) => {
    if (!user?.uid) {
      setTodayItems([]);
      setLoading(false);
      return;
    }

    const today = getTodayDateString();
    
    // Check if we need to refresh (new day or forced)
    if (!forceRefresh && lastFetchDate === today && todayItems.length >= 0) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const items = await getLoggedItemsByDate(user.uid, today);
      setTodayItems(items);
      setLastFetchDate(today);
      
      // Update cache
      setDateCache(prev => new Map(prev.set(today, { items, timestamp: Date.now() })));
    } catch (err) {
      console.error('Error fetching today items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, lastFetchDate, todayItems.length]);

  // Initial fetch and date change detection
  useEffect(() => {
    if (!authLoading) {
      const interval = setInterval(() => {
        const today = getTodayDateString();
        if (lastFetchDate && lastFetchDate !== today) {
          fetchTodayItems(true); // Force refresh for new day
        }
      }, 60000); // Check every minute

      fetchTodayItems();
      
      return () => clearInterval(interval);
    }
  }, [user?.uid, authLoading, fetchTodayItems, lastFetchDate]);

  const addItem = useCallback(async (itemData: Omit<LoggedItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      
      const newItem = await addLoggedItem({
        ...itemData,
        userId: user.uid,
      });

      // Update today's items if it's for today
      if (newItem.date === getTodayDateString()) {
        setTodayItems(prev => [...prev, newItem]);
      }

      // Update cache
      setDateCache(prev => {
        const cached = prev.get(newItem.date);
        if (cached) {
          const updatedItems = [...cached.items, newItem];
          return new Map(prev.set(newItem.date, { items: updatedItems, timestamp: Date.now() }));
        }
        return prev;
      });

      return newItem;
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    }
  }, [user?.uid]);

  const addMultipleItems = useCallback(async (items: Omit<LoggedItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      
      const itemsWithUserId = items.map(item => ({
        ...item,
        userId: user.uid,
      }));

      const newItems = await addMultipleLoggedItems(itemsWithUserId);

      // Update today's items if any are for today
      const today = getTodayDateString();
      const todayNewItems = newItems.filter(item => item.date === today);
      if (todayNewItems.length > 0) {
        setTodayItems(prev => [...prev, ...todayNewItems]);
      }

      // Update cache for affected dates
      setDateCache(prev => {
        const newCache = new Map(prev);
        newItems.forEach(item => {
          const cached = newCache.get(item.date);
          if (cached) {
            const updatedItems = [...cached.items, item];
            newCache.set(item.date, { items: updatedItems, timestamp: Date.now() });
          }
        });
        return newCache;
      });

      return newItems;
    } catch (err) {
      console.error('Error adding multiple items:', err);
      setError(err instanceof Error ? err.message : 'Failed to add items');
      throw err;
    }
  }, [user?.uid]);

  const updateItem = useCallback(async (itemId: string, itemData: Partial<LoggedItem>) => {
    try {
      setError(null);
      
      await updateLoggedItem(itemId, itemData);

      // Update local state
      setTodayItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, ...itemData } : item
        )
      );

      // Update cache
      setDateCache(prev => {
        const newCache = new Map(prev);
        for (const [date, cached] of newCache) {
          const itemIndex = cached.items.findIndex(item => item.id === itemId);
          if (itemIndex >= 0) {
            const updatedItems = [...cached.items];
            updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...itemData };
            newCache.set(date, { items: updatedItems, timestamp: Date.now() });
            break;
          }
        }
        return newCache;
      });
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  }, []);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      setError(null);
      
      await deleteLoggedItem(itemId);

      // Update local state
      setTodayItems(prev => prev.filter(item => item.id !== itemId));

      // Update cache
      setDateCache(prev => {
        const newCache = new Map(prev);
        for (const [date, cached] of newCache) {
          const filteredItems = cached.items.filter(item => item.id !== itemId);
          if (filteredItems.length !== cached.items.length) {
            newCache.set(date, { items: filteredItems, timestamp: Date.now() });
            break;
          }
        }
        return newCache;
      });
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  }, []);

  const getItemsForDate = useCallback(async (date: string): Promise<LoggedItem[]> => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    // Check cache first
    const cached = dateCache.get(date);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.items;
    }

    try {
      const items = await getLoggedItemsByDate(user.uid, date);
      
      // Update cache
      setDateCache(prev => new Map(prev.set(date, { items, timestamp: Date.now() })));
      
      return items;
    } catch (err) {
      console.error('Error getting items for date:', err);
      throw err;
    }
  }, [user?.uid, dateCache]);

  const getItemsForDateRange = useCallback(async (startDate: string, endDate: string): Promise<LoggedItem[]> => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      return await getLoggedItemsByDateRange(user.uid, startDate, endDate);
    } catch (err) {
      console.error('Error getting items for date range:', err);
      throw err;
    }
  }, [user?.uid]);

  const refreshTodayData = useCallback(async () => {
    await fetchTodayItems(true);
  }, [fetchTodayItems]);

  const clearCache = useCallback(() => {
    setDateCache(new Map());
    setLastFetchDate('');
  }, []);

  // Computed values
  const todayTotals = calculateDailyTotals(todayItems);
  const remainingCalories = Math.max(0, dailyGoals.calories - todayTotals.calories);
  
  const macroProgress = {
    protein: {
      current: todayTotals.protein,
      target: dailyGoals.protein,
      percentage: Math.min(100, (todayTotals.protein / dailyGoals.protein) * 100),
    },
    carbs: {
      current: todayTotals.carbs,
      target: dailyGoals.carbs,
      percentage: Math.min(100, (todayTotals.carbs / dailyGoals.carbs) * 100),
    },
    fat: {
      current: todayTotals.fat,
      target: dailyGoals.fat,
      percentage: Math.min(100, (todayTotals.fat / dailyGoals.fat) * 100),
    },
  };

  const value: LoggedItemsContextType = {
    todayItems,
    todayTotals,
    loading,
    error,
    addItem,
    addMultipleItems,
    updateItem,
    deleteItem,
    getItemsForDate,
    getItemsForDateRange,
    refreshTodayData,
    clearCache,
    remainingCalories,
    macroProgress,
  };

  return (
    <LoggedItemsContext.Provider value={value}>
      {children}
    </LoggedItemsContext.Provider>
  );
};

export const useLoggedItems = (): LoggedItemsContextType => {
  const context = useContext(LoggedItemsContext);
  if (context === undefined) {
    throw new Error('useLoggedItems must be used within a LoggedItemsProvider');
  }
  return context;
}; 