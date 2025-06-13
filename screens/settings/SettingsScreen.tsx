import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CogIcon from '../../assets/Settings.svg';
import HeartIcon from '../../assets/Heart.svg';
import FlameIcon from '../../assets/Vector.svg';
import { styles } from './SettingsScreenStyles';
import { useUserSettings } from '../../context/UserSettingsContext';
const { width, height } = Dimensions.get('window');

export const SettingsScreen = ({ navigate }) => {
  const { 
    settings, 
    loading, 
    updatePreferences 
  } = useUserSettings();
  
  const [isPremium, setIsPremium] = useState(false);
  
  // Use settings from context, with fallbacks
  const darkMode = settings?.darkMode ?? true;
  const notifications = settings?.notifications ?? true;
  const dailyReminders = settings?.dailyReminders ?? true;
  const metricUnits = settings?.metricUnits ?? true;
  const customBackground = settings?.customBackground ?? null;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      try {
        await updatePreferences({ customBackground: result.assets[0].uri });
      } catch (error) {
        Alert.alert('Error', 'Failed to update background. Please try again.');
      }
    }
  };

  const removeCustomBackground = () => {
    Alert.alert(
      'Remove Background',
      'Are you sure you want to remove the custom background?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await updatePreferences({ customBackground: null });
            } catch (error) {
              Alert.alert('Error', 'Failed to remove background. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handlePremiumUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium', 
      'Get exclusive features like custom calorie goals, advanced analytics, and more for just $4.99/month.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upgrade', 
          onPress: () => {
            setIsPremium(true);
            Alert.alert('Success!', 'You are now a premium user!');
          } 
        }
      ]
    );
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await updatePreferences({
                darkMode: true,
                notifications: true,
                customBackground: null,
                dailyReminders: true,
                metricUnits: true
              });
              Alert.alert('Settings Reset', 'All settings have been reset to default values.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings. Please try again.');
            }
          } 
        }
      ]
    );
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderSettingItem = (
    icon: keyof typeof MaterialCommunityIcons.glyphMap, 
    title: string, 
    component: React.ReactNode,
    description?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <MaterialCommunityIcons name={icon} size={24} color="#9E9E9E" />
      </View>
      <View style={styles.settingItemRight}>
        <Text style={styles.settingItemTitle}>{title}</Text>
        {description && <Text style={styles.settingItemDescription}>{description}</Text>}
      </View>
      <View style={styles.settingItemControl}>
        {component}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigate('home')}
        >
          <View style={styles.backButtonContent}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.premiumBanner} onPress={handlePremiumUpgrade}>
            <View style={styles.premiumTextContainer}>
              <Text style={styles.premiumBannerTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumBannerText}>Unlock custom calorie goals and more</Text>
            </View>
            <HeartIcon width={30} height={30} fill="#FF3B30" />
          </TouchableOpacity>
          
          {renderSectionHeader('Appearance')}
          {renderSettingItem('theme-light-dark', 'Dark Mode', (
            <Switch
              value={darkMode}
              onValueChange={(value) => updatePreferences({ darkMode: value })}
              trackColor={{ false: '#3e3e3e', true: '#FF9500' }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
            />
          ))}
          {renderSettingItem('image', 'Background Image', (
            <View style={styles.backgroundButtons}>
              <TouchableOpacity style={styles.buttonSmall} onPress={pickImage}>
                <Text style={styles.buttonText}>
                  {customBackground ? 'Change' : 'Choose'}
                </Text>
              </TouchableOpacity>
              {customBackground && (
                <TouchableOpacity 
                  style={[styles.buttonSmall, styles.buttonDanger]} 
                  onPress={removeCustomBackground}
                >
                  <Text style={styles.buttonDangerText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ), 'Custom background for your home screen')}
          
          {renderSectionHeader('Notifications')}
          {renderSettingItem('bell', 'Push Notifications', (
            <Switch
              value={notifications}
              onValueChange={(value) => updatePreferences({ notifications: value })}
              trackColor={{ false: '#3e3e3e', true: '#FF9500' }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          ))}
          {renderSettingItem('calendar-clock', 'Daily Reminders', (
            <Switch
              value={dailyReminders}
              onValueChange={(value) => updatePreferences({ dailyReminders: value })}
              trackColor={{ false: '#3e3e3e', true: '#FF9500' }}
              thumbColor={dailyReminders ? '#fff' : '#f4f3f4'}
            />
          ))}
          
          {renderSectionHeader('Data & Units')}
          {renderSettingItem('weight', 'Use Metric Units', (
            <Switch
              value={metricUnits}
              onValueChange={(value) => updatePreferences({ metricUnits: value })}
              trackColor={{ false: '#3e3e3e', true: '#FF9500' }}
              thumbColor={metricUnits ? '#fff' : '#f4f3f4'}
            />
          ), 'kg/cm vs lb/inches')}
          
          {isPremium && renderSectionHeader('Premium Features')}
          {isPremium && renderSettingItem('target', 'Custom Calorie Goal', (
            <TouchableOpacity style={styles.buttonSmall}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          ), 'Set your personalized daily goals')}
          {isPremium && renderSettingItem('chart-bar', 'Advanced Analytics', (
            <TouchableOpacity style={styles.buttonSmall}>
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
          ), 'Detailed insights into your progress')}
          
          {renderSectionHeader('Account')}
          {renderSettingItem('help-circle', 'Help & Support', (
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9E9E9E" />
          ))}
          {renderSettingItem('information', 'About', (
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9E9E9E" />
          ))}
          {renderSettingItem('delete', 'Reset All Settings', (
            <TouchableOpacity style={[styles.buttonSmall, styles.buttonDanger]} onPress={resetSettings}>
              <Text style={styles.buttonDangerText}>Reset</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

