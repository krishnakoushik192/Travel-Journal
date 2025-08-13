import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TextInput,
  Pressable,
  ImageBackground,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../compoenents/Header';
import JournalCard from '../compoenents/JournalCard';

const { width, height } = Dimensions.get('window');

const SAMPLE_ENTRIES = [
  {
    id: '1',
    title: 'Sunrise at Green Hill',
    date: '2025-08-10',
    location: 'Hilltop, KY',
    tags: ['mountain', 'sunrise'],
    image: require('../assets/BG.jpg'),
  },
  {
    id: '2',
    title: 'Lazy Beach Afternoon',
    date: '2025-07-21',
    location: 'Seaside, CA',
    tags: ['beach', 'relax'],
    image: require('../assets/logo.png'),
  },
];

const CARD_WIDTH = (width - 20 * 2 - 12) / 2;

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
  overlay: 'rgba(45, 80, 22, 0.4)', // Deep green overlay
};

export default function HomeScreen(props) {
  const [search, setSearch] = useState('');

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
        </View>

        {/* Render Journals */}
        <FlatList
          data={SAMPLE_ENTRIES}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <JournalCard item={item} nav={props} />
          )}
        />
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
});