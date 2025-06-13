import { StyleSheet, View } from 'react-native';
import MealReviewScreen from '../screens/logging/cart/MealReviewScreen';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { Ionicons } from "@expo/vector-icons";
import Header from '../components/Header/Header';

export default function MealReview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { clearCart } = useCart();
  
  // This code is now redundant as we're using CartContext directly
  // but keeping for backward compatibility
  let selectedFoods = [];
  if (params.selectedFoods) {
    try {
      selectedFoods = JSON.parse(params.selectedFoods as string);
    } catch (e) {
      console.error('Error parsing selected foods:', e);
    }
  }
  
  const forceClearCart = () => {
    // Use new cart context instead of old service
    clearCart();
    // Navigate to home with proper expo router transition
    router.push({
      pathname: '/',
      params: { mealLogged: 'true' }
    });
  };
  
  const handleGoBack = () => {
    // Use router.back() for proper expo router transition
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <MealReviewScreen
        navigation={{
          navigate: (screen, params = {}) => {
            // Use known routes only to avoid type errors
            if (typeof screen === 'string' && screen) {
              switch(screen.toLowerCase()) {
                case 'home':
                  router.push('/');
                  break;
                case 'logmeal':
                  router.push('/logmeal');
                  break;
                default:
                  console.warn('Unknown navigation screen:', screen);
                  router.push('/');
              }
            } else if (typeof screen === 'object' && screen?.name) {
              // Handle object-style navigation
              switch(screen.name.toLowerCase()) {
                case 'home':
                  router.push('/');
                  break;
                default:
                  console.warn('Unknown navigation screen object:', screen);
                  router.push('/');
              }
            } else {
              // Default to home if screen is invalid
              console.warn('Invalid navigation screen parameter:', screen);
              router.push('/');
            }
          },
          goBack: handleGoBack,
          getParam: (param: string) => {
            if (param === 'onMealLogged') {
              return forceClearCart;
            }
            return null;
          }
        }}
        route={{
          params: {
            selectedFoods,
            defaultMealName: params.defaultMealName || (selectedFoods.length === 1 ? selectedFoods[0].name : ""),
            onMealLogged: forceClearCart,
            clearCart: forceClearCart
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  }
}); 