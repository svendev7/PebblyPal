import React, { useState, useRef, useEffect } from "react";
import { View, Text, Animated, Dimensions, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MealComponent } from "../Meal/MealComponent";
import { styles } from "./MealViewerStyles"; 
const { height } = Dimensions.get("window");


interface MealData {
  id: string;
  mealName: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  sugar: number;
  fibers: number;
  sodium: number;
  loggedTime: string;
  date: string;
  imageUrl: string;
}

interface DayData {
  date: string;
  mealData: MealData[];
  proteinConsumed: number;
  proteinGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  fatConsumed: number;
  fatGoal: number;
  totalCaloriesConsumed: number;
  calorieGoal: number;
}

interface MealViewerProps {
  daysData: DayData[];
  onFooterVisibilityChange: (visible: boolean) => void;
  onLoadPreviousDay: () => void;
  canLoadMore: boolean;
  onMealPress: (meal: MealData) => void;
  isLoading?: boolean;
}

// Skeleton loader component for MealViewer
const MealViewerSkeleton = () => {
  const bottomSheetVisibleHeightRatio = 0.6;
  const topContainerMarginTopRatio = 0.47;
  const bottomSheetHeight = height * bottomSheetVisibleHeightRatio;
  const firstTopContainerOffset = bottomSheetHeight * topContainerMarginTopRatio;
  
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Handle bar opacity based on scroll position, initially hidden (just like the real component)
  const fixedShadowOpacity = scrollY.interpolate({
    inputRange: [firstTopContainerOffset - 1, firstTopContainerOffset],
    outputRange: [0, 1], 
    extrapolate: 'clamp'
  });

  // Scrollable handle opacity (visible at first, then fades out on scroll)
  const scrollableHandleOpacity = scrollY.interpolate({
    inputRange: [firstTopContainerOffset - 1, firstTopContainerOffset],
    outputRange: [1, 0], 
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.bottomSheetWrapper}>
      {/* Top shadow handle - Initially invisible just like in the real component */}
      <Animated.View 
        style={[
          styles.bottomSheetTopShadow, 
          {
            opacity: fixedShadowOpacity, 
            zIndex: 20 
          }
        ]}
        pointerEvents="none" 
      >
        <View style={styles.handleBar} />
      </Animated.View>
      
      <Animated.ScrollView
        style={styles.bottomSheetScrollView}
        contentContainerStyle={[styles.bottomSheetContent, { minHeight: height }]}
        bounces={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={1}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true } 
        )}
        overScrollMode="always"
      >
        <View
          style={[
            styles.topContainer,
            {
              marginTop: firstTopContainerOffset,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              height: 175, // Match the height of the actual component
            },
          ]}
        >
          {/* This is the scrollable handlebar that should behave like the real one */}
          <Animated.View 
            style={[
              styles.bottomSheetHandle,
              { opacity: scrollableHandleOpacity } // Animated opacity that fades out on scroll
            ]}
          >
            <View style={styles.handleBar} />
          </Animated.View>
          
          <View style={[styles.peekContent, { paddingTop: 5 }]}>
            <View style={styles.flipCardContainer}>
              {/* Skeleton for Flip Card */}
              <View style={styles.flipCardSide}>
                {/* Skeleton for Calorie Counter - Matches Real Layout */}
                <View style={styles.calorieSection}>
                  <Animated.View 
                    style={{
                      width: 100,
                      height: 32,
                      backgroundColor: '#2A2A2A',
                      borderRadius: 8,
                      opacity: pulseAnim,
                      marginTop: 5
                    }}
                  />
                  <Animated.View 
                    style={{
                      width: 80,
                      height: 12,
                      backgroundColor: '#2A2A2A',
                      borderRadius: 4,
                      marginTop: 5,
                      opacity: pulseAnim
                    }}
                  />
                </View>

                {/* Skeleton for Macro Bars */}
                <View style={styles.macroRow}>
                  {/* Protein */}
                  <View style={styles.macroColumn}>
                    <Animated.View 
                      style={{
                        width: 45,
                        height: 13,
                        backgroundColor: '#2A2A2A',
                        borderRadius: 4,
                        opacity: pulseAnim
                      }}
                    />
                    <View style={styles.macroBarContainer}>
                      <Animated.View 
                        style={{
                          height: '100%',
                          width: '60%',
                          backgroundColor: '#2A2A2A',
                          borderRadius: 3,
                          opacity: pulseAnim
                        }}
                      />
                    </View>
                    <Animated.View 
                      style={{
                        width: 45,
                        height: 12,
                        backgroundColor: '#2A2A2A',
                        borderRadius: 4,
                        opacity: pulseAnim,
                        marginTop: 2
                      }}
                    />
                  </View>
                  
                  {/* Carbs */}
                  <View style={styles.macroColumn}>
                    <Animated.View 
                      style={{
                        width: 35,
                        height: 13,
                        backgroundColor: '#2A2A2A',
                        borderRadius: 4,
                        opacity: pulseAnim
                      }}
                    />
                    <View style={styles.macroBarContainer}>
                      <Animated.View 
                        style={{
                          height: '100%',
                          width: '80%',
                          backgroundColor: '#2A2A2A',
                          borderRadius: 3,
                          opacity: pulseAnim
                        }}
                      />
                    </View>
                    <Animated.View 
                      style={{
                        width: 45,
                        height: 12,
                        backgroundColor: '#2A2A2A',
                        borderRadius: 4,
                        opacity: pulseAnim,
                        marginTop: 2
                      }}
                    />
                  </View>
                  
                  {/* Fat */}
                  <View style={styles.macroColumn}>
                    <Animated.View 
                      style={{
                        width: 25,
                        height: 13,
                        backgroundColor: '#2A2A2A',
                        borderRadius: 4,
                        opacity: pulseAnim
                      }}
                    />
                    <View style={styles.macroBarContainer}>
                      <Animated.View 
                        style={{
                          height: '100%',
                          width: '40%',
                          backgroundColor: '#2A2A2A',
                          borderRadius: 3,
                          opacity: pulseAnim
                        }}
                      />
                    </View>
                    <Animated.View 
                      style={{
                        width: 35,
                        height: 12,
                        backgroundColor: '#2A2A2A',
                        borderRadius: 4,
                        opacity: pulseAnim,
                        marginTop: 2
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Skeleton for Toggle */}
            <View style={styles.toggleContainer}>
              <View style={styles.toggleBackground}>
                <View style={styles.toggleIconWrapper}>
                  <Animated.View 
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: '#2A2A2A',
                      borderRadius: 4,
                      opacity: pulseAnim
                    }}
                  />
                </View>
                <View style={styles.toggleIconWrapper}>
                  <Animated.View 
                    style={{
                      width: 7,
                      height: 7,
                      backgroundColor: '#2A2A2A',
                      borderRadius: 3,
                      opacity: pulseAnim
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.bottomContainer, { marginTop: 10 }]}>
          <View style={styles.expandedContent}>
            <View style={styles.dateContainer}>
              <Animated.View 
                style={{
                  width: 150,
                  height: 16,
                  backgroundColor: '#2A2A2A',
                  borderRadius: 4,
                  opacity: pulseAnim
                }}
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.mealsContainer}>
              {/* Skeleton Meals - Styled more like actual MealComponent */}
              {[...Array(3)].map((_, index) => (
                <Animated.View 
                  key={`meal-${index}`}
                  style={{
                    height: 80,
                    backgroundColor: '#1E1E1E',
                    borderRadius: 8,
                    marginVertical: 8,
                    padding: 12,
                    flexDirection: 'row',
                    opacity: pulseAnim,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {/* Image placeholder */}
                  <Animated.View 
                    style={{
                      width: 55,
                      height: 55,
                      borderRadius: 8,
                      backgroundColor: '#2A2A2A',
                    }}
                  />
                  {/* Content placeholders */}
                  <View style={{ marginLeft: 12, flex: 1, justifyContent: 'center' }}>
                    <Animated.View 
                      style={{
                        width: 120,
                        height: 16,
                        backgroundColor: '#2A2A2A',
                        borderRadius: 4,
                        marginBottom: 8
                      }}
                    />
                    <View style={{ flexDirection: 'row' }}>
                      <Animated.View 
                        style={{
                          width: 50,
                          height: 12,
                          backgroundColor: '#2A2A2A',
                          borderRadius: 4,
                          marginRight: 8
                        }}
                      />
                      <Animated.View 
                        style={{
                          width: 40,
                          height: 12,
                          backgroundColor: '#2A2A2A',
                          borderRadius: 4,
                        }}
                      />
                    </View>
                  </View>
                  {/* Right side info */}
                  <View style={{ alignItems: 'flex-end', justifyContent: 'center', width: 50 }}>
                    <Animated.View 
                      style={{
                        width: 40,
                        height: 16,
                        backgroundColor: '#2A2A2A',
                        borderRadius: 4,
                        marginBottom: 5
                      }}
                    />
                    <Animated.View 
                      style={{
                        width: 35,
                        height: 12,
                        backgroundColor: '#2A2A2A',
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </Animated.View>
              ))}
            </View>
            
            <View style={{ height: 20 }} />

            {/* Skeleton Load Previous Day button */}
            <Animated.View
              style={{
                height: 50,
                backgroundColor: '#1E1E1E',
                borderRadius: 10,
                marginVertical: 10,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pulseAnim,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <Animated.View 
                style={{
                  width: 140,
                  height: 16,
                  backgroundColor: '#2A2A2A',
                  borderRadius: 4,
                }}
              />
            </Animated.View>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
};

export const MealViewer: React.FC<MealViewerProps> = ({
  daysData,
  onFooterVisibilityChange,
  onLoadPreviousDay,
  canLoadMore,
  onMealPress,
  isLoading = false,
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);
  
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Card flip animation state
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  
  const bottomSheetVisibleHeightRatio = 0.6;
  const topContainerMarginTopRatio = 0.47;
  const bottomSheetHeight = height * bottomSheetVisibleHeightRatio;
  const firstTopContainerOffset = bottomSheetHeight * topContainerMarginTopRatio;

  useEffect(() => {
    onFooterVisibilityChange(true);
  }, []);

  const handleScroll = (event) => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };

  const calculateRemainingCalories = (consumed: number, goal: number): string => {
    const remaining = goal - consumed;
    return Math.max(0, remaining).toLocaleString('en-US');
  };

  const calculateProgress = (consumed: number, goal: number): number => {
    if (goal <= 0) return 0;
    return Math.min(1, Math.max(0, consumed / goal));
  };

  // Handle card flip
  const handleCardFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    
    Animated.timing(flipAnimation, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    setIsFlipped(!isFlipped);
  };

  // Interpolations for the flip animation
  const frontRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  // Simple toggle state - no complex animations
  const personIconOpacity = isFlipped ? 0.4 : 1;
  const petIconOpacity = isFlipped ? 1 : 0.4;

  const fixedShadowOpacity = scrollY.interpolate({
    inputRange: [firstTopContainerOffset - 1, firstTopContainerOffset],
    outputRange: [0, 1], 
    extrapolate: 'clamp'
  });

  const scrollableHandleOpacity = scrollY.interpolate({
    inputRange: [firstTopContainerOffset - 1, firstTopContainerOffset],
    outputRange: [1, 0], 
    extrapolate: 'clamp'
  });

  // If loading or no data yet, show the skeleton
  if (isLoading || !daysData || daysData.length === 0) {
    return <MealViewerSkeleton />;
  }

  return (
    <View style={styles.bottomSheetWrapper}>
      <Animated.View 
        style={[
          styles.bottomSheetTopShadow, 
          {
            opacity: fixedShadowOpacity, 
            zIndex: 20 
          }
        ]}
        pointerEvents="none" 
      >
        <View style={styles.handleBar} />
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.bottomSheetScrollView}
        contentContainerStyle={[styles.bottomSheetContent, { minHeight: height }]}
        bounces={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={1} 
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true } 
        )}
        overScrollMode="always"
      >
        {daysData.map((day, index) => {
          const proteinProgress = calculateProgress(day.proteinConsumed, day.proteinGoal);
          const carbsProgress = calculateProgress(day.carbsConsumed, day.carbsGoal);
          const fatProgress = calculateProgress(day.fatConsumed, day.fatGoal);
          const remainingCalories = calculateRemainingCalories(day.totalCaloriesConsumed, day.calorieGoal);

          return (
            <React.Fragment key={day.date}>
              <View
                style={[
                  styles.topContainer,
                  {
                    marginTop: index === 0 ? firstTopContainerOffset : 0,
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                  },
                ]}
              >
                {index === 0 && (
                  <Animated.View 
                    style={[
                      styles.bottomSheetHandle, 
                      { opacity: scrollableHandleOpacity } 
                    ]}
                  >
                    <View style={styles.handleBar} />
                  </Animated.View>
                )}
                
                {/* Tappable Card Content */}
                <TouchableOpacity 
                  style={[styles.peekContent, { paddingTop: index === 0 ? 5 : 30 }]}
                  onPress={index === 0 ? handleCardFlip : undefined}
                  activeOpacity={index === 0 ? 0.9 : 1}
                >
                  <View style={styles.flipCardContainer}>
                    {/* Front Side - Calories and Macros */}
                    <Animated.View 
                      style={[
                        styles.flipCardSide,
                        {
                          transform: [{ rotateY: frontRotateY }],
                          opacity: frontOpacity,
                        }
                      ]}
                    >
                      <View style={styles.calorieSection}>
                        <Text style={styles.calorieTitle}>{remainingCalories}</Text>
                        <Text style={styles.calorieSubtitle}>REMAINING</Text>
                      </View>
                      <View style={styles.macroRow}>
                        <View style={styles.macroColumn}>
                          <Text style={styles.macroLabel}>Protein</Text>
                          <View style={styles.macroBarContainer}>
                            <View style={[styles.macroBar, styles.proteinBar, { width: `${proteinProgress * 100}%` }]} />
                          </View>
                          <Text style={styles.macroValue}>
                            {`${Math.round(day.proteinConsumed)} / ${day.proteinGoal} g`}
                          </Text>
                        </View>
                        <View style={styles.macroColumn}>
                          <Text style={styles.macroLabel}>Carbs</Text>
                          <View style={styles.macroBarContainer}>
                            <View style={[styles.macroBar, styles.carbsBar, { width: `${carbsProgress * 100}%` }]} />
                          </View>
                          <Text style={styles.macroValue}>
                             {`${Math.round(day.carbsConsumed)} / ${day.carbsGoal} g`}
                          </Text>
                        </View>
                        <View style={styles.macroColumn}>
                          <Text style={styles.macroLabel}>Fat</Text>
                          <View style={styles.macroBarContainer}>
                            <View style={[styles.macroBar, styles.fatBar, { width: `${fatProgress * 100}%` }]} />
                          </View>
                          <Text style={styles.macroValue}>
                             {`${Math.round(day.fatConsumed)} / ${day.fatGoal} g`}
                          </Text>
                        </View>
                      </View>
                    </Animated.View>

                    {/* Back Side - Pet Screen */}
                    <Animated.View 
                      style={[
                        styles.flipCardSide,
                        styles.flipCardBack,
                        {
                          transform: [{ rotateY: backRotateY }],
                          opacity: backOpacity,
                        }
                      ]}
                    >
                      <View style={styles.petScreenContainer}>
                        <Text style={styles.petScreenTitle}>Pet Screen</Text>
                        <Text style={styles.petScreenSubtitle}>Coming Soon!</Text>
                      </View>
                    </Animated.View>
                  </View>

                  {/* Simple Toggle */}
                  {index === 0 && (
                    <View style={styles.toggleContainer}>
                      <View style={styles.toggleBackground}>
                        <View style={styles.toggleIconWrapper}>
                          <Ionicons 
                            name="person" 
                            size={8} 
                            color="#FFFFFF" 
                            style={{ opacity: personIconOpacity }}
                          />
                        </View>
                        <View style={styles.toggleIconWrapper}>
                          <Ionicons 
                            name="diamond" 
                            size={7} 
                            color="#FFFFFF" 
                            style={{ opacity: petIconOpacity }}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={[styles.bottomContainer, { marginTop: 10 }]}>
                <View style={styles.expandedContent}>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{day.date}</Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.mealsContainer}>
                    {day.mealData.length > 0 ? (
                       day.mealData.map((meal) => (
                         <MealComponent
                           key={`${day.date}-${meal.id}`}
                           mealName={meal.mealName}
                           protein={meal.protein}
                           carbs={meal.carbs}
                           fat={meal.fat}
                           date={meal.date}
                           calories={meal.calories}
                           loggedTime={meal.loggedTime}
                           imageUrl={meal.imageUrl}
                           onPress={() => onMealPress(meal)}
                         />
                       ))
                    ) : (
                       <Text style={styles.noMealsText}>No meals logged for this day.</Text>
                    )}
                  </View>
                  <View style={{ height: 20 }} />
                </View>
              </View>

              {index < daysData.length - 1 && <View style={{ height: 15 }} />}
            </React.Fragment>
          );
        })}

        {canLoadMore && (
          <TouchableOpacity
            style={styles.loadPreviousDayButton}
            onPress={onLoadPreviousDay}
            activeOpacity={0.7}
          >
            <Text style={styles.loadPreviousDayButtonText}>Load Previous Day</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
};