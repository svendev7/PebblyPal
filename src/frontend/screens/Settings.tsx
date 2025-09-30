import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Settings() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Page</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>Your screen content goes here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    opacity: 0.8,
    marginBottom: 32,
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
