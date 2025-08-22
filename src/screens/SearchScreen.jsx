// src/screens/SearchScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ImageBackground,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../compoenents/Header';
import JournalCard from '../compoenents/JournalCard';
import { useJournalStore } from '../store/Store';

const { width, height } = Dimensions.get('window');

// Same color palette as the previous screen
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
  white: '#FFFFFF',
  selectedTag: '#6B9080',
  unselectedTag: '#D4E7D4',
};

const SAMPLE_TAGS = ['mountain', 'beach', 'city', 'nature', 'sunset', 'adventure', 'food', 'culture'];

export default function SearchScreen(props) {
  const [keyword, setKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  
  const { searchJournals, journals } = useJournalStore();

  // Auto-generate tags from existing journals
  const [availableTags, setAvailableTags] = useState(SAMPLE_TAGS);

  useEffect(() => {
    generateAvailableTags();
  }, [journals]);

  // Generate tags from existing journal entries
  const generateAvailableTags = () => {
    const tagSet = new Set(SAMPLE_TAGS);
    
    journals.forEach(journal => {
      const text = `${journal.title || ''} ${journal.description || ''}`.toLowerCase();
      
      // Extract hashtags if any
      const hashtags = text.match(/#\w+/g);
      if (hashtags) {
        hashtags.forEach(tag => tagSet.add(tag.replace('#', '')));
      }
      
      // Extract location-based tags
      if (journal.locationName) {
        const location = journal.locationName.toLowerCase();
        const words = location.split(/[\s,]+/);
        words.forEach(word => {
          if (word.length > 3 && !['the', 'and', 'of', 'in', 'at', 'to', 'for'].includes(word)) {
            tagSet.add(word);
          }
        });
      }
    });
    
    setAvailableTags(Array.from(tagSet).slice(0, 20)); // Limit to 20 tags
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setKeyword('');
    setSelectedTags([]);
    setStartDate('');
    setEndDate('');
    setLocationFilter('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const validateDateFormat = (dateString) => {
    if (!dateString) return true;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  const performSearch = async () => {
    // Validate date formats
    if (!validateDateFormat(startDate)) {
      Alert.alert('Invalid Date', 'Please enter start date in YYYY-MM-DD format');
      return;
    }
    if (!validateDateFormat(endDate)) {
      Alert.alert('Invalid Date', 'Please enter end date in YYYY-MM-DD format');
      return;
    }

    // Check if end date is after start date
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      Alert.alert('Invalid Date Range', 'End date must be after start date');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      let results = journals;

      // Apply keyword search
      if (keyword.trim()) {
        results = await searchJournals(keyword.trim());
      }

      // Apply tag filters
      if (selectedTags.length > 0) {
        results = results.filter(journal => {
          const text = `${journal.title || ''} ${journal.description || ''}`.toLowerCase();
          return selectedTags.some(tag => text.includes(tag.toLowerCase()));
        });
      }

      // Apply location filter
      if (locationFilter.trim()) {
        const locationKeyword = locationFilter.toLowerCase();
        results = results.filter(journal => {
          const location = (journal.locationName || '').toLowerCase();
          return location.includes(locationKeyword);
        });
      }

      // Apply date range filter
      if (startDate || endDate) {
        results = results.filter(journal => {
          if (!journal.dateTime) return false;
          
          // Extract date from dateTime string (assuming format like "MM/DD/YYYY HH:mm:ss AM/PM")
          const journalDateMatch = journal.dateTime.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (!journalDateMatch) return false;
          
          const journalDate = new Date(
            parseInt(journalDateMatch[3]), // year
            parseInt(journalDateMatch[1]) - 1, // month (0-indexed)
            parseInt(journalDateMatch[2]) // day
          );

          if (startDate) {
            const startDateObj = new Date(startDate);
            if (journalDate < startDateObj) return false;
          }

          if (endDate) {
            const endDateObj = new Date(endDate);
            if (journalDate > endDateObj) return false;
          }

          return true;
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to perform search. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderEmptyResults = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name="magnify-close" 
        size={80} 
        color={colors.accent} 
      />
      <Text style={styles.emptyTitle}>No Results Found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search criteria or clear filters to see more results
      </Text>
    </View>
  );

  const renderSearchResults = () => (
    <View style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          Search Results ({searchResults.length})
        </Text>
        <Pressable 
          onPress={() => setShowFilters(!showFilters)}
          style={styles.toggleFiltersButton}
        >
          <MaterialCommunityIcons 
            name={showFilters ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.white} 
          />
          <Text style={styles.toggleFiltersText}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={searchResults}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultsList}
        renderItem={({ item }) => (
          <JournalCard item={item} nav={props} />
        )}
        ListEmptyComponent={renderEmptyResults}
      />
    </View>
  );

  return (
    <ImageBackground 
      source={require('../assets/BG.jpg')}
      style={styles.background}
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search & Filter</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={clearFilters} style={styles.clearButton}>
              <MaterialCommunityIcons name="broom" size={16} color={colors.white} />
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Show filters section */}
          {(showFilters || !hasSearched) && (
            <View style={styles.filtersContainer}>
              {/* Search Bar */}
              <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                  <MaterialCommunityIcons 
                    name="magnify" 
                    size={22} 
                    color={colors.textSecondary} 
                  />
                  <TextInput
                    placeholder="Search keywords..."
                    placeholderTextColor={colors.textMuted}
                    style={styles.searchInput}
                    value={keyword}
                    onChangeText={setKeyword}
                  />
                  {keyword.length > 0 && (
                    <Pressable onPress={() => setKeyword('')}>
                      <MaterialCommunityIcons 
                        name="close-circle" 
                        size={20} 
                        color={colors.textMuted} 
                      />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Tags Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Filter by Tags</Text>
                <View style={styles.tagsContainer}>
                  {availableTags.map(tag => (
                    <Pressable
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      style={[
                        styles.tagButton,
                        selectedTags.includes(tag) && styles.selectedTagButton
                      ]}
                    >
                      <Text style={[
                        styles.tagText,
                        selectedTags.includes(tag) && styles.selectedTagText
                      ]}>
                        {tag}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Location Filter */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Filter by Location</Text>
                <View style={styles.locationContainer}>
                  <TextInput
                    placeholder="Enter location keyword..."
                    placeholderTextColor={colors.textMuted}
                    style={styles.locationInput}
                    value={locationFilter}
                    onChangeText={setLocationFilter}
                  />
                  <MaterialCommunityIcons 
                    name="map-marker-radius" 
                    size={24} 
                    color={colors.accent} 
                    style={styles.locationIcon}
                  />
                </View>
              </View>

              {/* Date Range Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Filter by Date Range</Text>
                <View style={styles.dateRangeContainer}>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>From</Text>
                    <TextInput
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textMuted}
                      style={styles.dateInput}
                      value={startDate}
                      onChangeText={setStartDate}
                    />
                  </View>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>To</Text>
                    <TextInput
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textMuted}
                      style={styles.dateInput}
                      value={endDate}
                      onChangeText={setEndDate}
                    />
                  </View>
                </View>
                <Text style={styles.dateHint}>
                  Use YYYY-MM-DD format (e.g., 2024-01-15)
                </Text>
              </View>

              {/* Apply Filter Button */}
              <Pressable 
                style={[styles.applyButton, isSearching && styles.applyButtonDisabled]}
                onPress={performSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <ActivityIndicator size="small" color={colors.white} style={{ marginRight: 8 }} />
                ) : (
                  <MaterialCommunityIcons 
                    name="filter-check" 
                    size={20} 
                    color={colors.white} 
                  />
                )}
                <Text style={styles.applyButtonText}>
                  {isSearching ? 'Searching...' : 'Apply Filters'}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Search Results */}
          {hasSearched && renderSearchResults()}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 4,
  },
  clearText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  filtersContainer: {
    marginBottom: 24,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    marginLeft: 12,
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    backgroundColor: colors.unselectedTag,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  selectedTagButton: {
    backgroundColor: colors.selectedTag,
    borderColor: colors.secondary,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectedTagText: {
    color: colors.white,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  locationInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  locationIcon: {
    marginLeft: 12,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateHint: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 16,
    gap: 8,
  },
  applyButtonDisabled: {
    opacity: 0.7,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  toggleFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 4,
  },
  toggleFiltersText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  resultsList: {
    paddingBottom: 20,
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
    color: colors.white,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    paddingHorizontal: 40,
  },
});