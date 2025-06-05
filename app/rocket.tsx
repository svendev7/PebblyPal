import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Rocket() {
  const router = useRouter();
  
  return (
    <View style={styles.placeholderScreen}>
      <Text style={styles.placeholderText}>Unity View Coming Soon</Text>
      <View style={styles.buttonContainer}>
        <Text 
          style={styles.buttonText} 
          onPress={() => router.push('/')}
        >
          Back to Home
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholderScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
}); 