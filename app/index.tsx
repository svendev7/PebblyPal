import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { HomeScreen } from '../screens/home/HomeScreen';
import { router, useRouter } from 'expo-router';
import AnimatedFooter from '../components/Footer/AnimatedFooter';
import { useAuth } from '../hooks/useAuth';
import { useUserSettings } from '../context/UserSettingsContext';
import OnboardingNavigator from '../screens/onboarding/OnboardingNavigator';

export default function Home() {
  const router = useRouter();
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, hasCompletedOnboarding, completeUserOnboarding } = useUserSettings();

  // Function to handle onboarding completion
  const handleOnboardingComplete = async (onboardingData: any) => {
    try {
      await completeUserOnboarding(onboardingData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (authLoading || settingsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If no user is logged in, show onboarding (which starts with login)
  if (!user) {
    return <OnboardingNavigator onComplete={handleOnboardingComplete} />;
  }

  // If user is logged in but hasn't completed onboarding, show onboarding
  if (user && !hasCompletedOnboarding) {
    return <OnboardingNavigator onComplete={handleOnboardingComplete} />;
  }

  // Navigation handler for the HomeScreen component
  const handleNavigate = (screen: string, params?: any) => {
    // Convert screen name to lowercase and normalize it
    const normalizedScreen = screen.toLowerCase();
    
    // Map legacy screen names to their proper routes using explicit types
    switch (normalizedScreen) {
      case 'logmeal':
      case 'addmeal':
        router.push({ pathname: '/logmeal', params });
        break;
      case 'addfoodoptionsscreen':
      case 'addfoodoptionscreen':
      case 'addfoodoptions':
        router.push({ pathname: '/addfoodoptions', params });
        break;
      case 'customfood':
      case 'addcustomfood':
      case 'editcustomfood':
        router.push({ pathname: '/customfood', params });
        break;
      case 'custommealreview':
      case 'mealreview':
        router.push({ pathname: '/mealreview', params });
        break;
      case 'savedmeals':
        router.push({ pathname: '/savedmeals', params });
        break;
      case 'games':
        router.push({ pathname: '/rocket', params });
        break;
      case 'settings':
        router.push({ pathname: '/settings', params });
        break;
      case 'stats':
        router.push({ pathname: '/stats', params });
        break;
      default:
        // Default to home for unknown screens
        router.push({ pathname: '/', params });
        break;
    }
  };

  const handleAddPress = () => {
    router.push('/logmeal');
  };

  return (
    <View style={styles.container}>
      <HomeScreen
        onFooterVisibilityChange={setIsFooterVisible}
        onSettingsPress={() => router.push('/settings')}
        customBackground={settings?.customBackground || null}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 10,
  },
}); 