import { Stack } from 'expo-router';
import { CartProvider } from "../context/CartContext";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../config/firebase.client';
import Toast from "react-native-toast-message";
import { Platform } from 'react-native';

export default function RootLayout() {
  // Define optimized transition configurations for instant navigation
  const getTransitionPreset = () => {
    // iOS transitions - use faster native animations
    if (Platform.OS === 'ios') {
      return {
        animation: 'default' as const,
        animationDuration: 180, // Faster but still smooth
      };
    }

    // Android transitions - use faster slide animations
    return {
      animation: 'slide_from_right' as const,
      animationDuration: 150, // Very fast for instant feel
    };
  };

  return (
    <SafeAreaProvider>
      <CartProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            ...getTransitionPreset(),
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            presentation: 'card',
            // Ensure fastest possible animations
            animationTypeForReplace: 'push',
            statusBarStyle: 'light',
            statusBarBackgroundColor: '#000000',
          }}
        >
          {/* Define specific screen options for modal-like screens */}
          <Stack.Screen 
            name="addfoodoptions" 
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              animationDuration: 200, // Faster modal
            }} 
          />
          <Stack.Screen 
            name="customfood" 
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              animationDuration: 200, // Faster modal
            }} 
          />
          <Stack.Screen 
            name="mealreview" 
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
              animationDuration: 150, // Very fast transition
            }} 
          />
        </Stack>
        <Toast />
      </CartProvider>
    </SafeAreaProvider>
  );
} 