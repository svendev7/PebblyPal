import { StyleSheet } from 'react-native';
import AddFoodOptionsScreen from '../screens/logging/addFood/AddFoodOptionsScreen';
import { useRouter } from 'expo-router';

export default function AddFoodOptions() {
  const router = useRouter();
  
  const handleGoBack = () => {
    // Go back to the log meal screen
    router.push('/logmeal');
  };
  
  return (
    <AddFoodOptionsScreen
      navigation={{
        navigate: (screen: string, params?: any) => {
          if (screen === "AddCustomFood") {
            router.push({
              pathname: '/customfood',
              params: { fromScreen: 'addfoodoptions' }
            });
          } else if (screen === "SavedMeals") {
            router.push({
              pathname: '/savedmeals',
              params: { returnTo: 'addfoodoptions' }
            });
          } else if (screen === "home" || screen === "Home") {
            router.push('/');
          } else {
            console.log(`Navigation to ${screen} not implemented`);
            router.push(`/${screen.toLowerCase()}`);
          }
        },
        goBack: handleGoBack,
      }}
    />
  );
} 