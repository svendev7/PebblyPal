import React, { useMemo } from 'react';
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  clamp,
} from 'react-native-reanimated';
import Footer from './components/Footer';

import Games from './screens/Games';
import Meals from './screens/Meals';
import Home from './screens/Home';
import Stats from './screens/Stats';
import Settings from './screens/Settings';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COUNT = 5;
const START_INDEX = 2;

const SNAP_DURATION_MS = 260;
const SNAP_EASING = Easing.bezier(0.20, 0.00, 0.00, 1.00);
const VELOCITY_COEF = 0.20;
const EDGE_RESISTANCE = 0.35;

export default function MainContainer() {
  const translateX = useSharedValue(-START_INDEX * SCREEN_WIDTH);
  const dragStartX = useSharedValue(translateX.value);

  const progress = useDerivedValue(() => {
    const raw = -translateX.value / SCREEN_WIDTH;
    return clamp(raw, 0, COUNT - 1);
  }, []);

  const pagerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const goTo = (index) => {
    const i = Math.max(0, Math.min(COUNT - 1, index));
    const x = -i * SCREEN_WIDTH;
    translateX.value = withTiming(x, { duration: SNAP_DURATION_MS, easing: SNAP_EASING });
  };

  const minX = -(COUNT - 1) * SCREEN_WIDTH;
  const maxX = 0;

  const pan = useMemo(() =>
    Gesture.Pan()
      .onBegin(() => {
        dragStartX.value = translateX.value;
      })
      .onUpdate((e) => {
        let next = dragStartX.value + e.translationX;
        if (next > maxX) next = maxX + (next - maxX) * EDGE_RESISTANCE;
        else if (next < minX) next = minX + (next - minX) * EDGE_RESISTANCE;
        translateX.value = next;
      })
      .onEnd((e) => {
        const current = -translateX.value / SCREEN_WIDTH;
        const projected = current - (e.velocityX / 1000) * VELOCITY_COEF;
        const target = Math.round(projected);
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
          <Games key="games" />
          <Meals key="meals" />
          <Home key="home" />
          <Stats key="stats" />
          <Settings key="settings" />
        </Animated.View>
      </GestureDetector>

      <Footer
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
});
