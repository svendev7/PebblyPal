import React from 'react';
import { Stack } from 'expo-router';
import { CartProvider } from "../context/CartContext";
import { UserSettingsProvider } from "../context/UserSettingsContext";
import { LoggedItemsProvider } from "../context/LoggedItemsContext";
import { SavedItemsProvider } from "../context/SavedItemsContext";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../config/firebase.client';
import Toast from "react-native-toast-message";
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UserSettingsProvider>
        <SavedItemsProvider>
          <LoggedItemsProvider>
            <CartProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 250,
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                  ...Platform.select({
                    ios: {
                      animation: 'slide_from_right',
                      gestureEnabled: true,
                    },
                    android: {
                      animation: 'slide_from_right',
                      animationTypeForReplace: 'push',
                    },
                  }),
                }}
              >
                                  <Stack.Screen name="index" />
                  <Stack.Screen 
                    name="logmeal" 
                    options={{
                      animation: 'slide_from_right',
                    }} 
                  />
                  <Stack.Screen 
                    name="addfoodoptions" 
                    options={{
                      animation: 'slide_from_right',
                    }} 
                  />
                  <Stack.Screen 
                    name="customfood" 
                    options={{
                      animation: 'slide_from_right',
                    }} 
                  />
                  <Stack.Screen 
                    name="savedmeals" 
                    options={{
                      animation: 'slide_from_right',
                    }} 
                  />
                  <Stack.Screen 
                    name="mealreview" 
                    options={{
                      animation: 'slide_from_right',
                    }} 
                  />
                  <Stack.Screen 
                    name="settings" 
                    options={{
                      animation: 'slide_from_right',
                    }} 
                  />
              </Stack>
              <Toast />
            </CartProvider>
          </LoggedItemsProvider>
        </SavedItemsProvider>
      </UserSettingsProvider>
    </SafeAreaProvider>
  );
} 