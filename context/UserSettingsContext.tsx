import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserSettings, getUserSettings, updateUserSettings, createUserSettings, completeOnboarding, updateAppPreferences } from '../services/userSettingsService';
import { useAuth } from '../hooks/useAuth';

interface UserSettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  
  // Settings operations
  updateSettings: (settingsData: Partial<UserSettings>) => Promise<void>;
  completeUserOnboarding: (onboardingData: Partial<UserSettings>) => Promise<void>;
  updatePreferences: (preferences: {
    darkMode?: boolean;
    notifications?: boolean;
    dailyReminders?: boolean;
    metricUnits?: boolean;
    customBackground?: string;
  }) => Promise<void>;
  
  // Computed values
  hasCompletedOnboarding: boolean;
  dailyGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  
  // Cache management
  refreshSettings: () => Promise<void>;
  clearCache: () => void;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

interface UserSettingsProviderProps {
  children: ReactNode;
}

export const UserSettingsProvider: React.FC<UserSettingsProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Cache for 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchSettings = useCallback(async (forceRefresh = false) => {
    if (!user?.uid) {
      setSettings(null);
      setLoading(false);
      return;
    }

    // Check cache validity
    const now = Date.now();
    if (!forceRefresh && settings && (now - lastFetchTime) < CACHE_DURATION) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      let userSettings = await getUserSettings(user.uid);
      
      // Create default settings if they don't exist
      if (!userSettings) {
        const defaultData: Partial<UserSettings> = {};
        if (user.displayName) {
          defaultData.name = user.displayName;
        }
        userSettings = await createUserSettings(user.uid, defaultData);
      }

      setSettings(userSettings);
      setLastFetchTime(now);
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, settings, lastFetchTime]);

  // Initial fetch when user changes
  useEffect(() => {
    if (!authLoading) {
      fetchSettings();
    }
  }, [user?.uid, authLoading, fetchSettings]);

  const updateSettings = useCallback(async (settingsData: Partial<UserSettings>) => {
    if (!user?.uid || !settings) {
      throw new Error('User not authenticated or settings not loaded');
    }

    try {
      setError(null);
      
      const updatedSettings = await updateUserSettings(user.uid, settingsData);
      setSettings(updatedSettings);
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  }, [user?.uid, settings]);

  const completeUserOnboarding = useCallback(async (onboardingData: Partial<UserSettings>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      
      const updatedSettings = await completeOnboarding(user.uid, onboardingData);
      setSettings(updatedSettings);
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
      throw err;
    }
  }, [user?.uid]);

  const updatePreferences = useCallback(async (preferences: {
    darkMode?: boolean;
    notifications?: boolean;
    dailyReminders?: boolean;
    metricUnits?: boolean;
    customBackground?: string;
  }) => {
    if (!user?.uid || !settings) {
      throw new Error('User not authenticated or settings not loaded');
    }

    try {
      setError(null);
      
      const updatedSettings = await updateAppPreferences(user.uid, preferences);
      setSettings(updatedSettings);
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  }, [user?.uid, settings]);

  const refreshSettings = useCallback(async () => {
    await fetchSettings(true);
  }, [fetchSettings]);

  const clearCache = useCallback(() => {
    setSettings(null);
    setLastFetchTime(0);
  }, []);

  // Computed values
  const hasCompletedOnboarding = settings?.onboardingCompleted ?? false;
  
  const dailyGoals = {
    calories: settings?.dailyCalorieGoal ?? 2000,
    protein: settings?.dailyProteinGoal ?? 150,
    carbs: settings?.dailyCarbsGoal ?? 250,
    fat: settings?.dailyFatGoal ?? 67,
  };

  const value: UserSettingsContextType = {
    settings,
    loading,
    error,
    updateSettings,
    completeUserOnboarding,
    updatePreferences,
    hasCompletedOnboarding,
    dailyGoals,
    refreshSettings,
    clearCache,
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = (): UserSettingsContextType => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
}; 