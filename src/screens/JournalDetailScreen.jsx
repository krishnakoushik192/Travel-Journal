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
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useJournalStore } from '../store/Store';

const { width, height } = Dimensions.get('window');

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
  modalBackground: 'rgba(0, 0, 0, 0.9)',
};

export default function JournalDetails({ route, navigation }) {
  const { removeJournal } = useJournalStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Get journal data from navigation params
  const journal = route?.params?.journal;
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

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const navigateToNextImage = () => {
    if (journal.productImage && selectedImageIndex < journal.productImage.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const navigateToPrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const renderImageGallery = () => {
    if (!journal.productImage || journal.productImage.length === 0) {
      return (
        <View style={styles.noImageContainer}>
          <MaterialCommunityIcons name="camera-off" size={40} color={colors.textMuted} />
          <Text style={styles.noImageText}>No images available</Text>
        </View>
      );
    }

    if (journal.productImage.length === 1) {
      // Single image - show full width
      return (
        <View style={styles.singleImageContainer}>
          <Pressable onPress={() => openImageModal(0)}>
            <Image 
              source={{ uri: journal.productImage[0].url }} 
              style={styles.singleImage}
              resizeMode="cover"
            />
            <View style={styles.expandIcon}>
              <MaterialCommunityIcons 
                name="magnify-plus-outline" 
                size={24} 
                color={colors.white} 
              />
            </View>
          </Pressable>
        </View>
      );
    }

    // Multiple images - show gallery layout
    return (
      <View style={styles.galleryContainer}>
        {/* Main featured image */}
        <Pressable 
          style={styles.featuredImageContainer}
          onPress={() => openImageModal(0)}
        >
          <Image 
            source={{ uri: journal.productImage[0].url }} 
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.expandIcon}>
            <MaterialCommunityIcons 
              name="magnify-plus-outline" 
              size={24} 
              color={colors.white} 
            />
          </View>
          <View style={styles.imageCounter}>
            <MaterialCommunityIcons 
              name="image-multiple" 
              size={16} 
              color={colors.white} 
            />
            <Text style={styles.imageCountText}>
              {journal.productImage.length}
            </Text>
          </View>
        </Pressable>

        {/* Thumbnail strip */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailStrip}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {journal.productImage.map((image, index) => (
            <Pressable 
              key={index}
              style={[
                styles.thumbnailWrapper,
                index === 0 && styles.activeThumbnail
              ]}
              onPress={() => openImageModal(index)}
            >
              <Image 
                source={{ uri: image.url }} 
                style={styles.thumbnail}
                resizeMode="cover"
              />
              {index === 0 && (
                <View style={styles.activeThumbnailOverlay}>
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={16} 
                    color={colors.primary} 
                  />
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderImageModal = () => (
    <Modal
      visible={showImageModal}
      transparent
      animationType="fade"
      onRequestClose={closeImageModal}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Pressable onPress={closeImageModal} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={28} color={colors.white} />
          </Pressable>
          <Text style={styles.modalTitle}>
            {selectedImageIndex + 1} of {journal.productImage?.length || 0}
          </Text>
          <View style={styles.modalHeaderSpacer} />
        </View>

        {/* Image viewer */}
        <View style={styles.imageViewerContainer}>
          {journal.productImage && journal.productImage[selectedImageIndex] && (
            <View style={styles.fullScreenImageContainer}>
              <Image 
                source={{ uri: journal.productImage[selectedImageIndex].url }} 
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        {/* Navigation arrows for multiple images */}
        {journal.productImage && journal.productImage.length > 1 && (
          <>
            {selectedImageIndex > 0 && (
              <Pressable 
                style={[styles.navArrow, styles.leftArrow]}
                onPress={navigateToPrevImage}
              >
                <MaterialCommunityIcons 
                  name="chevron-left" 
                  size={32} 
                  color={colors.white} 
                />
              </Pressable>
            )}
            
            {selectedImageIndex < journal.productImage.length - 1 && (
              <Pressable 
                style={[styles.navArrow, styles.rightArrow]}
                onPress={navigateToNextImage}
              >
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={32} 
                  color={colors.white} 
                />
              </Pressable>
            )}
          </>
        )}

        {/* Bottom indicator dots */}
        {journal.productImage && journal.productImage.length > 1 && (
          <View style={styles.indicatorContainer}>
            {journal.productImage.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.indicator,
                  index === selectedImageIndex && styles.activeIndicator
                ]}
              />
            ))}
          </View>
        )}

        {/* Swipe gestures for touch navigation */}
        <View style={styles.swipeOverlay} pointerEvents="box-none">
          {/* Left swipe area */}
          <Pressable 
            style={styles.leftSwipeArea}
            onPress={navigateToPrevImage}
          />
          {/* Right swipe area */}
          <Pressable 
            style={styles.rightSwipeArea}
            onPress={navigateToNextImage}
          />
        </View>
      </View>
    </Modal>
  );

  if (!journal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Journal not found</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../assets/BG.jpg')}
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
            {/* Image Gallery */}
            {renderImageGallery()}

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
              {journal.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionTitle}>Description</Text>
                  <Text style={styles.description}>{journal.description}</Text>
                </View>
              )}
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
              <Text style={styles.editButtonText}>Edit Journal</Text>
            </Pressable>

            <Pressable 
              style={styles.deleteButton} 
              onPress={() => handleDelete(journal.id)}
            >
              <MaterialCommunityIcons 
                name="delete-outline" 
                size={20} 
                color={colors.danger} 
              />
              <Text style={styles.deleteButtonText}>Delete Journal</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Image Modal */}
        {renderImageModal()}
      </View>
    </ImageBackground>
  );
};

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
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
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
  
  // Single image styles
  singleImageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  singleImage: {
    width: '100%',
    height: '100%',
  },

  // Gallery styles
  galleryContainer: {
    width: '100%',
  },
  featuredImageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  expandIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  imageCounter: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageCountText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailStrip: {
    backgroundColor: colors.searchBackground,
    paddingVertical: 8,
  },
  thumbnailContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  thumbnailWrapper: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: colors.primary,
  },
  thumbnail: {
    width: 60,
    height: 60,
  },
  activeThumbnailOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
  },

  // Content styles
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

  // Action buttons
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

  // No image state
  noImageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: colors.searchBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 30,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalHeaderSpacer: {
    width: 44, // Same width as close button for centering
  },
  imageViewerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fullScreenImageContainer: {
    width: width,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width - 40,
    height: height * 0.7,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  navArrow: {
    position: 'absolute',
    top: height / 2 - 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 12,
    zIndex: 15,
  },
  leftArrow: {
    left: 20,
  },
  rightArrow: {
    right: 20,
  },
  swipeOverlay: {
    position: 'absolute',
    top: 100, // Start below the header
    left: 0,
    right: 0,
    bottom: 80, // End above the indicators
    flexDirection: 'row',
    zIndex: 5,
  },
  leftSwipeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  rightSwipeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
    zIndex: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeIndicator: {
    backgroundColor: colors.white,
    width: 24,
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});