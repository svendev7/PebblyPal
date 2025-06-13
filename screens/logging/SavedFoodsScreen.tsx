"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  UIManager,
  Easing,
  InteractionManager,
} from "react-native"
import { Ionicons, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons" // Using Ionicons for cart
import { auth } from "../../config/firebase.client"
import { useSavedItems } from "../../context/SavedItemsContext"
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler"
import { useCart } from "../../context/CartContext"
import FoodEditScreen from "../editting/FoodEditScreen"
import SavedMealsEditScreen from "../editting/SavedMealsEditScreen"
import Header from "../../components/Header/Header"
import SearchBar from "../../components/Header/SearchBar"
import SimpleToast from "../../components/toast/SimpleToast"
import { useRouter, useLocalSearchParams } from "expo-router"

const { width, height } = Dimensions.get("window")

// Interfaces for data types
interface FoodItem {
  id: string
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
  sodium?: number
  sugar?: number
  fibers?: number
  type: "Recent" | "Created" | "Favorites"
  isFavorite: boolean
  servingSize?: number
  servingUnit?: string
  imageUrl?: string
}

interface MealItem {
  id: string
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
  sodium?: number
  sugar?: number
  fibers?: number
  type: "Recent" | "Created" | "Favorites"
  isFavorite: boolean
  servingSize?: number
  servingUnit?: string
  imageUrl?: string
  isUserCreated?: boolean
  userId?: string
}

interface SavedFoodsScreenProps {
  navigation: any // Keep for backwards compatibility
}

const SavedFoodsScreen: React.FC<SavedFoodsScreenProps> = ({ navigation }) => {
  // Add router for navigation
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Use SavedItems Context
  const { foods, meals, favorites, recentItems, loading, error, deleteItem, toggleFavorite, refreshData, updateItem } = useSavedItems();
  
  const [activeTab, setActiveTab] = useState("Foods")
  const [searchText, setSearchText] = useState("")
  const [activeFilter, setActiveFilter] = useState("Recent")
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodItem | MealItem | null>(null)
  const [quantity, setQuantity] = useState("100")
  const [unit, setUnit] = useState("g")
  const [isLoggingSingleItem, setIsLoggingSingleItem] = useState(false)
  const modalOffset = useRef(new Animated.Value(0)).current
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current
  const filterIndicatorPosition = useRef(new Animated.Value(0)).current
  
  // Toast state
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'loading'>('success')

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({})

  // Get cart context
  const { cartItems, itemCount, addToCart, clearCart: contextClearCart, updateQuantity, removeFromCart } = useCart();

  // Add state for food edit screen
  const [showFoodEdit, setShowFoodEdit] = useState(false)
  const [selectedFoodToEdit, setSelectedFoodToEdit] = useState<FoodItem | null>(null)
  const [showMealEdit, setShowMealEdit] = useState(false)
  const [selectedMealToEdit, setSelectedMealToEdit] = useState<MealItem | null>(null)
  
  // Add state for delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<FoodItem | MealItem | null>(null)
  

  
  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'loading' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };
  
  // Hide toast
  const hideToast = () => {
    setToastVisible(false);
  };

  // Set up keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        Animated.timing(modalOffset, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start()
      },
    )

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.timing(modalOffset, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start()
      },
    )

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  // Focus listener to handle params when navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Determine if cart should be cleared based on params
      const shouldClearCart = params?.clearCart === 'true' || params?.mealLogged === 'true';
      
      if (shouldClearCart) {
        // Clear cart context immediately (non-blocking)
        contextClearCart();
      } else {
        // Remove console log
      }
      
      // Run heavy operations asynchronously without blocking navigation
      const handleFocusOperations = async () => {
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            // Cart clearing is now handled by context, no Firebase clearing needed
            
            // Check for success message explicitly
            const successMessage = params?.successMessage;
            if (successMessage) {
              showToast(successMessage.toString(), 'success');
              return; // Skip the rest if we have a direct success message
            }
            
            // Only reload if a food/meal was added or edited
            if (params?.foodChanged === 'true' || params?.mealChanged === 'true') {
              // Don't show loading popup or refresh data - context auto-updates
              // Just show success message immediately
              if (params?.foodChanged === 'true') {
                showToast("Food successfully saved", 'success');
              } else if (params?.mealChanged === 'true') {
                showToast("Meal successfully saved", 'success');
              }
            }
          }
        } catch (error) {
          console.error("Error on screen focus:", error);
          hideToast();
        }
      };
      
      // Run focus operations without blocking the UI
      setTimeout(handleFocusOperations, 0);
    });
    
    // Clean up the listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe.remove?.();
      }
      if (toastVisible) {
        hideToast();
      }
    };
  }, [navigation, contextClearCart, cartItems, params]);
  
  // Helper functions to transform meals and foods
  const transformMeal = (filter: "Recent" | "Created" | "Favorites") => (meal: any): MealItem => ({
    id: meal.id,
    name: meal.mealName || meal.name,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    sodium: meal.sodium || 0,
    sugar: meal.sugar || 0,
    fibers: meal.fibers || 0,
    type: filter,
    isFavorite: meal.isFavorite || false,
    servingSize: meal.servingSize,
    servingUnit: meal.servingUnit || 'serving',
    imageUrl: meal.imageUrl,
    isUserCreated: meal.isUserCreated || meal.isCustom || false,
    userId: meal.userId
  });
  
  const transformFood = (filter: "Recent" | "Created" | "Favorites") => (food: any): FoodItem => ({
    id: food.id,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    sodium: food.sodium || 0,
    sugar: food.sugar || 0,
    fibers: food.fibers || 0,
    type: filter,
    isFavorite: food.isFavorite || false,
    servingSize: food.servingSize,
    servingUnit: food.servingUnit || 'g',
    imageUrl: food.imageUrl,
  });

  // Modify handleTabPress to animate layout changes
  const handleTabPress = (tabName: string) => {
    if (tabName === activeTab) return;

    // Animate tab indicator
    Animated.spring(tabIndicatorPosition, {
      toValue: tabName === "Foods" ? 0 : 1,
      friction: 20,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Reset filter indicator position
    Animated.spring(filterIndicatorPosition, {
      toValue: 0,
      friction: 20,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Update state immediately
    setActiveTab(tabName);
    setActiveFilter("Recent");
    setSearchBarSticky(false);
  };

  // Modify handleFilterPress similarly
  const handleFilterPress = (filterName: string) => {
    if (filterName === activeFilter) return;

    // Animate filter indicator
    const filterIndex = ["Recent", "Created", "Favorites"].indexOf(filterName);
    Animated.spring(filterIndicatorPosition, {
      toValue: filterIndex,
      friction: 20,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Update state immediately
    setActiveFilter(filterName);
    setSearchBarSticky(false);
  };

  const handleAddItemToMeal = (item: FoodItem | MealItem, selectedQuantity = "100", selectedUnit = "g") => {
    // Determine item type based on active tab
    const itemType = activeTab === "Foods" ? "food" : "meal";
    
    // Prepare the item with quantity and unit for the cart context
    const itemToAdd = {
      ...item,
      amount: Number.parseFloat(selectedQuantity) || (itemType === 'food' ? 100 : 1), // Default amount
      unit: selectedUnit || (itemType === 'food' ? 'g' : 'serving'), // Default unit
      // Ensure basic fields are present for CartItem interface
      name: item.name || 'Unnamed Item',
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      calories: item.calories || 0,
      sodium: item.sodium || 0,
      sugar: item.sugar || 0,
      fibers: item.fibers || 0,
    };

    // Add to cart using context function
    addToCart(itemToAdd, itemType); 
    
    // Show success message
    showToast('Item Added to Meal', 'success');
  }

  const handleEditItem = (item: FoodItem | MealItem) => {
    if (activeTab === "Foods") {
      // Set the selected food for editing
      setSelectedFoodToEdit(item as FoodItem);
      setShowFoodEdit(true);
    } else {
      // Set the selected meal for editing
      setSelectedMealToEdit(item as MealItem);
      setShowMealEdit(true);
    }
  };

  const handleFoodPress = (item: FoodItem | MealItem) => {
    setSelectedFood(item)
    // Reset quantity and unit to default values each time
    setQuantity("100")
    setUnit("g")
    setModalVisible(true)
  }

  // Helper function to format macro values
  const formatMacro = (value: number, isCalorie = false): string => {
    if (isCalorie) {
      // Round calories to whole numbers
      return Math.round(value).toString()
    } else {
      // Round other macros to 1 decimal place and remove trailing zeros
      const rounded = Math.round(value * 10) / 10
      return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)
    }
  }

  const renderQuantityModal = () => {
    if (!selectedFood) return null
    
    // Calculate macro values based on current quantity input
    const baseAmount = 100 // Base amount (typically 100g)
    const ratio = Number.parseFloat(quantity) / baseAmount || 0
    
    const calculatedMacros = {
      protein: Math.round(selectedFood.protein * ratio * 10) / 10,
      carbs: Math.round(selectedFood.carbs * ratio * 10) / 10,
      fat: Math.round(selectedFood.fat * ratio * 10) / 10,
      calories: Math.round(selectedFood.calories * ratio),
      sodium: Math.round((selectedFood.sodium || 0) * ratio),
      sugar: Math.round((selectedFood.sugar || 0) * ratio * 10) / 10,
      fibers: Math.round((selectedFood.fibers || 0) * ratio * 10) / 10,
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalOffset }] }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Set Quantity</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.foodTitleInModal}>{selectedFood.name}</Text>
              
              {/* Dynamic Macro Display */}
              <View style={styles.dynamicMacrosContainer}>
                <View style={styles.calorieRow}>
                  <Text style={styles.dynamicCalorieValue}>{formatMacro(calculatedMacros.calories, true)}</Text>
                  <Text style={styles.dynamicCalorieLabel}>Calories</Text>
                </View>
                
                <View style={styles.dynamicMacrosRow}>
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.proteinColor]}>
                      {formatMacro(calculatedMacros.protein)}g
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Protein</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.carbsColor]}>
                      {formatMacro(calculatedMacros.carbs)}g
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Carbs</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.fatColor]}>
                      {formatMacro(calculatedMacros.fat)}g
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Fat</Text>
                  </View>
                </View>
                
                <View style={styles.dynamicMacrosRow}>
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.sodiumColor]}>
                      {formatMacro(calculatedMacros.sodium)}mg
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Sodium</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.sugarColor]}>
                      {formatMacro(calculatedMacros.sugar)}g
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Sugar</Text>
                  </View>
                  
                  <View style={styles.dynamicMacroItem}>
                    <Text style={[styles.dynamicMacroValue, styles.fiberColor]}>
                      {formatMacro(calculatedMacros.fibers)}g
                    </Text>
                    <Text style={styles.dynamicMacroLabel}>Fiber</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.modalSubtitle}>Set quantity:</Text>
              
              <View style={styles.quantityInputContainer}>
                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="100"
                  placeholderTextColor="#666666"
                />
                
                <View style={styles.unitSelector}>
                  {["g", "ml", "oz"].map((unitOption) => (
                    <TouchableOpacity 
                      key={unitOption}
                      style={[styles.unitOption, unit === unitOption && styles.selectedUnit]}
                      onPress={() => setUnit(unitOption)}
                    >
                      <Text style={[styles.unitText, unit === unitOption && styles.selectedUnitText]}>
                        {unitOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.addToMealButton}
                onPress={() => {
                  handleAddItemToMeal(selectedFood, quantity, unit)
                  setModalVisible(false)
                }}
              >
                <Text style={styles.addToMealButtonText}>Add to Meal</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  // Function to handle favoriting an item
  const handleFavoriteItem = async (itemId: string) => {
    try {
      // Find the item to get current status
      const item = [...foods, ...meals].find(item => item.id === itemId);
      if (!item) return;
      
      const newStatus = !item.isFavorite;
      
      // Update using context
      await toggleFavorite(itemId, newStatus);
      
      showToast(newStatus ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch (error) {
      console.error('Error updating favorite status:', error);
      showToast('Failed to update favorite status', 'error');
    }
  };

  // Function to confirm deletion
  const confirmDeleteItem = (item: FoodItem | MealItem) => {
    // Set the item to delete and show the confirmation modal
    setItemToDelete(item)
    setShowDeleteConfirm(true)
    
    // Close the swipeable
    if (swipeableRefs.current[item.id]) {
      swipeableRefs.current[item.id]?.close()
    }
  }
  
  // Function to handle actual deletion after confirmation
  const handleDeleteConfirmed = async () => {
    if (!itemToDelete) return
    
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        showToast("Error: You must be logged in to delete items", 'error')
        return
      }
      
      // Show deleting feedback
      showToast("Deleting...", 'loading')
      
      // Close the confirmation modal
      setShowDeleteConfirm(false)
      
      // Context handles UI state updates automatically
      
      // Find corresponding cart item(s) by originalItemId and remove from context cart
      const cartItemsToRemove = cartItems.filter(ci => ci.originalItemId === itemToDelete.id)
      cartItemsToRemove.forEach(ci => removeFromCart(ci.id)) // Use context remove

      // Delete using context (already called above)
      // await deleteItem(itemToDelete.id) - already called
      
      // Show success message
      showToast("Item deleted successfully", 'success')
      
    } catch (error) {
      console.error("Error deleting item:", error)
      showToast("Failed to delete item", 'error')
      // Context handles data syncing automatically
    } finally {
      setItemToDelete(null)
    }
  }
  
  // Render custom delete confirmation modal
  const renderDeleteConfirmModal = () => {
    if (!itemToDelete) return null
    
    return (
      <Modal
        transparent={true}
        visible={showDeleteConfirm}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDeleteConfirm(false)}>
          <View style={styles.confirmModalOverlay}>
            <TouchableWithoutFeedback onPress={(e: any) => e.stopPropagation()}>
              <View style={styles.confirmModalContainer}>
                <Text style={styles.confirmModalTitle}>Delete Item</Text>
                <Text style={styles.confirmModalMessage}>
                  Are you sure you want to delete "{itemToDelete.name}"?
                </Text>
                <View style={styles.confirmModalButtons}>
                  <TouchableOpacity 
                    style={styles.confirmModalCancelButton}
                    onPress={() => setShowDeleteConfirm(false)}
                  >
                    <Text style={styles.confirmModalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.confirmModalDeleteButton}
                    onPress={handleDeleteConfirmed}
                  >
                    <Text style={styles.confirmModalDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  // Render the left action (now favorite)
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: FoodItem | MealItem,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.5, 1],
      extrapolate: "clamp",
    })

    const opacity = dragX.interpolate({
      inputRange: [0, 20, 80],
      outputRange: [0, 0.5, 1],
      extrapolate: "clamp",
    })

    const isFavorite = item.isFavorite

    return (
      <Animated.View
        style={[
          styles.leftAction,
          {
            opacity: opacity,
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale }],
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity style={styles.favoriteAction} onPress={() => handleFavoriteItem(item.id)}>
            <AntDesign name={isFavorite ? "star" : "staro"} size={20} color="#000000" />
            <Text style={styles.actionTextFavorite}>{isFavorite ? "Unfav" : "Fav"}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    )
  }

  // Render the right action (now delete)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: FoodItem | MealItem,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    })

    const opacity = dragX.interpolate({
      inputRange: [-80, -20, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: "clamp",
    })

    return (
      <Animated.View
        style={[
          styles.rightAction,
          {
            opacity: opacity,
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale }],
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity style={styles.deleteAction} onPress={() => confirmDeleteItem(item)}>
            <AntDesign name="delete" size={20} color="#FFFFFF" />
            <Text style={styles.actionTextDelete}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    )
  }

  // Modify renderContent - extract just the item rendering logic
  const renderItem = ({ item }: { item: FoodItem | MealItem }) => {
    // Determine if this is a food or meal item
    const isFood = activeTab === "Foods"
    
    return (
      <View style={styles.itemWrapper}>
        <Swipeable
          key={`swipeable-${item.id}`}
          ref={(ref) => {
            swipeableRefs.current[item.id] = ref;
          }}
          renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
          renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
          leftThreshold={40}
          rightThreshold={40}
          friction={1}
          overshootLeft={false}
          overshootRight={false}
          overshootFriction={8}
          onSwipeableOpen={(direction) => {
            // Close other open swipeables when a new one is opened
            Object.entries(swipeableRefs.current).forEach(([id, ref]) => {
              if (id !== item.id && ref) {
                ref.close()
              }
            })
          }}
        >
          <View style={styles.listItem}>
            <View style={styles.itemImageContainer}>
              {isFood ? (
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="nutrition-outline" size={20} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="restaurant-outline" size={20} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={styles.itemDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
                  {item.name}
                </Text>
                {item.isFavorite && (
                  <AntDesign name="star" size={16} color="#FFD700" style={styles.favoriteIcon} />
                )}
                <TouchableOpacity 
                  style={styles.moreOptionsButton} 
                  onPress={() => handleEditItem(item)}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={18} color="#EDEDED" />
                </TouchableOpacity>
              </View>

              <View style={styles.macroWrapper}>
                <View style={styles.macrosContainer}>
                  <View style={styles.macroItem}>
                    <View style={[styles.macroDot, { backgroundColor: "#EF476F" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.protein)}g </Text>
                      <Text style={styles.macroLabel}>P</Text>
                    </Text>
                  </View>

                  <View style={[styles.macroItem, styles.centerMacro]}>
                    <View style={[styles.macroDot, { backgroundColor: "#06D6A0" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.carbs)}g </Text>
                      <Text style={styles.macroLabel}>C</Text>
                    </Text>
                  </View>

                  <View style={[styles.macroItem, styles.rightMacro]}>
                    <View style={[styles.macroDot, { backgroundColor: "#FFD166" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.fat)}g </Text>
                      <Text style={styles.macroLabel}>F</Text>
                    </Text>
                  </View>
                </View>
                
                <View style={styles.macroSeparator} />

                <View style={styles.macrosContainer}>
                  <View style={styles.macroItem}>
                    <View style={[styles.macroDot, { backgroundColor: "#FF9500" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.sodium || 0)}mg </Text>
                      <Text style={styles.macroLabel}>Na</Text>
                    </Text>
                  </View>

                  <View style={[styles.macroItem, styles.centerMacro]}>
                    <View style={[styles.macroDot, { backgroundColor: "#D4C19C" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.sugar || 0)}g </Text>
                      <Text style={styles.macroLabel}>S</Text>
                    </Text>
                  </View>

                  <View style={[styles.macroItem, styles.rightMacro]}>
                    <View style={[styles.macroDot, { backgroundColor: "#5AC8FA" }]} />
                    <Text style={styles.macroText} numberOfLines={1}>
                      <Text style={styles.macroValue}>{formatMacro(item.fibers || 0)}g </Text>
                      <Text style={styles.macroLabel}>Fi</Text>
                    </Text>
                  </View>
                </View>
              
                <View style={styles.macroSeparator} />
              
                <View style={styles.footerRow}>
                  <Text style={styles.itemCaloriesValue}>{formatMacro(item.calories, true)} Calories</Text>
                  <Text style={styles.perUnitText}>per {item.servingSize || 100} {item.servingUnit || 'g'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.addButton} onPress={() => handleFoodPress(item)}>
                <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Swipeable>
      </View>
    )
  }

  // Helper functions to transform context items to component interfaces
  const transformContextItemToFoodItem = (item: any): FoodItem => ({
    id: item.id,
    name: item.name,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    calories: item.calories,
    sodium: item.sodium || 0,
    sugar: item.sugar || 0,
    fibers: item.fibers || 0,
    type: activeFilter as "Recent" | "Created" | "Favorites",
    isFavorite: item.isFavorite || false,
    servingSize: item.servingSize,
    servingUnit: item.servingUnit || 'g',
    imageUrl: item.imageUrl,
  });
  
  const transformContextItemToMealItem = (item: any): MealItem => ({
    id: item.id,
    name: item.name,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    calories: item.calories,
    sodium: item.sodium || 0,
    sugar: item.sugar || 0,
    fibers: item.fibers || 0,
    type: activeFilter as "Recent" | "Created" | "Favorites",
    isFavorite: item.isFavorite || false,
    servingSize: item.servingSize,
    servingUnit: item.servingUnit || 'serving',
    imageUrl: item.imageUrl,
    isUserCreated: item.isUserCreated || false,
    userId: item.userId,
  });

  // Create a new renderContent function for state handling, doesn't return UI
  // Removed getContentData function - using displayedItems directly

  // Memoize filtered list data for performance - optimized to prevent flicker
  const displayedItems = useMemo(() => {
    // Return empty array when loading to prevent flicker
    if (loading) {
      return [];
    }
    
    // Get base data from context based on active tab and filter
    let baseData: (FoodItem | MealItem)[] = [];
    
    try {
      if (activeTab === "Foods") {
        switch (activeFilter) {
          case "Recent":
            baseData = (recentItems || [])
              .filter(item => item?.itemType === 'food')
              .map(transformContextItemToFoodItem);
            break;
          case "Favorites":
            baseData = (favorites || [])
              .filter(item => item?.itemType === 'food')
              .map(transformContextItemToFoodItem);
            break;
          case "Created":
            baseData = (foods || [])
              .filter(item => item?.isUserCreated)
              .map(transformContextItemToFoodItem);
            break;
          default:
            baseData = (foods || []).map(transformContextItemToFoodItem);
        }
      } else {
        switch (activeFilter) {
          case "Recent":
            baseData = (recentItems || [])
              .filter(item => item?.itemType === 'meal')
              .map(transformContextItemToMealItem);
            break;
          case "Favorites":
            baseData = (favorites || [])
              .filter(item => item?.itemType === 'meal')
              .map(transformContextItemToMealItem);
            break;
          case "Created":
            baseData = (meals || [])
              .filter(item => item?.isUserCreated)
              .map(transformContextItemToMealItem);
            break;
          default:
            baseData = (meals || []).map(transformContextItemToMealItem);
        }
      }

      // Apply search filter
      if (searchText.trim()) {
        const searchLower = searchText.toLowerCase().trim();
        return baseData.filter((item) => 
          item?.name?.toLowerCase().includes(searchLower)
        );
      }

      return baseData;
    } catch (error) {
      console.error('Error filtering displayed items:', error);
      return [];
    }
  }, [activeTab, activeFilter, searchText, foods, meals, favorites, recentItems, loading]);

  // Create a rendering function for list header
  const renderListHeader = () => {
    return (
      <View>
        {/* Sticky search bar - remove condition to make it consistent for all tabs */}
        {searchBarSticky && (
          <View style={styles.stickySearchContainer}>
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        )}
        
        {/* Updated Tabs with Animated Indicator */}
        <View style={styles.tabContainer}>
          {/* Animated Tab Indicator */}
          <Animated.View 
            style={[
              styles.tabIndicator,
              {
                transform: [{ translateX: tabIndicatorPosition.interpolate({
                  inputRange: [0,1], outputRange: [0, width/2-20], extrapolate:'clamp'
                }) }],
              },
            ]}
          />

          <TouchableOpacity style={styles.tabButton} onPress={() => handleTabPress("Foods")}>
            <Text style={[styles.tabText, activeTab === "Foods" && styles.activeTabText]}>Foods</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton} onPress={() => handleTabPress("Meals")}>
            <Text style={[styles.tabText, activeTab === "Meals" && styles.activeTabText]}>Meals</Text>
          </TouchableOpacity>
        </View>

        {/* Updated Add Food Button */}
        {activeTab === "Foods" && (
          <TouchableOpacity style={styles.addFoodButton} onPress={handleAddFoodPress}>
            <MaterialCommunityIcons name="plus" size={20} color="#45A557" />
            <Text style={styles.addFoodButtonText}>Add food</Text>
          </TouchableOpacity>
        )}

        {/* Updated Filters with Animated Indicator */}
        <View style={styles.filterContainer}>
          {/* Animated Filter Indicator */}
          <Animated.View 
            style={[
              styles.filterIndicator,
              {
                width: (width - 40) / 3,
                transform: [{ translateX: filterIndicatorPosition.interpolate({
                  inputRange: [0,1,2], outputRange: [0, (width-40)/3, 2*(width-40)/3], extrapolate:'clamp'
                }) }],
              },
            ]}
          />

          {["Recent", "Created", "Favorites"].map((filter) => (
            <TouchableOpacity 
              key={filter} 
              style={styles.filterButton} 
              onPress={() => handleFilterPress(filter)}
              activeOpacity={0.7}
              hitSlop={{top: 10, bottom: 10, left: 5, right: 5}}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Create List Empty Component - fixed to prevent flicker
  const ListEmptyComponent = () => {
    // Show loading indicator when loading
    if (loading) {
      return (
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 60,
          height: 200,
        }}>
          <ActivityIndicator size="large" color="#3E92CC" />
          <Text style={{
            color: "#FFFFFF",
            fontSize: 16,
            marginTop: 10,
          }}>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 40,
        }}>
          <MaterialCommunityIcons name="alert-circle" size={40} color="#FF3B30" />
          <Text style={{
            color: "#FF3B30",
            fontSize: 16,
            textAlign: "center",
            marginVertical: 10,
            paddingHorizontal: 20,
          }}>{error}</Text>
          <TouchableOpacity onPress={refreshData} style={{
            backgroundColor: "#3E92CC",
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            marginTop: 10,
          }}>
            <Text style={{
              color: "#FFFFFF",
              fontWeight: "600",
            }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name={activeTab === "Foods" ? "food-off" : "food-variant-off"} size={60} color="#A0A0A0" />
        <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found</Text>
        {activeTab === "Foods" && activeFilter === "Created" && (
          <TouchableOpacity style={styles.addEmptyButton} onPress={handleAddFoodPress}>
            <Text style={styles.addEmptyButtonText}>Add Custom Food</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleAddFoodPress = () => {
    // Navigate with proper transition
    router.push('/addfoodoptions');
  }

  // Function to clear the cart completely (simplified using context)
  const clearCart = useCallback(async () => {
    
    // Clear context state immediately
    contextClearCart(); // Call context clearCart
  }, [contextClearCart]); // Dependency on contextClearCart

  const handleContinuePress = () => {
    // Use itemCount from context
    if (itemCount === 0) { 
      Alert.alert("Empty Meal", "Please add at least one item to your meal.")
      return
    }

    // Navigate immediately without any delays
    router.push('/mealreview');
  }

  const handleMealPress = () => {
    // Use itemCount from context
    if (itemCount === 0) { 
      return // Don't navigate if cart is empty
    }
    
    // Navigate immediately without any delays
    router.push('/mealreview');
  }

  // Add this state at the top with other states
  const [searchBarSticky, setSearchBarSticky] = useState(false)

  // Add scroll-to-top refs and state
  const recentListRef = useRef<FlatList>(null)
  const createdListRef = useRef<FlatList>(null)
  const favoritesListRef = useRef<FlatList>(null)
  // Track scroll position for each tab separately
  const [scrollPositions, setScrollPositions] = useState({
    Recent: 0,
    Created: 0,
    Favorites: 0
  });
  // Scroll-to-top button animation value
  const scrollButtonAnim = useRef(new Animated.Value(0)).current;

  // Handler to update scroll position for the active filter
  const handleScroll = (e: any) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    setScrollPositions(prev => ({
      ...prev,
      [activeFilter]: scrollY
    }));
  }

  // Calculate if button should be visible based on active filter's scroll position
  const showScrollToTop = useMemo(() => {
    return scrollPositions[activeFilter] > 200;
  }, [scrollPositions, activeFilter]);

  // Scroll to top function
  const scrollToTop = () => {
    const ref = activeFilter === 'Recent'
      ? recentListRef.current
      : activeFilter === 'Created'
        ? createdListRef.current
        : favoritesListRef.current
    ref?.scrollToOffset({ offset: 0, animated: true })
  }

  // Animate button when visibility changes
  useEffect(() => {
    Animated.timing(scrollButtonAnim, {
      toValue: showScrollToTop ? 1 : 0,
      duration: 200, // Faster animation
      easing: Easing.bezier(0.2, 0.8, 0.2, 1), // Smoother easing
      useNativeDriver: true,
    }).start()
  }, [showScrollToTop])

  // Replace handleSaveFood function with context-based version
  const handleSaveFood = async (updatedFood: FoodItem) => {
    try {
      // Show saving feedback
      showToast("Saving food...", 'loading');
      
      // Update using context
      await updateItem(updatedFood.id, {
        name: updatedFood.name,
        protein: updatedFood.protein,
        carbs: updatedFood.carbs,
        fat: updatedFood.fat,
        calories: updatedFood.calories,
        sugar: updatedFood.sugar || 0,
        fibers: updatedFood.fibers || 0,
        sodium: updatedFood.sodium || 0,
        servingSize: updatedFood.servingSize,
        servingUnit: updatedFood.servingUnit,
        isFavorite: updatedFood.isFavorite,
        imageUrl: updatedFood.imageUrl,
      });
      
      // Close the edit screen
      setShowFoodEdit(false);
      
      // Show success popup
      showToast('Food Successfully Updated', 'success');
    } catch (error) {
      console.error("Error saving food:", error);
      hideToast();
      Alert.alert("Error", "Failed to save changes to food");
    }
  };

  // Replace handleDeleteFood function with context-based version
  const handleDeleteFood = async (foodId: string) => {
    try {
      // Show deleting feedback
      showToast("Deleting food...", 'loading');
      
      // Delete using context
      await deleteItem(foodId);
      
      // Close the edit screen
      setShowFoodEdit(false);
      
      // Show success message
      showToast('Food Deleted', 'success');
    } catch (error) {
      console.error("Error deleting food:", error);
      hideToast();
      Alert.alert("Error", "Failed to delete food");
    }
  };

  // Add these new functions for handling meal saving and deletion
  const handleSaveMeal = async (updatedMeal: MealItem) => {
    try {
      // Show saving feedback
      showToast("Saving meal...", 'loading');
      
      // Update using context
      await updateItem(updatedMeal.id, {
        name: updatedMeal.name,
        protein: updatedMeal.protein,
        carbs: updatedMeal.carbs,
        fat: updatedMeal.fat,
        calories: updatedMeal.calories,
        sugar: updatedMeal.sugar || 0,
        fibers: updatedMeal.fibers || 0,
        sodium: updatedMeal.sodium || 0,
        servingSize: updatedMeal.servingSize,
        servingUnit: updatedMeal.servingUnit,
        isFavorite: updatedMeal.isFavorite,
        imageUrl: updatedMeal.imageUrl,
      });
      
      // Close the edit screen
      setShowMealEdit(false);
      
      // Show success popup
      showToast('Meal Successfully Updated', 'success');
    } catch (error) {
      console.error("Error saving meal:", error);
      hideToast();
      Alert.alert("Error", "Failed to save changes to meal");
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      // Show deleting feedback
      showToast("Deleting meal...", 'loading');
      
      // Delete using context
      await deleteItem(mealId);
      
      // Close the edit screen
      setShowMealEdit(false);
      
      // Show success message
      showToast('Meal Deleted', 'success');
    } catch (error) {
      console.error("Error deleting meal:", error);
      hideToast();
      Alert.alert("Error", "Failed to delete meal");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
          {/* Swipeable Toast */}
          <SimpleToast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onDismiss={hideToast}
            duration={3000}
          />
          
          {/* Single item logging indicator */}
          {isLoggingSingleItem && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#45A557" />
                <Text style={styles.loadingText}>Logging meal...</Text>
              </View>
            </View>
          )}
          
        {/* Using the new SharedHeader component */}
        <Header
          title="Saved Foods"
          onBack={() => router.back()}
          rightIcon={
            cartItems.length > 0 ? (
              <View style={styles.cartIconContainer}>
                <MaterialCommunityIcons name="cart" size={24} color="#FFFFFF" />
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{itemCount}</Text>
                </View>
              </View>
            ) : (
              <MaterialCommunityIcons name="cart-outline" size={24} color="#FFFFFF" />
            )
          }
          rightIconAction={handleContinuePress}
        />

        {/* Main Content Area */}
        {renderListHeader()}
        
        <View style={styles.listsWrapper}>
          {/* Recent Items */}
          <View 
            style={[
              styles.listContainer, 
              { display: activeFilter === 'Recent' ? 'flex' : 'none' }
            ]}
          >
            <FlatList
              ref={recentListRef}
              data={activeFilter === 'Recent' ? displayedItems : []}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={activeFilter === 'Recent' ? ListEmptyComponent : null}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={10}
              getItemLayout={(data, index) => ({ length: 112, offset: 112 * index, index })}
              style={[styles.scrollView, activeFilter === 'Recent' ? {} : { display: 'none' }]}
            />
          </View>

          {/* Created Items */}
          <View 
            style={[
              styles.listContainer, 
              { display: activeFilter === 'Created' ? 'flex' : 'none' }
            ]}
          >
            <FlatList
              ref={createdListRef}
              data={activeFilter === 'Created' ? displayedItems : []}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={activeFilter === 'Created' ? ListEmptyComponent : null}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={10}
              getItemLayout={(data, index) => ({ length: 112, offset: 112 * index, index })}
              style={[styles.scrollView, activeFilter === 'Created' ? {} : { display: 'none' }]}
            />
          </View>

          {/* Favorites Items */}
          <View 
            style={[
              styles.listContainer, 
              { display: activeFilter === 'Favorites' ? 'flex' : 'none' }
            ]}
          >
            <FlatList
              ref={favoritesListRef}
              data={activeFilter === 'Favorites' ? displayedItems : []}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={activeFilter === 'Favorites' ? ListEmptyComponent : null}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={10}
              getItemLayout={(data, index) => ({ length: 112, offset: 112 * index, index })}
              style={[styles.scrollView, activeFilter === 'Favorites' ? {} : { display: 'none' }]}
            />
          </View>
        </View>

        {/* scroll-to-top button overlay */}
        <Animated.View
          style={[
            styles.scrollToTopButton,
            { 
              opacity: scrollButtonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
              transform: [{ 
                translateY: scrollButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                }) 
              }] 
            }
          ]}
        >
          <TouchableOpacity onPress={scrollToTop} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-up" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={handleContinuePress} 
            // Use itemCount from context for disabled state
            style={[styles.continueButton, itemCount === 0 && styles.disabledButton]} 
            disabled={itemCount === 0} // Use itemCount from context
          >
              {/* Use itemCount from context for button text */}
              <Text style={[styles.buttonText, itemCount === 0 && styles.disabledButtonText]}> 
                {itemCount > 0 ? "Continue" : "Add Items"} {/* Updated text */}
              </Text>
          </TouchableOpacity>
        </View>

        {/* Quantity Modal */}
        {renderQuantityModal()}

        {/* Add the FoodEditScreen component */}
        {selectedFoodToEdit && (
          <FoodEditScreen
            food={selectedFoodToEdit}
            onClose={() => setShowFoodEdit(false)}
            onSave={handleSaveFood}
            onDelete={handleDeleteFood}
            visible={showFoodEdit}
          />
        )}

        {/* Add the SavedMealsEditScreen component */}
        {selectedMealToEdit && (
          <SavedMealsEditScreen
            meal={selectedMealToEdit}
            onClose={() => setShowMealEdit(false)}
            onSave={handleSaveMeal}
            onDelete={handleDeleteMeal}
            visible={showMealEdit}
          />
        )}

        {/* Delete Confirmation Modal */}
        {renderDeleteConfirmModal()}
      </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  mealBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "#45A557",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  mealBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  stickySearchContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    height: 40,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    color: "#A0A0A0",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  addFoodButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  addFoodButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
    height: 36,
    marginBottom: 8,
    position: "relative",
  },
  filterIndicator: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    zIndex: 0,
  },
  filterButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  filterText: {
    color: "#A0A0A0",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  listContainer: {
    flex: 1,
    marginTop: 15,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  macroWrapper: {
    justifyContent: "center",
  },
  macrosContainer: {
    flexDirection: "row",
    width: "100%",
    marginVertical: 2,
    position: "relative",
    height: 18,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 0,
  },
  centerMacro: {
    left: "43%",
  },
  rightMacro: {
    left: "75%",
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  macroText: {
    fontSize: 12,
    color: "#A0A0A0",
  },
  macroValue: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  macroLabel: {
    color: "#A0A0A0",
    fontSize: 12,
  },
  unitText: {
    color: "#FFFFFF",
  },
  macroSeparator: {
    height: 1,
    backgroundColor: "#2E2E2E",
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  itemCaloriesValue: {
    color: "#45A557",
    fontSize: 15,
    fontWeight: "bold",
  },
  perUnitText: {
    color: "#A0A0A0",
    fontSize: 11,
  },
  addButton: {
    backgroundColor: "#45A557",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#2E2E2E",
    backgroundColor: "#000000",
  },
  continueButton: {
    backgroundColor: "#45A557",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#2E2E2E",
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButtonText: {
    color: "#A0A0A0",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 5,
  },
  foodTitleInModal: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  modalSubtitle: {
    color: "#A0A0A0",
    fontSize: 14,
    marginBottom: 20,
  },
  quantityInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  quantityInput: {
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
    flex: 0.4,
    marginRight: 10,
  },
  unitSelector: {
    flexDirection: "row",
    flex: 0.6,
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    overflow: "hidden",
  },
  unitOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  selectedUnit: {
    backgroundColor: "#3A3A3C",
  },
  selectedUnitText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  addToMealButton: {
    backgroundColor: "#45A557",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  addToMealButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dynamicMacrosContainer: {
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  calorieRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
    marginBottom: 15,
  },
  dynamicCalorieValue: {
    color: "#45A557",
    fontSize: 24,
    fontWeight: "700",
    marginRight: 6,
  },
  dynamicCalorieLabel: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  dynamicMacrosRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  dynamicMacroItem: {
    alignItems: "center",
    flex: 1,
  },
  dynamicMacroValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  dynamicMacroLabel: {
    color: "#A0A0A0",
    fontSize: 12,
  },
  proteinColor: { color: "#EF476F" },
  carbsColor: { color: "#06D6A0" },
  fatColor: { color: "#FFD166" },
  sodiumColor: { color: "#FF9500" },
  sugarColor: { color: "#D4C19C" },
  fiberColor: { color: "#5AC8FA" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#1C1C1E",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    minWidth: width * 0.7,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loadingText: {
    color: "#EDEDED",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    color: "#EDEDED",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  addEmptyButton: {
    backgroundColor: "#45A557",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  addEmptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  confirmModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    zIndex: 150,
  },
  confirmModalContainer: {
    backgroundColor: "#1C1C1E",
    padding: 20,
    borderRadius: 12,
    width: width * 0.8,
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  confirmModalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  confirmModalMessage: {
    color: "#EDEDED",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  confirmModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  confirmModalCancelButton: {
    backgroundColor: "#2E2E2E",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  confirmModalCancelText: {
    color: "#EDEDED",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmModalDeleteButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  confirmModalDeleteText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  leftAction: {
    width: width * 0.2,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 12,
  },
  rightAction: {
    width: width * 0.2,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 12,
  },
  favoriteAction: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  deleteAction: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  actionTextFavorite: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 3,
  },
  actionTextDelete: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  favoriteIcon: {
    marginLeft: 3,
    alignSelf: "center",
    marginTop: -5,
  },
  moreOptionsButton: {
    marginLeft: 'auto',
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#3E92CC",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  itemWrapper: {
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 90,           // Higher position above footer
    left: 25,             // Now on left side instead of right
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 100,
  },
  listsWrapper: {
    flex: 1,
  },
  cartIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
})

export default SavedFoodsScreen