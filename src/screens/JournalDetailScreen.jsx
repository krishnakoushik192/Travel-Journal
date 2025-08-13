import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ImageBackground,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useJournalStore } from '../store/Store';


// Same color palette as previous screens
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
  danger: '#C53030',
  favorite: '#E53E3E',
};

export default function JournalDetails({ route, navigation }) {
 const {removeJournal} = useJournalStore();
  // Get journal data from navigation params or use sample data
  const journal = route?.params?.journal 
  console.log(journal);

  const handleEdit = () => {
    navigation?.navigate('EditJournal', { journal });
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Journal Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            removeJournal(id);
            navigation?.goBack();
          }
        }
      ]
    );
  };

  return (
    <ImageBackground 
      source={require('../assets/BG.jpg')} // Add your background image here
      style={styles.background}
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={24} 
              color={colors.white} 
            />
          </Pressable>
          <Text style={styles.headerTitle}>Journal Detail</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Card */}
          <View style={styles.mainCard}>
            {/* Image */}
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: journal.productImage[0].url }} 
                style={styles.journalImage}
                resizeMode="cover"
              />
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Title */}
              <Text style={styles.title}>{journal.title}</Text>

              {/* Date & Time */}
              <Text style={styles.dateTime}>{journal.dateTime}</Text>

              {/* Location */}
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons 
                  name="map-marker" 
                  size={16} 
                  color={colors.textMuted} 
                />
                <Text style={styles.location} numberOfLines={3}>{journal.locationName}</Text>
              </View>

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.description}>{journal.description}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Pressable style={styles.editButton} onPress={handleEdit}>
              <MaterialCommunityIcons 
                name="pencil" 
                size={20} 
                color={colors.white} 
              />
              <Text style={styles.editButtonText}>Edit Entry</Text>
            </Pressable>

            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <MaterialCommunityIcons 
                name="delete-outline" 
                size={20} 
                color={colors.danger} 
              />
              <Text style={styles.deleteButtonText}>Delete Entry</Text>
            </Pressable>
          </View>
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
    // justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
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
    marginHorizontal:'auto'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  mainCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: colors.searchBackground,
  },
  journalImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dateTime: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 4,
    paddingHorizontal: 8,
  },
  location: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    fontWeight: '400',
  },
  actionsContainer: {
    gap: 12,
  },
  editButton: {
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
    gap: 8,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deleteButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
    gap: 8,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});