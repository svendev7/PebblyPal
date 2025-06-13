import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { 
  SavedItem, 
  SavedFoodComponent,
  addSavedItem, 
  updateSavedItem, 
  deleteSavedItem, 
  getSavedItemsByUser,
  getFavoriteSavedItems,
  getRecentlySavedItems,
  getMostUsedSavedItems,
  toggleFavoriteStatus,
  incrementUsageCount,
  searchSavedItems,
  createMealFromFoods
} from '../services/savedItemsService';
import { useAuth } from '../hooks/useAuth';

interface SavedItemsContextType {
  // Data state
  foods: SavedItem[];
  meals: SavedItem[];
  favorites: SavedItem[];
  recentItems: SavedItem[];
  mostUsed: SavedItem[];
  loading: boolean;
  error: string | null;
  
  // Operations
  addItem: (itemData: Omit<SavedItem, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount'>) => Promise<SavedItem>;
  updateItem: (itemId: string, itemData: Partial<SavedItem>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  
  // Favorites
  toggleFavorite: (itemId: string, isFavorite: boolean) => Promise<void>;
  
  // Usage tracking
  markAsUsed: (itemId: string) => Promise<void>;
  
  // Search
  searchItems: (searchTerm: string, itemType?: 'food' | 'meal') => Promise<SavedItem[]>;
  
  // Meal creation
  createMeal: (mealName: string, foodComponents: SavedFoodComponent[], additionalData?: Partial<SavedItem>) => Promise<SavedItem>;
  
  // Cache management
  refreshData: () => Promise<void>;
  clearCache: () => void;
  
  // Filtered getters
  getUserFoods: () => SavedItem[];
  getUserMeals: () => SavedItem[];
  getFavoriteItems: (itemType?: 'food' | 'meal') => SavedItem[];
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

interface SavedItemsProviderProps {
  children: ReactNode;
}

export const SavedItemsProvider: React.FC<SavedItemsProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [foods, setFoods] = useState<SavedItem[]>([]);
  const [meals, setMeals] = useState<SavedItem[]>([]);
  const [favorites, setFavorites] = useState<SavedItem[]>([]);
  const [recentItems, setRecentItems] = useState<SavedItem[]>([]);
  const [mostUsed, setMostUsed] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const hasFoodsRef = useRef<boolean>(false);
  
  // Cache for 10 minutes since saved items don't change as frequently
  const CACHE_DURATION = 10 * 60 * 1000;

  const fetchAllData = useCallback(async (forceRefresh = false) => {
    if (!user?.uid) {
      setFoods([]);
      setMeals([]);
      setFavorites([]);
      setRecentItems([]);
      setMostUsed([]);
      setLoading(false);
      hasFoodsRef.current = false;
      return;
    }

    // Check cache validity
    const now = Date.now();
    if (!forceRefresh && hasFoodsRef.current && (now - lastFetchTimeRef.current) < CACHE_DURATION) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Fetch all data in parallel for better performance
      const [
        allFoods,
        allMeals,
        favoriteItems,
        recent,
        popular
      ] = await Promise.all([
        getSavedItemsByUser(user.uid, 'food'),
        getSavedItemsByUser(user.uid, 'meal'),
        getFavoriteSavedItems(user.uid),
        getRecentlySavedItems(user.uid),
        getMostUsedSavedItems(user.uid)
      ]);

      setFoods(allFoods);
      setMeals(allMeals);
      setFavorites(favoriteItems);
      setRecentItems(recent);
      setMostUsed(popular);
      lastFetchTimeRef.current = now;
      hasFoodsRef.current = true;
    } catch (err) {
      console.error('Error fetching saved items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch saved items');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Initial fetch when user changes
  useEffect(() => {
    if (!authLoading) {
      fetchAllData();
    }
  }, [user?.uid, authLoading, fetchAllData]);

  const addItem = useCallback(async (itemData: Omit<SavedItem, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      
      const newItem = await addSavedItem({
        ...itemData,
        userId: user.uid,
      });

      // Update local state based on item type
      if (newItem.itemType === 'food') {
        setFoods(prev => [newItem, ...prev]);
      } else {
        setMeals(prev => [newItem, ...prev]);
      }

      // Update recent items
      setRecentItems(prev => [newItem, ...prev.slice(0, 19)]);

      // Update favorites if applicable
      if (newItem.isFavorite) {
        setFavorites(prev => [newItem, ...prev]);
      }

      return newItem;
    } catch (err) {
      console.error('Error adding saved item:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    }
  }, [user?.uid]);

  const updateItem = useCallback(async (itemId: string, itemData: Partial<SavedItem>) => {
    try {
      setError(null);
      
      await updateSavedItem(itemId, itemData);

      // Update local state
      const updateItemInArray = (items: SavedItem[]) =>
        items.map(item => 
          item.id === itemId ? { ...item, ...itemData } : item
        );

      setFoods(prev => updateItemInArray(prev));
      setMeals(prev => updateItemInArray(prev));
      setFavorites(prev => updateItemInArray(prev));
      setRecentItems(prev => updateItemInArray(prev));
      setMostUsed(prev => updateItemInArray(prev));
    } catch (err) {
      console.error('Error updating saved item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  }, []);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      setError(null);
      
      await deleteSavedItem(itemId);

      // Remove from all local arrays
      const removeItemFromArray = (items: SavedItem[]) =>
        items.filter(item => item.id !== itemId);

      setFoods(prev => removeItemFromArray(prev));
      setMeals(prev => removeItemFromArray(prev));
      setFavorites(prev => removeItemFromArray(prev));
      setRecentItems(prev => removeItemFromArray(prev));
      setMostUsed(prev => removeItemFromArray(prev));
    } catch (err) {
      console.error('Error deleting saved item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  }, []);

  const toggleFavorite = useCallback(async (itemId: string, isFavorite: boolean) => {
    try {
      setError(null);
      
      await toggleFavoriteStatus(itemId, isFavorite);

      // Update local state
      const updateFavoriteStatus = (items: SavedItem[]) =>
        items.map(item => 
          item.id === itemId ? { ...item, isFavorite } : item
        );

      setFoods(prev => updateFavoriteStatus(prev));
      setMeals(prev => updateFavoriteStatus(prev));
      setRecentItems(prev => updateFavoriteStatus(prev));
      setMostUsed(prev => updateFavoriteStatus(prev));

      // Update favorites array - simplified to avoid nested setState calls
      if (isFavorite) {
        // Will be added when state updates trigger re-fetch if needed
        // For now just ensure it gets marked as favorite in all arrays
      } else {
        setFavorites(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to update favorite status');
      throw err;
    }
  }, []);

  const markAsUsed = useCallback(async (itemId: string) => {
    try {
      setError(null);
      
      await incrementUsageCount(itemId);

      // Update usage count in local state
      const updateUsageCount = (items: SavedItem[]) =>
        items.map(item => 
          item.id === itemId 
            ? { ...item, usageCount: (item.usageCount || 0) + 1 }
            : item
        );

      setFoods(prev => updateUsageCount(prev));
      setMeals(prev => updateUsageCount(prev));
      setFavorites(prev => updateUsageCount(prev));
      setRecentItems(prev => updateUsageCount(prev));
      setMostUsed(prev => updateUsageCount(prev));
    } catch (err) {
      console.error('Error marking item as used:', err);
      setError(err instanceof Error ? err.message : 'Failed to update usage count');
      throw err;
    }
  }, []);

  const searchItems = useCallback(async (searchTerm: string, itemType?: 'food' | 'meal'): Promise<SavedItem[]> => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      return await searchSavedItems(user.uid, searchTerm, itemType);
    } catch (err) {
      console.error('Error searching items:', err);
      throw err;
    }
  }, [user?.uid]);

  const createMeal = useCallback(async (
    mealName: string, 
    foodComponents: SavedFoodComponent[], 
    additionalData?: Partial<SavedItem>
  ): Promise<SavedItem> => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      
      const newMeal = await createMealFromFoods(user.uid, mealName, foodComponents, additionalData);

      // Update local state
      setMeals(prev => [newMeal, ...prev]);
      setRecentItems(prev => [newMeal, ...prev.slice(0, 19)]);

      if (newMeal.isFavorite) {
        setFavorites(prev => [newMeal, ...prev]);
      }

      return newMeal;
    } catch (err) {
      console.error('Error creating meal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create meal');
      throw err;
    }
  }, [user?.uid]);

  const refreshData = useCallback(async () => {
    await fetchAllData(true);
  }, [fetchAllData]);

  const clearCache = useCallback(() => {
    lastFetchTimeRef.current = 0;
    hasFoodsRef.current = false;
  }, []);

  // Filtered getters
  const getUserFoods = useCallback(() => foods, [foods]);
  const getUserMeals = useCallback(() => meals, [meals]);
  const getFavoriteItems = useCallback((itemType?: 'food' | 'meal') => {
    if (itemType) {
      return favorites.filter(item => item.itemType === itemType);
    }
    return favorites;
  }, [favorites]);

  const value: SavedItemsContextType = {
    foods,
    meals,
    favorites,
    recentItems,
    mostUsed,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    markAsUsed,
    searchItems,
    createMeal,
    refreshData,
    clearCache,
    getUserFoods,
    getUserMeals,
    getFavoriteItems,
  };

  return (
    <SavedItemsContext.Provider value={value}>
      {children}
    </SavedItemsContext.Provider>
  );
};

export const useSavedItems = (): SavedItemsContextType => {
  const context = useContext(SavedItemsContext);
  if (context === undefined) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
}; 