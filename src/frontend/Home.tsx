import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, FlatList, View, Text, Dimensions } from 'react-native';
import Footer, { FooterRef } from './components/Footer';

const { width: screenWidth } = Dimensions.get('window');

// Sample page data - replace with your actual screens
const PAGES = [
  { id: 'shop', title: 'Shop', color: '#e74c3c' },
  { id: 'cards', title: 'Cards', color: '#3498db' },
  { id: 'battle', title: 'Battle', color: '#f39c12' },
  { id: 'clan', title: 'Clan', color: '#2ecc71' },
  { id: 'events', title: 'Events', color: '#9b59b6' },
];

export default function Home() {
  const [currentPage, setCurrentPage] = useState(2); // Start at Battle (middle)
  const flatListRef = useRef<FlatList>(null);
  const footerRef = useRef<FooterRef>(null);

  // Handle manual scroll from user
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(scrollPosition / screenWidth);
    
    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
      // Sync footer without triggering scroll
      footerRef.current?.setSelectedIndex(pageIndex);
    }
  };

  // Handle tab press from footer
  const handleTabPress = (index: number) => {
    setCurrentPage(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  // Render each page
  const renderPage = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.page, { backgroundColor: item.color }]}>
      <Text style={styles.pageTitle}>{item.title}</Text>
      <Text style={styles.pageSubtitle}>Page {index + 1}</Text>
      
      {/* Add your actual page content here */}
      {item.id === 'battle' && (
        <View style={styles.battleContent}>
          <Text style={styles.battleText}>⚔️ Ready for Battle! ⚔️</Text>
        </View>
      )}
      
      {item.id === 'shop' && (
        <View style={styles.shopContent}>
          <Text style={styles.shopText}>🛒 Welcome to Shop</Text>
        </View>
      )}
      
      {item.id === 'cards' && (
        <View style={styles.cardsContent}>
          <Text style={styles.cardsText}>🃏 Your Card Collection</Text>
        </View>
      )}
      
      {item.id === 'clan' && (
        <View style={styles.clanContent}>
          <Text style={styles.clanText}>👥 Clan Management</Text>
        </View>
      )}
      
      {item.id === 'events' && (
        <View style={styles.eventsContent}>
          <Text style={styles.eventsText}>🎉 Special Events</Text>
        </View>
      )}
    </View>
  );

  return (
    <ImageBackground
      source={require('../../assets/Background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        initialScrollIndex={2} // Start at Battle
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          console.warn('Scroll to index failed:', info);
        }}
      />
      
      <Footer ref={footerRef} onTabPress={handleTabPress} />
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  page: {
    width: screenWidth,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120, // Space for footer
  },
  pageTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  pageSubtitle: {
    color: '#fff',
    fontSize: 18,
    opacity: 0.8,
    marginBottom: 32,
  },
  
  // Page-specific content styles
  battleContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  battleText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  
  shopContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 16,
  },
  shopText: {
    color: '#fff',
    fontSize: 18,
  },
  
  cardsContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 16,
  },
  cardsText: {
    color: '#fff',
    fontSize: 18,
  },
  
  clanContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 16,
  },
  clanText: {
    color: '#fff',
    fontSize: 18,
  },
  
  eventsContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 16,
  },
  eventsText: {
    color: '#fff',
    fontSize: 18,
  },
});
