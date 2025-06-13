import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  Timestamp, 
  serverTimestamp, 
  deleteDoc,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  FieldValue
} from 'firebase/firestore';
import { db } from '../config/firebase.client';

export interface LoggedItem {
  id: string;
  userId: string;
  name: string;
  
  // Nutritional information
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sugar: number;
  fibers: number;
  sodium: number;
  
  // Serving information
  amount: number;
  unit: string;
  
  // Logging details
  date: string; // Format: YYYY-MM-DD for easy querying
  loggedTime: string; // Time of day when logged
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  
  // Source information
  sourceType: 'food' | 'meal' | 'custom';
  sourceId?: string; // ID from saveditems if applicable
  
  // Optional metadata
  imageUrl?: string;
  notes?: string;
  
  // Timestamps
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

const COLLECTION_NAME = 'loggedItems';

export const addLoggedItem = async (itemData: Omit<LoggedItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<LoggedItem> => {
  try {
    const loggedItemsRef = collection(db, COLLECTION_NAME);
    const newItem = {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(loggedItemsRef, newItem);
    return {
      ...newItem,
      id: docRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as LoggedItem;
  } catch (error) {
    console.error('Error adding logged item:', error);
    throw error;
  }
};

export const updateLoggedItem = async (itemId: string, itemData: Partial<Omit<LoggedItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, itemId);
    
    const updateData = {
      ...itemData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(itemRef, updateData);
  } catch (error) {
    console.error('Error updating logged item:', error);
    throw error;
  }
};

export const deleteLoggedItem = async (itemId: string): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error('Error deleting logged item:', error);
    throw error;
  }
};

export const getLoggedItemsByDate = async (userId: string, date: string): Promise<LoggedItem[]> => {
  try {
    const loggedItemsRef = collection(db, COLLECTION_NAME);
    const q = query(
      loggedItemsRef, 
      where('userId', '==', userId),
      where('date', '==', date),
      orderBy('loggedTime', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LoggedItem[];
  } catch (error) {
    console.error('Error getting logged items by date:', error);
    throw error;
  }
};

export const getLoggedItemsByDateRange = async (
  userId: string, 
  startDate: string, 
  endDate: string
): Promise<LoggedItem[]> => {
  try {
    const loggedItemsRef = collection(db, COLLECTION_NAME);
    const q = query(
      loggedItemsRef, 
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
      orderBy('loggedTime', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LoggedItem[];
  } catch (error) {
    console.error('Error getting logged items by date range:', error);
    throw error;
  }
};

export const getRecentLoggedItems = async (
  userId: string, 
  limitCount: number = 50,
  lastDoc?: QueryDocumentSnapshot
): Promise<{ items: LoggedItem[], lastDoc?: QueryDocumentSnapshot }> => {
  try {
    const loggedItemsRef = collection(db, COLLECTION_NAME);
    let q = query(
      loggedItemsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LoggedItem[];

    const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { items, lastDoc: lastDocument };
  } catch (error) {
    console.error('Error getting recent logged items:', error);
    throw error;
  }
};

// Helper function to get today's date in YYYY-MM-DD format
export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to calculate daily totals
export const calculateDailyTotals = (items: LoggedItem[]) => {
  return items.reduce(
    (totals, item) => {
      totals.calories += item.calories || 0;
      totals.protein += item.protein || 0;
      totals.carbs += item.carbs || 0;
      totals.fat += item.fat || 0;
      totals.sugar += item.sugar || 0;
      totals.fibers += item.fibers || 0;
      totals.sodium += item.sodium || 0;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fibers: 0, sodium: 0 }
  );
};

// Batch operations for performance
export const addMultipleLoggedItems = async (items: Omit<LoggedItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<LoggedItem[]> => {
  try {
    const results: LoggedItem[] = [];
    
    // Process in batches of 10 for better performance
    for (let i = 0; i < items.length; i += 10) {
      const batch = items.slice(i, i + 10);
      const promises = batch.map(item => addLoggedItem(item));
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }
    
    return results;
  } catch (error) {
    console.error('Error adding multiple logged items:', error);
    throw error;
  }
}; 