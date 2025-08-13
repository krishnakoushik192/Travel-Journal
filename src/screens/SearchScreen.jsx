import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../compoenents/Header';

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
  overlay: 'rgba(45, 80, 22, 0.4)', // Deep green overlay
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
  const [locationRadius, setLocationRadius] = useState('');

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
    setLocationRadius('');
  };

  return (
    <ImageBackground 
      source={require('../assets/BG.jpg')} // You can add your background image here
      style={styles.background}
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search & Filter</Text>
          <Pressable onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
            </View>
          </View>

          {/* Keyword Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Keyword</Text>
            <View style={styles.keywordContainer}>
              <Text style={styles.keywordDisplay}>
                {keyword || 'Enter search keyword above'}
              </Text>
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {SAMPLE_TAGS.map(tag => (
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

          {/* Date Range Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date Range</Text>
            <View style={styles.dateRangeContainer}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Start</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  style={styles.dateInput}
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>End</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  style={styles.dateInput}
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>
          </View>

          {/* Location Radius Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Radius</Text>
            <View style={styles.locationContainer}>
              <TextInput
                placeholder="Enter radius in km"
                placeholderTextColor={colors.textMuted}
                style={styles.locationInput}
                value={locationRadius}
                onChangeText={setLocationRadius}
                keyboardType="numeric"
              />
              <MaterialCommunityIcons 
                name="map-marker-radius" 
                size={24} 
                color={colors.accent} 
                style={styles.locationIcon}
              />
            </View>
          </View>

          {/* Apply Filter Button */}
          <Pressable style={styles.applyButton}>
            <MaterialCommunityIcons 
              name="filter-check" 
              size={20} 
              color={colors.white} 
            />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </Pressable>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background, // Fallback color when no image
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
    paddingTop: 50, // Account for status bar
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  keywordContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  keywordDisplay: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'normal',
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
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
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
  applyButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});