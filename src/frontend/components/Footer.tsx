import React from 'react';
import { Pressable, StyleSheet, View, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
  SharedValue,
} from 'react-native-reanimated';

const BASE_COLOR = '#3d485a';
const SELECTED_COLOR = '#557da0';
const DIVIDER_COLOR = '#808080';
const NUM_TABS = 5;
const CENTER_INDEX = 2; // Center tab (home)

// Morphing and icon animation tunables
const EDGE_TAPER = 1.0;
const CENTER_PEAK = 1.35;
const SIDE_PEAK = 0.90;
const ICON_BASE_SIZE = 28;
const ICON_GROW_CENTER = 10;
const ICON_GROW_SIDE = 6;

function smoothstep(t: number) {
  'worklet';
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

// Put your icons here: replace filenames with your actual files
const ICONS = [
  require('../../../assets/footer/Games.png'),    // replace with your Games icon
  require('../../../assets/footer/Meals.png'),    // replace with your Meals icon
  require('../../../assets/footer/Home.png'),     // replace with your Home icon
  require('../../../assets/footer/Stats.png'),    // replace with your Stats icon
  require('../../../assets/footer/Settings.png'), // replace with your Settings icon
];

export default function Footer({
  progress,
  onTabPress,
  height = 72,
}: {
  progress: SharedValue<number>;
  onTabPress: (index: number) => void;
  height?: number;
}) {
  return (
    <View style={[styles.footer, { height }]}>
      {Array.from({ length: NUM_TABS }).map((_, i) => {
        const peak = i === CENTER_INDEX ? CENTER_PEAK : SIDE_PEAK;

        const segStyle = useAnimatedStyle(() => {
          const d = Math.abs(progress.value - i);
          const proximity = Math.max(0, 1 - d / EDGE_TAPER);
          const bell = smoothstep(proximity);
          const flex = 1 + peak * bell;
          const bg = interpolateColor(bell, [0, 1], [BASE_COLOR, SELECTED_COLOR]);
          return { flex, backgroundColor: bg };
        });

        const iconStyle = useAnimatedStyle(() => {
          const d = Math.abs(progress.value - i);
          const proximity = Math.max(0, 1 - d / EDGE_TAPER);
          const bell = smoothstep(proximity);
          const grow = i === CENTER_INDEX ? ICON_GROW_CENTER : ICON_GROW_SIDE;
          const size = ICON_BASE_SIZE + grow * bell;
          return { width: size, height: size, borderRadius: size / 2 };
        });

        const segment = (
          <Animated.View key={`seg-${i}`} style={[styles.segment, segStyle]}>
            <Pressable style={styles.pressable} onPress={() => onTabPress(i)}>
              <Animated.Image source={ICONS[i]} style={iconStyle} resizeMode="contain" />
            </Pressable>
          </Animated.View>
        );

        return i === 0 ? segment : (
          <React.Fragment key={`wrap-${i}`}>
            <View style={styles.divider} />
            {segment}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: BASE_COLOR,
    elevation: 12,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  segment: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 2,
    height: '100%',
    backgroundColor: DIVIDER_COLOR,
  },
});
