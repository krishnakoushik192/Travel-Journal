import React, { useState, useRef } from 'react';
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
  Dimensions,
  PanResponder,
  Animated,
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
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Animation values for carousel
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);

  // Get journal data from navigation params
  const journal = route?.params?.journal;
  console.log(journal);

  // Calculate responsive dimensions
  const imageHeight = Math.min(height * 0.3, 250);
  const carouselItemWidth = width - 32; // Account for padding
  const thumbnailSize = Math.min(60, width * 0.15);

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

  // Carousel navigation functions
  const goToSlide = (index) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        x: index * carouselItemWidth,
        animated: true,
      });
      setCurrentCarouselIndex(index);
    }
  };

  const handleCarouselScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / carouselItemWidth);
    setCurrentCarouselIndex(index);
  };

  const renderCarouselDots = () => {
    if (!journal.productImage || journal.productImage.length <= 1) return null;

    return (
      <View style={styles.dotsContainer}>
        {journal.productImage.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => goToSlide(index)}
            style={[
              styles.dot,
              index === currentCarouselIndex && styles.activeDot
            ]}
          />
        ))}
      </View>
    );
  };

  const renderImageGallery = () => {
    if (!journal.productImage || journal.productImage.length === 0) {
      return (
        <View style={[styles.noImageContainer, { height: imageHeight }]}>
          <MaterialCommunityIcons name="camera-off" size={40} color={colors.textMuted} />
          <Text style={styles.noImageText}>No images available</Text>
        </View>
      );
    }

    return (
      <View style={styles.carouselContainer}>
        {/* Image Carousel */}
        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleCarouselScroll}
          scrollEventThrottle={16}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {journal.productImage.map((image, index) => (
            <Pressable
              key={index}
              style={[styles.carouselItem, { width: carouselItemWidth }]}
              onPress={() => openImageModal(index)}
            >
              <Image
                source={{ uri: image.url }}
                style={[styles.carouselImage, { height: imageHeight }]}
                resizeMode="cover"
              />
              <View style={styles.expandIcon}>
                <MaterialCommunityIcons
                  name="magnify-plus-outline"
                  size={20}
                  color={colors.white}
                />
              </View>
              {/* Image counter */}
              {journal.productImage.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCountText}>
                    {index + 1} / {journal.productImage.length}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* Carousel indicators */}
        {renderCarouselDots()}

        {/* Thumbnail navigation for multiple images */}
        {journal.productImage.length > 1 && (
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
                  { width: thumbnailSize, height: thumbnailSize },
                  index === currentCarouselIndex && styles.activeThumbnail
                ]}
                onPress={() => goToSlide(index)}
              >
                <Image
                  source={{ uri: image.url }}
                  style={[styles.thumbnail, { width: thumbnailSize, height: thumbnailSize }]}
                  resizeMode="cover"
                />
                {index === currentCarouselIndex && (
                  <View style={styles.activeThumbnailOverlay}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={Math.min(16, thumbnailSize * 0.25)}
                      color={colors.primary}
                    />
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}
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
            {/* Image Gallery Carousel */}
            {renderImageGallery()}

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Title */}
              <Text style={styles.title} numberOfLines={2}>{journal.title}</Text>

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

              {/* Tags */}
              {journal.tags && journal.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Text style={styles.tagsTitle}>Tags</Text>
                  <View style={styles.tagsWrapper}>
                    {journal.tags.map((tag, index) => {
                      // Add safety checks to prevent errors
                      if (!tag) return null;

                      // Convert to string if it's not already
                      const tagString = typeof tag === 'string' ? tag : String(tag);

                      return (
                        <View key={index} style={styles.tagGroup}>
                          <View style={styles.tagHeader}>
                            <Text style={styles.tagIndexText}>Image {index + 1}</Text>
                          </View>
                          <View style={styles.tagsList}>
                            {tagString.split(',').map((singleTag, tagIndex) => {
                              // Trim whitespace and check if tag is not empty
                              const trimmedTag = singleTag.trim();
                              if (!trimmedTag) return null;

                              return (
                                <View key={tagIndex} style={styles.tag}>
                                  <Text style={styles.tagText}>{trimmedTag}</Text>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}
                  </View>
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
    fontSize: Math.min(20, width * 0.05),
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

  // Carousel styles
  carouselContainer: {
    width: '100%',
  },
  carousel: {
    width: '100%',
  },
  carouselContent: {
    alignItems: 'center',
  },
  carouselItem: {
    position: 'relative',
    borderRadius: 0,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    borderRadius: 0,
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
  },
  imageCountText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Dots indicator
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.searchBackground,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(45, 80, 22, 0.3)',
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 20,
  },

  // Thumbnail strip
  thumbnailStrip: {
    backgroundColor: colors.searchBackground,
    paddingVertical: 8,
  },
  thumbnailContainer: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
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
    borderRadius: 6,
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
    padding: Math.max(16, width * 0.04),
  },
  title: {
    fontSize: Math.min(24, width * 0.06),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.5,
    lineHeight: Math.min(30, width * 0.075),
  },
  dateTime: {
    fontSize: Math.min(14, width * 0.035),
    color: colors.textMuted,
    marginBottom: 12,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 4,
    paddingHorizontal: 8,
  },
  location: {
    fontSize: Math.min(14, width * 0.035),
    color: colors.textMuted,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: Math.min(18, width * 0.045),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: Math.min(16, width * 0.04),
    color: colors.textSecondary,
    lineHeight: Math.min(24, width * 0.06),
    fontWeight: '400',
  },

  // Tags styles
  tagsContainer: {
    marginTop: 20,
  },
  tagsTitle: {
    fontSize: Math.min(18, width * 0.045),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  tagsWrapper: {
    gap: 12,
  },
  tagGroup: {
    backgroundColor: colors.tagBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tagHeader: {
    marginBottom: 8,
  },
  tagIndexText: {
    fontSize: Math.min(14, width * 0.035),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    color: colors.white,
    fontSize: Math.min(12, width * 0.03),
    fontWeight: '500',
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
    fontSize: Math.min(16, width * 0.04),
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
    fontSize: Math.min(16, width * 0.04),
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // No image state
  noImageContainer: {
    width: '100%',
    backgroundColor: colors.searchBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: colors.textMuted,
    fontSize: Math.min(14, width * 0.035),
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
    fontSize: Math.min(18, width * 0.045),
    color: colors.textPrimary,
    fontWeight: '600',
  },
});