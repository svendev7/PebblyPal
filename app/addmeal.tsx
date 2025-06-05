import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function AddMealScreen() {
  const router = useRouter();
  
  // After component mounts, redirect to the real implementation
  useEffect(() => {
    // We're going to create a new route /logmeal that will have our implementation
    router.replace('/logmeal');
  }, []);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#45A557" />
      <Text style={styles.text}>Loading meal screen...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  }
}); 