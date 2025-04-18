import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const colors = {
  background: '#000000',    
  text: '#FFFFFF',             
  secondary: '#A0A0A0',        
  subtleText: '#FFFFFF',       
  handleBar: '#8E8E8E',        
  cardBackground: '#1C1C1E',   
  cardBorder: '#2E2E2E',
  backgroundShape: '#0A0A0A',
  backgroundOpacity: 0.8, 
  protein: '#EF476F',          
  carbs: '#06D6A0',            
  fat: '#FFD166',             
};

export const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 60,
  },
  imgBackground:{
    backgroundColor: colors.backgroundShape,
  },
  container: {
    flex: 1,
    paddingTop: height * 0.1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
  },
  topLeft: {
    position: 'absolute',
    top: height * 0.09,
    left: width * 0.07,
    zIndex: 1,
    flexDirection: 'column', 
    justifyContent: 'flex-start',
    gap: width * 0.01,
  },
  name: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Geist Sans',
  },
  heartsContainer: {
    flexDirection: 'row',
    left: width * 0.005,
    marginTop: 2,
  },
  heartIcon: {
    marginRight: width * 0.007,
  },
  storeContainer: {
    position: 'absolute',
    bottom: height * 0.32,
    left: width * 0.09,
    alignItems: 'center',
    zIndex: 1,
    padding: width * 0.02,
    borderRadius: width * 0.05,
  },
  flameContainer: {
    position: 'absolute',
    bottom: height * 0.32,
    right: width * 0.09,
    alignItems: 'center',
    zIndex: 1,
    padding: width * 0.02,
    borderRadius: width * 0.05,
  },
  iconText: {
    color: colors.secondary,
    fontSize: Math.min(width, height) * 0.03,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginTop: 8,
  },
  settingsButton: {
    position: 'absolute',
    top: height * 0.09,
    right: width * 0.05,
    padding: width * 0.02,
    zIndex: 1,
    borderRadius: width * 0.04,
  },
  firebaseButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  firebaseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  centerImage: {
    width: width * 0.5,
    height: width * 0.5,
    alignSelf: 'center',
    marginTop: height * 0.18,
    zIndex: 1,
  },
  errorText: {
    color: '#FF3B30',
    alignSelf: 'center',
    marginTop: height * 0.3,
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSheetWrapper: {
    position: 'absolute',
    left: (width - 370) / 2,
    bottom: height * 0.117 - 110,
    width: 370,
    height: height * 0.6,
    zIndex: 5,
    overflow: 'hidden',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  bottomSheetScrollView: {
    height: height * 0.8,
    maxHeight: height * 0.8,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  bottomSheetContent: {
    paddingBottom: 50,
    minHeight: height * 1.2,
  },
  bottomSheetTopShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: 15,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  bottomSheetHandle: {
    width: '100%',
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 60,
    height: 5,
    backgroundColor: colors.handleBar,
    borderRadius: 3,
    marginTop: 8,
  },
  peekContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    height: 160,
  },
  topContainer: {
    width: '100%',
    height: 175,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    marginBottom: 10,
    zIndex: 999,
  },
  bottomContainer: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: 15,
    paddingVertical: 20,
    zIndex: 999,
    minHeight: height * 0.5,
  },
  expandedContent: {
    padding: 20,
  },
  expandedTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
  expandedText: {
    color: colors.subtleText,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  calorieSection: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: -35,
    marginBottom: 15,
    zIndex: 1,
  },
  calorieTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  calorieSubtitle: {
    color: colors.text,
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
    marginTop: -3,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginTop: 5,
  },
  macroColumn: {
    alignItems: 'center',
    width: '30%',
  },
  macroBarContainer: {
    height: 6,
    backgroundColor: 'rgba(217, 217, 217, 0.33)',
    borderRadius: 3,
    marginBottom: 2,
    marginTop: 3,
    width: 45,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 3,
  },
  proteinBar: {
    backgroundColor: colors.protein,
    opacity: 0.9,
  },
  carbsBar: {
    backgroundColor: colors.carbs,
    opacity: 0.9,
  },
  fatBar: {
    backgroundColor: colors.fat,
    opacity: 0.9,
  },
  macroLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  macroValue: {
    color: colors.secondary,
    fontSize: 12,
    marginTop: 1,
  },
  backgroundShape1: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    top: height * 0.02,
    left: -width * 0.3,
    zIndex: 0,
    transform: [{ rotate: '35deg' }],
  },
  backgroundShape2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 30,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    top: height * 0.25,
    right: -width * 0.25,
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  backgroundShape3: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    transform: [{ rotate: '45deg' }],
    top: height * 0.65,
    left: width * 0.15,
    zIndex: 0,
  },
  backgroundShape5: {
    position: 'absolute',
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.07,
    backgroundColor: colors.backgroundShape,
    opacity: colors.backgroundOpacity,
    top: height * 0.45,
    left: width * 0.05,
    zIndex: 0,
    transform: [{ rotate: '-25deg' }],
  },
  backgroundDots: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    zIndex: 0,
    opacity: 0.05,
  },
  mealsContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    marginLeft: -15
  },
  dateContainer: {
    marginBottom: 15,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(120, 120, 120, 0.2)",
    marginHorizontal: -6,
    marginLeft: -8,
    marginBottom: -9,
  },
  loadPreviousDayButton: {
    backgroundColor: colors.cardBackground, // Or a different subtle color
    borderColor: colors.cardBorder, // Match card border
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // Space above the button
    marginBottom: 10, // Space below the button
    marginHorizontal: 5, // Align with card margins slightly
    width: '100%', // Make it almost full width
    alignSelf: 'center',
  },
  loadPreviousDayButtonText: {
    color: colors.text, // White or light grey text
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Geist Sans', // Use your app's font
  },
  noMealsText: {
      color: colors.secondary, // Use a subtle grey color
      fontSize: 14,
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 10,
      paddingHorizontal: 20, // Add padding if needed
      fontFamily: 'Geist Sans',
  },
  mealEditOverlay: {
    position: 'absolute',
    top: 50,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',   // Center content horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
    zIndex: 100, // Ensure it's above everything else (MealViewer wrapper has zIndex 5)
  },
  footer: {
    position: 'absolute',
    bottom: -height * 0.016, // Slight adjustment to match Union SVG design
    width: '100%',
    height: height * 0.115,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  
  footerButton: {
    backgroundColor: "#45A557", // Green button
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  
  footerAddButton: {
    backgroundColor: "#45A557", // Green button
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.15 / 2, // Make it perfectly circular
    alignItems: "center",
    justifyContent: "center",
    elevation: 8, // Add shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  
  footerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

// maak het achtergronden alles wit en de text licht grijs, achtergrond achter de achtrgronden maken we dan donkerlichteg grijs
// met serieuze text zwart