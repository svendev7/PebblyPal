// src/frontend/components/CRFooter.tsx
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
  SharedValue,
} from 'react-native-reanimated';

const BASE_COLOR = '#3d485a';
const SELECTED_COLOR = '#557da0';
const DIVIDER_COLOR = '#808080';
const NUM_TABS = 5;
const CENTER_INDEX = 2;

// Tunables to match the bar’s morphing
const EDGE_TAPER = 1.0;           // how quickly width falls off with distance
const CENTER_PEAK = 1.35;         // extra width gain at center
const SIDE_PEAK = 0.90;           // width gain for side tabs
const DOT_BASE = 22;              // base dot size
const DOT_GAIN_SIDE = 6;          // side dot grow amount
const DOT_GAIN_CENTER = 10;       // center dot grow amount

type Props = {
  progress: SharedValue<number>; // fractional index 0..4
  onTabPress: (index: number) => void;
  height?: number;
};

function smoothstep(t: number) {
  'worklet';
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

export default function CRFooter({ progress, onTabPress, height = 72 }: Props) {
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

        const dotStyle = useAnimatedStyle(() => {
          const d = Math.abs(progress.value - i);
          const proximity = Math.max(0, 1 - d / EDGE_TAPER);
          const bell = smoothstep(proximity);
          const isCenter = i === CENTER_INDEX;
          const grow = isCenter ? DOT_GAIN_CENTER : DOT_GAIN_SIDE;
          const size = DOT_BASE + grow * bell;
          const radius = size / 2;
          const color = isCenter ? '#ffd700' : '#ffffff';
          return { width: size, height: size, borderRadius: radius, backgroundColor: color };
        });

        const segment = (
          <Animated.View key={`seg-${i}`} style={[styles.segment, segStyle]}>
            <Pressable style={styles.pressable} onPress={() => onTabPress(i)}>
              <Animated.View style={dotStyle} />
            </Pressable>
          </Animated.View>
        );

        if (i === 0) return segment;
        return (
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
    left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    backgroundColor: BASE_COLOR,
    elevation: 12,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  segment: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  pressable: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  divider: { width: 2, height: '100%', backgroundColor: DIVIDER_COLOR },
});
