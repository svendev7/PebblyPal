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
  getDoc,
  FieldValue
} from 'firebase/firestore';
import { db } from '../config/firebase.client';

export interface SavedItem {
  id: string;
  userId: string;
  name: string;
  
  // Type of saved item
  itemType: 'food' | 'meal';
  
  // Nutritional information (per serving)
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sugar: number;
  fibers: number;
  sodium: number;
  
  // Serving information
  servingSize: number;
  servingUnit: string;
  
  // User preferences
  isFavorite: boolean;
  isUserCreated: boolean; // true if created by user, false if from database/API
  
  // For meals: constituent foods
  foods?: SavedFoodComponent[];
  
  // Optional metadata
  imageUrl?: string;
  notes?: string;
  barcode?: string; // For packaged foods
  brand?: string;
  category?: string;
  
  // Usage tracking
  lastUsed?: Timestamp | FieldValue;
  usageCount: number;
  
  // Timestamps
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface SavedFoodComponent {
  foodId: string; // References another SavedItem with itemType 'food'
  name: string;
  amount: number;
  unit: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sugar: number;
  fibers: number;
  sodium: number;
}

const COLLECTION_NAME = 'savedItems';

export const addSavedItem = async (itemData: Omit<SavedItem, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<SavedItem> => {
  try {
    const savedItemsRef = collection(db, COLLECTION_NAME);
    const newItem = {
      ...itemData,
      usageCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(savedItemsRef, newItem);
    return {
      ...newItem,
      id: docRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as SavedItem;
  } catch (error) {
    console.error('Error adding saved item:', error);
    throw error;
  }
};

export const updateSavedItem = async (itemId: string, itemData: Partial<Omit<SavedItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, itemId);
    
    const updateData = {
      ...itemData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(itemRef, updateData);
  } catch (error) {
    console.error('Error updating saved item:', error);
    throw error;
  }
};

export const deleteSavedItem = async (itemId: string): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error('Error deleting saved item:', error);
    throw error;
  }
};

export const getSavedItemById = async (itemId: string): Promise<SavedItem | null> => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, itemId);
    const itemSnapshot = await getDoc(itemRef);
    
    if (!itemSnapshot.exists()) {
      return null;
    }

    return {
      id: itemId,
      ...itemSnapshot.data()
    } as SavedItem;
  } catch (error) {
    console.error('Error getting saved item:', error);
    throw error;
  }
};

export const getSavedItemsByUser = async (userId: string, itemType?: 'food' | 'meal'): Promise<SavedItem[]> => {
  try {
    const savedItemsRef = collection(db, COLLECTION_NAME);
    let q = query(
      savedItemsRef, 
      where('userId', '==', userId),
      orderBy('lastUsed', 'desc')
    );

    if (itemType) {
      q = query(
        savedItemsRef, 
        where('userId', '==', userId),
        where('itemType', '==', itemType),
        orderBy('lastUsed', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedItem[];
  } catch (error) {
    console.error('Error getting saved items:', error);
    throw error;
  }
};

export const getFavoriteSavedItems = async (userId: string, itemType?: 'food' | 'meal'): Promise<SavedItem[]> => {
  try {
    const savedItemsRef = collection(db, COLLECTION_NAME);
    let q = query(
      savedItemsRef, 
      where('userId', '==', userId),
      where('isFavorite', '==', true),
      orderBy('lastUsed', 'desc')
    );

    if (itemType) {
      q = query(
        savedItemsRef, 
        where('userId', '==', userId),
        where('itemType', '==', itemType),
        where('isFavorite', '==', true),
        orderBy('lastUsed', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedItem[];
  } catch (error) {
    console.error('Error getting favorite saved items:', error);
    throw error;
  }
};

export const getRecentlySavedItems = async (userId: string, limitCount: number = 20): Promise<SavedItem[]> => {
  try {
    const savedItemsRef = collection(db, COLLECTION_NAME);
    const q = query(
      savedItemsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedItem[];
  } catch (error) {
    console.error('Error getting recently saved items:', error);
    throw error;
  }
};

export const getMostUsedSavedItems = async (userId: string, limitCount: number = 20): Promise<SavedItem[]> => {
  try {
    const savedItemsRef = collection(db, COLLECTION_NAME);
    const q = query(
      savedItemsRef, 
      where('userId', '==', userId),
      orderBy('usageCount', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedItem[];
  } catch (error) {
    console.error('Error getting most used saved items:', error);
    throw error;
  }
};

export const toggleFavoriteStatus = async (itemId: string, isFavorite: boolean): Promise<void> => {
  try {
    await updateSavedItem(itemId, { isFavorite });
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
};

export const incrementUsageCount = async (itemId: string): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, itemId);
    const itemSnapshot = await getDoc(itemRef);
    
    if (itemSnapshot.exists()) {
      const currentUsage = itemSnapshot.data().usageCount || 0;
      await updateDoc(itemRef, { 
        usageCount: currentUsage + 1,
        lastUsed: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error incrementing usage count:', error);
    throw error;
  }
};

// Search functionality
export const searchSavedItems = async (userId: string, searchTerm: string, itemType?: 'food' | 'meal'): Promise<SavedItem[]> => {
  try {
    const savedItemsRef = collection(db, COLLECTION_NAME);
    let q = query(
      savedItemsRef, 
      where('userId', '==', userId),
      orderBy('name')
    );

    if (itemType) {
      q = query(
        savedItemsRef, 
        where('userId', '==', userId),
        where('itemType', '==', itemType),
        orderBy('name')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const allItems = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedItem[];

    // Client-side filtering for better search experience
    const filteredItems = allItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredItems;
  } catch (error) {
    console.error('Error searching saved items:', error);
    throw error;
  }
};

// Meal-specific functions
export const createMealFromFoods = async (
  userId: string, 
  mealName: string, 
  foodComponents: SavedFoodComponent[],
  additionalData?: Partial<SavedItem>
): Promise<SavedItem> => {
  try {
    // Calculate total nutritional values
    const totals = foodComponents.reduce(
      (acc, food) => ({
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat,
        calories: acc.calories + food.calories,
        sugar: acc.sugar + food.sugar,
        fibers: acc.fibers + food.fibers,
        sodium: acc.sodium + food.sodium,
      }),
      { protein: 0, carbs: 0, fat: 0, calories: 0, sugar: 0, fibers: 0, sodium: 0 }
    );

    const mealData: Omit<SavedItem, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> = {
      userId,
      name: mealName,
      itemType: 'meal',
      ...totals,
      servingSize: 1,
      servingUnit: 'serving',
      isFavorite: false,
      isUserCreated: true,
      foods: foodComponents,
      ...additionalData,
    };

    return await addSavedItem(mealData);
  } catch (error) {
    console.error('Error creating meal from foods:', error);
    throw error;
  }
}; 