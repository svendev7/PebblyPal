import { StyleSheet } from 'react-native';
import SavedMealsScreen from '../screens/logging/SavedMealsScreen';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Match the SavedMeal interface from the SavedMealsScreen
interface SavedMeal {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  imageUrl: string;
  lastUsed?: string;
}

export default function SavedMeals() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const handleSelectSavedMeal = (meal: SavedMeal) => {
    // After selecting a meal, go back to the previous screen
    console.log('Selected meal:', meal);
    
    // Use router.back() for proper navigation
    router.back();
  };
  
  const handleClose = () => {
    // Use router.back() for proper navigation
    router.back();
  };
  
  return (
    <SavedMealsScreen 
      onClose={handleClose} 
      onSelectMeal={handleSelectSavedMeal}
    />
  );
} 