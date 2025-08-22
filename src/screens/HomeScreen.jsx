// src/screens/HomeScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TextInput,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../compoenents/Header';
import JournalCard from '../compoenents/JournalCard';
import { useJournalStore } from '../store/Store';

const { width, height } = Dimensions.get('window');

// Enhanced Color Palette
const colors = {
  primary: '#2D5016', // Deep forest green
  secondary: '#4A7C59', // Medium forest green
  accent: '#6B9080', // Sage green
  background: '#A4C3A2', // Light sage
  cardBackground: '#E8F5E8', // Very light mint
  searchBackground: '#D4E7D4', // Light mint
  textPrimary: '#1B3409', // Very dark green
  textSecondary: '#4A5D4A', // Medium dark green
  textMuted: '#6B7B6B', // Muted green-gray
  tagBackground: '#F0F8F0', // Almost white with green tint
  shadow: '#2D5016', // Deep green shadow
  overlay: 'rgba(0, 0, 0, 0.4)', // Deep green overlay
};

export default function HomeScreen(props) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { 
    journals, 
    isLoading, 
    error, 
    searchJournals, 
    refreshJournals,
    clearError 
  } = useJournalStore();
  console.log('Journals from home screen:', journals);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (search.trim()) {
        setIsSearching(true);
        try {
          const results = await searchJournals(search);
          setSearchResults(results);
        } catch (error) {
          Alert.alert('Search Error', 'Failed to search journals');
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        {
          text: 'OK',
          onPress: () => clearError(),
        },
        {
          text: 'Retry',
          onPress: () => {
            clearError();
            refreshJournals();
          },
        },
      ]);
    }
  }, [error]);

  // Determine which journals to display
  const displayJournals = search.trim() ? searchResults : journals;
  const showLoader = isLoading || isSearching;

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name="book-open-page-variant" 
        size={80} 
        color={colors.accent} 
      />
      <Text style={styles.emptyTitle}>No Journal Entries Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start capturing your adventures by adding your first journal entry!
      </Text>
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name="magnify" 
        size={80} 
        color={colors.accent} 
      />
      <Text style={styles.emptyTitle}>No Results Found</Text>
      <Text style={styles.emptySubtitle}>
        Try searching with different keywords
      </Text>
    </View>
  );

  const renderLoader = () => (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.loaderText}>
        {isSearching ? 'Searching...' : 'Loading journals...'}
      </Text>
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/BG.jpg')}
      style={styles.background}
    >
      <View style={styles.overlay}>
        {/* Logo & Title */}
        <Header />

        {/* Search bar */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={colors.textSecondary}
          />
          <TextInput
            placeholder="Search your adventures..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color={colors.textMuted}
              onPress={() => setSearch('')}
            />
          )}
          {isSearching && (
            <ActivityIndicator 
              size="small" 
              color={colors.textSecondary} 
              style={{ marginLeft: 8 }}
            />
          )}
        </View>

        {/* Results count */}
        {!showLoader && displayJournals.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {search.trim() 
                ? `${displayJournals.length} result${displayJournals.length !== 1 ? 's' : ''} for "${search}"`
                : `${journals.length} journal entr${journals.length !== 1 ? 'ies' : 'y'}`
              }
            </Text>
          </View>
        )}

        {/* Render Journals or Loading State */}
        {showLoader ? (
          renderLoader()
        ) : (
          <FlatList
            data={displayJournals}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <JournalCard item={item} nav={props} />
            )}
            ListEmptyComponent={
              journals.length === 0 
                ? renderEmptyState 
                : (search.trim() ? renderNoResults : null)
            }
            onRefresh={refreshJournals}
            refreshing={isLoading && !isSearching}
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: height,
    width: width,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 16,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    marginLeft: 12,
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  resultsHeader: {
    marginBottom: 8,
  },
  resultsText: {
    color: colors.searchBackground,
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.searchBackground,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.searchBackground,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    paddingHorizontal: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loaderText: {
    fontSize: 16,
    color: colors.searchBackground,
    marginTop: 16,
    fontWeight: '500',
  },
});