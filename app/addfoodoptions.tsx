import { StyleSheet } from 'react-native';
import AddFoodOptionsScreen from '../screens/logging/addFood/AddFoodOptionsScreen';
import { useRouter } from 'expo-router';

export default function AddFoodOptions() {
  const router = useRouter();
  
  const handleGoBack = () => {
    // Use proper back navigation
    router.back();
  };
  
  return (
    <AddFoodOptionsScreen
      navigation={{
        navigate: (screen: string, params?: any) => {
          if (screen === "AddCustomFood") {
            router.push('/customfood');
          } else if (screen === "SavedMeals") {
            router.push('/savedmeals');
          } else if (screen === "home" || screen === "Home") {
            router.push('/');
          } else {
            console.log(`Navigation to ${screen} not implemented`);
          }
        },
        goBack: handleGoBack,
      }}
    />
  );
} 