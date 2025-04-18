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
  setDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  DocumentReference
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Meal {
  id: string;
  userId: string;
  mealName: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sugar: number;
  fibers: number;
  sodium: number;
  loggedTime?: string;
  date?: string;
  imageUrl?: string;
  foods?: FoodItem[];
  isFavorite?: boolean;
  isCustom?: boolean;
  isLogged?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastUsed?: Timestamp;
}

export interface FoodItem {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sodium?: number;
  sugar?: number;
  fibers?: number;
  amount: number;
  unit: string;
}

// Interface for Food data
interface FoodData {
  id?: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sodium?: number;
  sugar?: number;
  fibers?: number;
  isFavorite?: boolean;
  isUserCreated?: boolean;
  lastUsed?: any;
  createdAt?: any;
  updatedAt?: any;
  addedToCart?: boolean;
  [key: string]: any; // Allow additional fields
}

export const addMeal = async (mealData: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meal> => {
  try {
    const mealsRef = collection(db, 'meals');
    const newMeal = {
      ...mealData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastUsed: serverTimestamp(),
      isCustom: mealData.isCustom !== undefined ? mealData.isCustom : false,
      isFavorite: mealData.isFavorite !== undefined ? mealData.isFavorite : false,
      isLogged: mealData.isLogged !== undefined ? mealData.isLogged : true
    };

    const docRef = await addDoc(mealsRef, newMeal);
    return {
      ...newMeal,
      id: docRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastUsed: Timestamp.now()
    } as Meal;
  } catch (error) {
    console.error('Error adding meal:', error);
    throw error;
  }
};

export const updateMeal = async (mealId: string, mealData: Partial<Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Meal> => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    const updateData = {
      ...mealData,
      updatedAt: serverTimestamp(),
      lastUsed: serverTimestamp(),
      // If this is a logging operation, mark the meal as logged
      ...(mealData.date || mealData.loggedTime ? { isLogged: true } : {})
    };

    await updateDoc(mealRef, updateData);
    
    // Fetch the updated meal to return
    const mealSnapshot = await getDoc(mealRef);
    if (!mealSnapshot.exists()) {
      throw new Error('Meal not found after update');
    }
    
    return {
      id: mealId,
      ...mealSnapshot.data()
    } as Meal;
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
};

export const getMealById = async (mealId: string): Promise<Meal | null> => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    const mealSnapshot = await getDoc(mealRef);
    
    if (!mealSnapshot.exists()) {
      return null;
    }

    return {
      id: mealId,
      ...mealSnapshot.data()
    } as Meal;
  } catch (error) {
    console.error('Error getting meal:', error);
    throw error;
  }
};

export const getMealsByUserId = async (userId: string): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(mealsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting meals:', error);
    throw error;
  }
};

export const deleteMeal = async (mealId: string): Promise<void> => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    await deleteDoc(mealRef);
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

export const getSavedMealsByUserId = async (userId: string): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef, 
      where('userId', '==', userId),
      where('isCustom', '==', true),
      orderBy('lastUsed', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting saved meals:', error);
    throw error;
  }
};

export const getFavoriteMealsByUserId = async (userId: string): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef, 
      where('userId', '==', userId),
      where('isFavorite', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting favorite meals:', error);
    throw error;
  }
};

export const getRecentMealsByUserId = async (userId: string, limitCount: number = 10): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef, 
      where('userId', '==', userId),
      where('isLogged', '==', true),  // Only get meals that have been logged
      orderBy('lastUsed', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting recent meals:', error);
    throw error;
  }
};

export const getMealsByDateRange = async (userId: string, startDate: string, endDate: string): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef, 
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
      orderBy('loggedTime', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting meals by date range:', error);
    throw error;
  }
};

export const getMealsByDate = async (userId: string, date: string): Promise<Meal[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef, 
      where('userId', '==', userId),
      where('date', '==', date),
      where('isCustom', '==', false),
      orderBy('loggedTime', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];
  } catch (error) {
    console.error('Error getting meals by date:', error);
    throw error;
  }
};

