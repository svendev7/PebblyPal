import { db } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  gender?: string;
  age?: number;
  currentWeight?: number;
  height?: number;
  goalWeight?: number;
  goal?: string;
  timeframe?: number;
  activityLevel?: string;
  trackingPreference?: string;
  premium?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create or update a user profile
export const saveUserProfile = async (userProfile: UserProfile) => {
  try {
    const userRef = doc(db, 'users', userProfile.uid);
    const userData = {
      ...userProfile,
      updatedAt: serverTimestamp()
    };
    
    // Check if the user document exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, userData);
    } else {
      // Create new user with createdAt timestamp
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp()
      });
    }
    
    return userProfile;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Get a user profile
export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        uid: userDoc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}; 