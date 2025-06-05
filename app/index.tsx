import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeScreen } from '../screens/home/HomeScreen';
import { router, useRouter } from 'expo-router';
import AnimatedFooter from '../components/Footer/AnimatedFooter';
import { useAuth } from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingNavigator from '../screens/onboarding/OnboardingNavigator';

export default function Home() {
  const router = useRouter();
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [customBackground, setCustomBackground] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  // Check if user has completed onboarding
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('hasCompletedOnboarding');
        setHasCompletedOnboarding(!!onboardingCompleted);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      checkOnboarding();
    }
  }, [authLoading]);

  // Function to handle onboarding completion
  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
  };

  if (authLoading || isLoading) {
    return null; // Or a loading screen
  }

  if (user && !hasCompletedOnboarding) {
    return <OnboardingNavigator onComplete={handleOnboardingComplete} />;
  }

  // Navigation handler for the HomeScreen component
  const handleNavigate = (screen: string, params?: any) => {
    // Convert screen name to lowercase and normalize it
    const normalizedScreen = screen.toLowerCase();
    let path = `/${normalizedScreen}`;
    
    // Map legacy screen names to their proper routes
    if (normalizedScreen === 'logmeal') {
      path = '/logmeal';
    } else if (normalizedScreen === 'addmeal') {
      path = '/logmeal';
    } else if (normalizedScreen === 'addfoodoptionsscreen' || normalizedScreen === 'addfoodoptionscreen' || normalizedScreen === 'addfoodoptions') {
      path = '/addfoodoptions';
    } else if (normalizedScreen === 'customfood' || normalizedScreen === 'addcustomfood' || normalizedScreen === 'editcustomfood') {
      path = '/customfood';
    } else if (normalizedScreen === 'custommealreview' || normalizedScreen === 'mealreview') {
      path = '/mealreview';
    } else if (normalizedScreen === 'savedmeals') {
      path = '/savedmeals';
    } else if (normalizedScreen === 'games') {
      path = '/rocket';
    }
    
    router.push({
      pathname: path,
      params
    });
  };

  const handleAddPress = () => {
    router.push('/logmeal');
  };

  return (
    <View style={styles.container}>
      <HomeScreen
        onFooterVisibilityChange={setIsFooterVisible}
        onSettingsPress={() => router.push('/settings')}
        customBackground={customBackground}
        navigation={{
          navigate: handleNavigate,
          addListener: (event: string, callback: () => void) => {
            if (event === 'focus') {
              callback();
            }
            return {
              remove: () => {},
            };
          },
        }}
      />
      {isFooterVisible && (
        <AnimatedFooter
          isVisible={isFooterVisible}
          activeTab="home"
          onAddPress={handleAddPress}
          onRocketPress={() => router.push('/rocket')}
          onStatsPress={() => router.push('/stats')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
}); 