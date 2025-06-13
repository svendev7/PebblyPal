import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp,
  FieldValue 
} from 'firebase/firestore';
import { db } from '../config/firebase.client';

export interface UserSettings {
  userId: string;
  // Onboarding data
  onboardingCompleted: boolean;
  onboardingCompletedAt?: Timestamp | FieldValue;
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: string;
  goal?: string;
  targetWeight?: number;
  
  // App preferences
  darkMode: boolean;
  notifications: boolean;
  dailyReminders: boolean;
  metricUnits: boolean;
  customBackground?: string;
  
  // Calculated values from onboarding
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number;
  dailyCarbsGoal?: number;
  dailyFatGoal?: number;
  
  // Timestamps
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

const COLLECTION_NAME = 'userSettings';

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const userSettingsRef = doc(db, COLLECTION_NAME, userId);
    const userSettingsSnapshot = await getDoc(userSettingsRef);
    
    if (!userSettingsSnapshot.exists()) {
      return null;
    }

    return {
      userId,
      ...userSettingsSnapshot.data()
    } as UserSettings;
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};

export const createUserSettings = async (userId: string, settingsData: Partial<UserSettings>): Promise<UserSettings> => {
  try {
    const userSettingsRef = doc(db, COLLECTION_NAME, userId);
    
    // Filter out undefined values to prevent Firebase errors
    const filteredSettingsData = Object.fromEntries(
      Object.entries(settingsData).filter(([_, value]) => value !== undefined)
    );
    
    const newSettings: UserSettings = {
      userId,
      onboardingCompleted: false,
      darkMode: true,
      notifications: true,
      dailyReminders: true,
      metricUnits: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...filteredSettingsData,
    };

    await setDoc(userSettingsRef, newSettings);
    
    return {
      ...newSettings,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as UserSettings;
  } catch (error) {
    console.error('Error creating user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (userId: string, settingsData: Partial<UserSettings>): Promise<UserSettings> => {
  try {
    const userSettingsRef = doc(db, COLLECTION_NAME, userId);
    
    // Filter out undefined values to prevent Firebase errors
    const filteredSettingsData = Object.fromEntries(
      Object.entries(settingsData).filter(([_, value]) => value !== undefined)
    );
    
    const updateData = {
      ...filteredSettingsData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(userSettingsRef, updateData);
    
    // Return updated settings
    const updatedSettings = await getUserSettings(userId);
    if (!updatedSettings) {
      throw new Error('Failed to retrieve updated settings');
    }
    
    return updatedSettings;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

export const completeOnboarding = async (userId: string, onboardingData: Partial<UserSettings>): Promise<UserSettings> => {
  try {
    const completeData = {
      ...onboardingData,
      onboardingCompleted: true,
      onboardingCompletedAt: serverTimestamp(),
    };
    
    return await updateUserSettings(userId, completeData);
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};

export const updateAppPreferences = async (userId: string, preferences: {
  darkMode?: boolean;
  notifications?: boolean;
  dailyReminders?: boolean;
  metricUnits?: boolean;
  customBackground?: string;
}): Promise<UserSettings> => {
  try {
    return await updateUserSettings(userId, preferences);
  } catch (error) {
    console.error('Error updating app preferences:', error);
    throw error;
  }
}; 