export const toggleMealFavorite = async (mealId: string, isFavorite: boolean): Promise<void> => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    await updateDoc(mealRef, {
      isFavorite: isFavorite,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling meal favorite status:', error);
    throw error;
  }
};

/**
 * Get user's foods by type (recent, created, favorite)
 */
export const getUserFoodsByType = async (userId: string, type: string): Promise<FoodData[]> => {
  try {
    const userFoodsRef = collection(db, 'users', userId, 'foods');
    let q;
    
    switch(type) {
      case 'recent':
        // Get most recently added to cart foods
        q = query(
          userFoodsRef, 
          where('addedToCart', '==', true),
          orderBy('lastUsed', 'desc'),
          limit(10)
        );
        break;
      case 'created':
        // Get foods created by user
        q = query(userFoodsRef, where('isUserCreated', '==', true));
        break;
      case 'favorite':
        // Get favorite foods
        q = query(userFoodsRef, where('isFavorite', '==', true));
        break;
      default:
        // Default to all foods
        q = userFoodsRef;
    }
    
    const querySnapshot = await getDocs(q);
    const foods: FoodData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<FoodData, 'id'>;
      foods.push({
        id: doc.id,
        name: data.name || '',
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0,
        calories: data.calories || 0,
        ...data
      });
    });
    
    return foods;
  } catch (error) {
    console.error('Error getting user foods:', error);
    throw error;
  }
};

/**
 * Update favorite status of a food or meal
 */
export const updateFavoriteStatus = async (userId: string, itemId: string, isFavorite: boolean, itemType: 'food' | 'meal') => {
  try {
    // Foods are stored in users/{userId}/foods/{foodId}
    // Meals are stored in meals/{mealId}
    const itemRef = itemType === 'food' 
      ? doc(db, 'users', userId, 'foods', itemId) 
      : doc(db, 'meals', itemId);
    
    await updateDoc(itemRef, {
      isFavorite: isFavorite,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error(`Error updating ${itemType} favorite status:`, error);
    throw error;
  }
};

/**
 * Delete a user food or meal
 */
export const deleteUserFood = async (userId: string, itemId: string, itemType: 'food' | 'meal') => {
  try {
    // Foods are stored in users/{userId}/foods/{foodId}
    // Meals are stored in meals/{mealId}
    const itemRef = itemType === 'food' 
      ? doc(db, 'users', userId, 'foods', itemId) 
      : doc(db, 'meals', itemId);
    
    await deleteDoc(itemRef);
    
    return true;
  } catch (error) {
    console.error(`Error deleting ${itemType}:`, error);
    throw error;
  }
};

/**
 * Create or update a custom food
 */
export const saveCustomFood = async (userId: string, food: FoodData) => {
  try {
    const userFoodsRef = collection(db, 'users', userId, 'foods');
    
    // If food has an ID, update existing document
    if (food.id) {
      const foodRef = doc(db, 'users', userId, 'foods', food.id);
      await updateDoc(foodRef, {
        ...food,
        updatedAt: serverTimestamp()
      });
      return food.id;
    } else {
      // Create new food document
      const newFoodRef = await addDoc(userFoodsRef, {
        ...food,
        isUserCreated: true,
        addedToCart: food.addedToCart || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastUsed: serverTimestamp()
      });
      return newFoodRef.id;
    }
  } catch (error) {
    console.error('Error saving custom food:', error);
    throw error;
  }
};

/**
 * Update a food's cart status and lastUsed timestamp
 */
export const updateFoodCartStatus = async (userId: string, foodId: string, addedToCart: boolean): Promise<boolean> => {
  try {
    const foodRef = doc(db, 'users', userId, 'foods', foodId);
    
    await updateDoc(foodRef, {
      addedToCart: addedToCart,
      lastUsed: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating food cart status:', error);
    throw error;
  }
}; 