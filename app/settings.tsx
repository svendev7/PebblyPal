import { StyleSheet } from 'react-native';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const router = useRouter();
  
  // In a real app, you'd implement proper state management for the background
  const updateCustomBackground = async (uri: string) => {
    try {
      // You'd also want to store this in AsyncStorage or similar
      console.log('Background updated:', uri);
    } catch (error) {
      console.error('Error updating background:', error);
    }
  };
  
  return (
    <SettingsScreen
      navigate={() => router.back()}
      updateCustomBackground={updateCustomBackground}
      customBackground={null} // This should be fetched from state management
    />
  );
} 