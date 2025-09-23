import React, { useMemo, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const FOOTER_HEIGHT = Math.round(screenHeight * 0.12);

const NUM_ITEMS = 5;
const DEFAULT_SELECTED_INDEX = 2; // middle (Battle)
const BASE_COLOR = '#3d485a';
const SELECTED_COLOR = '#557da0';
const DIVIDER_COLOR = '#808080';
const DIVIDER_WIDTH = 2;

export interface FooterRef {
  setSelectedIndex: (index: number) => void;
}

interface FooterProps {
  onTabPress?: (index: number) => void;
}

const Footer = forwardRef<FooterRef, FooterProps>(({ onTabPress }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(DEFAULT_SELECTED_INDEX);

  // Animated weights: 1 for normal, 2 for selected
  const weights = useMemo(
    () => Array.from({ length: NUM_ITEMS }, (_, i) => new Animated.Value(i === DEFAULT_SELECTED_INDEX ? 2 : 1)),
    []
  );

  const isAnimatingRef = useRef<boolean>(false);

  // Expose method to parent to sync with scroll
  useImperativeHandle(ref, () => ({
    setSelectedIndex: (index: number) => {
      if (index !== selectedIndex && !isAnimatingRef.current) {
        handleSelect(index, false); // Don't trigger onTabPress when called from parent
      }
    },
  }));

  function handleSelect(index: number, shouldNotifyParent: boolean = true) {
    if (index === selectedIndex || isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    const animations: Animated.CompositeAnimation[] = [];

    // Shrink previously selected
    animations.push(
      Animated.timing(weights[selectedIndex], {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
      })
    );

    // Grow newly selected (center tab gets bigger scale)
    const targetScale = index === 2 ? 2.4 : 2; // Center tab (Battle) is bigger
    animations.push(
      Animated.timing(weights[index], {
        toValue: targetScale,
        duration: 220,
        useNativeDriver: false,
      })
    );

    Animated.parallel(animations).start(() => {
      setSelectedIndex(index);
      isAnimatingRef.current = false;
      
      // Notify parent about tab press (for scrolling to page)
      if (shouldNotifyParent && onTabPress) {
        onTabPress(index);
      }
    });
  }

  return (
    <View style={styles.footer}>
      {Array.from({ length: NUM_ITEMS }).map((_, i) => {
        const isSelected = i === selectedIndex;
        const isCenter = i === 2; // Battle tab
        
        const segment = (
          <Animated.View
            key={`seg-${i}`}
            style={[
              styles.segment,
              { flex: weights[i] },
              { 
                backgroundColor: isSelected ? SELECTED_COLOR : BASE_COLOR,
                // Center tab has subtle elevation when selected
                elevation: isSelected && isCenter ? 4 : 0,
                shadowOpacity: isSelected && isCenter ? 0.3 : 0,
                shadowRadius: isSelected && isCenter ? 4 : 0,
                shadowOffset: { width: 0, height: 2 },
              },
            ]}
          >
            <Pressable style={styles.pressable} onPress={() => handleSelect(i)}>
              <View style={[
                styles.iconPlaceholder,
                isCenter && styles.centerIcon,
                isSelected && styles.selectedIcon
              ]} />
              {/* Optional: Add tab labels */}
              {/* <Text style={[styles.tabLabel, isSelected && styles.selectedTabLabel]}>
                {['Shop', 'Cards', 'Battle', 'Clan', 'Events'][i]}
              </Text> */}
            </Pressable>
          </Animated.View>
        );

        // Add divider before every segment except the first
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
});

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FOOTER_HEIGHT,
    flexDirection: 'row',
    backgroundColor: BASE_COLOR,
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
    width: DIVIDER_WIDTH,
    height: '100%',
    backgroundColor: DIVIDER_COLOR,
  },
  iconPlaceholder: {
    width: 28,
    height: 28,
    backgroundColor: '#ffffff',
    borderRadius: 14,
  },
  centerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffd700', // Gold color for Battle
  },
  selectedIcon: {
    backgroundColor: '#ffffff',
  },
  tabLabel: {
    fontSize: 10,
    color: '#cccccc',
    marginTop: 4,
  },
  selectedTabLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default Footer;
