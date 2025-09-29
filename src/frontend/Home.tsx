// src/frontend/Home.tsx
import React, { useMemo } from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  clamp,
} from 'react-native-reanimated';
import CRFooter from './components/CRFooter';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PAGES = [
  { key: 'shop', title: 'Shop', color: '#e74c3c' },
  { key: 'cards', title: 'Cards', color: '#3498db' },
  { key: 'battle', title: 'Battle', color: '#f39c12' },
  { key: 'clan', title: 'Clan', color: '#2ecc71' },
  { key: 'events', title: 'Events', color: '#9b59b6' },
];
const COUNT = PAGES.length;
const START_INDEX = 2;

// Tunables to match Clash Royale feel
const SNAP_DURATION_MS = 260;                // crisp but not abrupt
const SNAP_EASING = Easing.bezier(0.20, 0.00, 0.00, 1.00); // strong ease-out
const VELOCITY_COEF = 0.20;                  // how far velocity projects (pages/sec -> pages)
const EDGE_RESISTANCE = 0.35;                // damping past edges

export default function Home() {
  const translateX = useSharedValue(-START_INDEX * SCREEN_WIDTH);
  const dragStartX = useSharedValue(translateX.value);

  // Fractional page progress (0..COUNT-1)
  const progress = useDerivedValue(() => {
    const raw = -translateX.value / SCREEN_WIDTH;
    return clamp(raw, 0, COUNT - 1);
  }, []);

  const pagerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const goTo = (index: number) => {
    const i = Math.max(0, Math.min(COUNT - 1, index));
    const x = -i * SCREEN_WIDTH;
    translateX.value = withTiming(x, { duration: SNAP_DURATION_MS, easing: SNAP_EASING });
  };

  const minX = -(COUNT - 1) * SCREEN_WIDTH;
  const maxX = 0;

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          dragStartX.value = translateX.value;
        })
        .onUpdate((e) => {
          // Compute raw position from drag origin + translation
          let next = dragStartX.value + e.translationX;

          // Apply soft resistance beyond bounds to avoid hard stop
          if (next > maxX) {
            const over = next - maxX;
            next = maxX + over * EDGE_RESISTANCE;
          } else if (next < minX) {
            const over = next - minX;
            next = minX + over * EDGE_RESISTANCE;
          }

          translateX.value = next;
        })
        .onEnd((e) => {
          // Current fractional index
          const current = -translateX.value / SCREEN_WIDTH;

          // Velocity projection (points/sec -> pages via width) scaled by coefficient
          const projected = current - (e.velocityX / 1000) * VELOCITY_COEF;

          // Nearest target from position plus velocity influence
          const target = Math.round(projected);

          // Clamp and snap with crisp timing (no bounce)
          const clamped = Math.max(0, Math.min(COUNT - 1, target));
          const x = -clamped * SCREEN_WIDTH;
          translateX.value = withTiming(x, { duration: SNAP_DURATION_MS, easing: SNAP_EASING });
        }),
    []
  );

  return (
    <ImageBackground
      source={require('../../assets/Background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.pager, { width: SCREEN_WIDTH * COUNT }, pagerStyle]}>
          {PAGES.map((p) => (
            <View key={p.key} style={[styles.page, { width: SCREEN_WIDTH, backgroundColor: p.color }]}>
              <Text style={styles.title}>{p.title}</Text>
              <Text style={styles.subtitle}>Page</Text>

              {p.key === 'battle' && (
                <View style={styles.card}>
                  <Text style={styles.cardText}>⚔️ Ready for Battle! ⚔️</Text>
                </View>
              )}
              {p.key === 'shop' && (
                <View style={styles.card}>
                  <Text style={styles.cardText}>🛒 Welcome to Shop</Text>
                </View>
              )}
              {p.key === 'cards' && (
                <View style={styles.card}>
                  <Text style={styles.cardText}>🃏 Your Card Collection</Text>
                </View>
              )}
              {p.key === 'clan' && (
                <View style={styles.card}>
                  <Text style={styles.cardText}>👥 Clan Management</Text>
                </View>
              )}
              {p.key === 'events' && (
                <View style={styles.card}>
                  <Text style={styles.cardText}>🎉 Special Events</Text>
                </View>
              )}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>

      <CRFooter
        progress={progress}
        onTabPress={goTo}
        height={Math.round(SCREEN_HEIGHT * 0.12)}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  pager: { flex: 1, flexDirection: 'row' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 120 },
  title: {
    color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4,
  },
  subtitle: { color: '#fff', fontSize: 18, opacity: 0.8, marginBottom: 32 },
  card: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 24, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  cardText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
