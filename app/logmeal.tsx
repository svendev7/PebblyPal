import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SavedFoodsScreen from '../screens/logging/SavedFoodsScreen';

export default function LogMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Run initial callback on mount to simulate focus event
  useEffect(() => {
    // This simulates the initial focus event
  }, []);
  
  // Define a more efficient navigation handler with proper transitions
  const handleNavigation = (screen: string, screenParams?: any) => {
    // Ensure screen is a string and handle the toLowerCase safely
    if (typeof screen !== 'string' || !screen) {
      console.warn('Invalid screen parameter:', screen);
      return;
    }

    // Map legacy screen names to their proper routes
    switch(screen.toLowerCase()) {
      case 'addfoodoptionsscreen':
      case 'addfoodoptionscreen':
      case 'addfoodoptions':
        router.push('/addfoodoptions');
        break;
      case 'editcustomfood':
      case 'customfood':
      case 'addcustomfood':
        router.push({
          pathname: '/customfood',
          params: screenParams
        });
        break;
      case 'custommealreview':
      case 'mealreview':
        router.push('/mealreview');
        break;
      case 'savedmeals':
        router.push('/savedmeals');
        break;
      case 'home':
        router.push('/');
        break;
      default:
        console.log(`Navigating to: ${screen.toLowerCase()}`);
        // Only navigate to known routes to avoid type errors
        break;
    }
  };
  
  return (
    <View style={styles.container}>
      <SavedFoodsScreen
        navigation={{
          navigate: handleNavigation,
          goBack: () => router.back(),
          getParam: (param: string) => params[param] || null,
          setParams: () => {}, // No-op since we use URL params in Expo Router
          addListener: (event: string, callback: () => void) => {
            // Call the callback immediately if it's a focus event
            if (event === 'focus') {
              callback();
            }
            return { remove: () => {} };
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
}); 