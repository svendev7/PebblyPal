import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import AddCustomFoodScreen from '../screens/logging/addFood/AddCustomFoodScreen';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface CustomFood {
  id?: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sugar: number;
  fibers: number;
  sodium: number;
  servingSize: number;
  servingUnit: string;
  imageUrl?: string;
  isFavorite: boolean;
  isUserCreated?: boolean;
}

export default function CustomFood() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const savedCallback = useRef<((food: CustomFood) => void) | null>(null);
  
  let foodToEdit = null;
  if (params.item) {
    try {
      foodToEdit = JSON.parse(params.item as string);
    } catch (e) {
      console.error('Error parsing food item:', e);
    }
  }
  
  const handleSaveFood = (food: CustomFood) => {
    if (savedCallback.current) {
      savedCallback.current(food);
    }
    
    // Return to the food options or log meal screen
    if (params.fromScreen === 'addfoodoptions') {
      router.push('/addfoodoptions');
    } else {
      router.push('/logmeal');
    }
  };
  
  const handleGoBack = () => {
    // Use the fromScreen param to determine where to go back to
    if (params.fromScreen === 'addfoodoptions') {
      router.push('/addfoodoptions');
    } else {
      router.push('/logmeal');
    }
  };
  
  return (
    <AddCustomFoodScreen
      navigation={{
        goBack: handleGoBack,
        save: handleSaveFood,
        getParam: (param: string) => {
          if (param === 'foodChanged') {
            return true;
          }
          return null;
        }
      }}
      route={{
        params: {
          foodToEdit
        },
      }}
    />
  );
} 