import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ImageBackground,
  Modal,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useJournalStore } from '../store/Store';
import colors from '../compoenents/Colors';
import ImageCarousel from '../compoenents/Carousel';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
const isTablet = width >= 768;
const isSmallScreen = width < 375;

// Responsive scaling functions
const scale = (size) => {
  const baseWidth = 375;
  return Math.round((size * width) / baseWidth);
};

const verticalScale = (size) => {
  const baseHeight = 812;
  return Math.round((size * height) / baseHeight);
};

const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};


export default function JournalDetails({ route, navigation }) {
  const { removeJournal } = useJournalStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get journal data from navigation params
  const journal = route?.params?.journal;

  // Calculate responsive dimensions
  const imageHeight = isTablet ? verticalScale(200) : verticalScale(180);
  const carouselItemWidth = width - (isTablet ? 64 : 32);
  const thumbnailSize = isTablet ? 80 : moderateScale(60);

  const handleEdit = () => {
    navigation?.navigate('EditJournal', { journal });
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    removeJournal(journal.id);
    setShowDeleteModal(false);
    navigation?.goBack();
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
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
        <View style={[styles.noImageContainer, { height: imageHeight }]}>
          <MaterialCommunityIcons
            name="camera-off"
            size={40}
            color={colors.textMuted}
          />
          <Text style={styles.noImageText}>No images available</Text>
        </View>
      );
    }

    return (
      <View style={styles.carouselContainer}>
        {/* Replace the existing carousel with ImageCarousel component */}
        <ImageCarousel
          images={journal.productImage}
          containerWidth={carouselItemWidth}
          imageHeight={imageHeight}
          autoPlay={false} // Disable autoplay in detail view
          showIndicators={true}
          showThumbnails={journal.productImage.length > 1}
          showImageCounter={true}
          showExpandIcon={true}
          onImagePress={openImageModal}
          thumbnailSize={60}
        />
      </View>
    );
  };

  const renderDeleteModal = () => (
    <Modal
      visible={showDeleteModal}
      transparent
      animationType="fade"
      onRequestClose={cancelDelete}
    >
      <View style={styles.deleteModalOverlay}>
        <View style={styles.deleteModalCard}>
          <View style={styles.deleteModalHeader}>
            <MaterialCommunityIcons
              name="delete-alert-outline"
              size={moderateScale(48)}
              color={colors.danger}
            />
            <Text style={styles.deleteModalTitle}>Delete Journal Entry</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </Text>
          </View>

          <View style={styles.deleteModalActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={cancelDelete}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={styles.confirmDeleteButton}
              onPress={confirmDelete}
            >
              <MaterialCommunityIcons
                name="delete"
                size={moderateScale(18)}
                color={colors.white}
              />
              <Text style={styles.confirmDeleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderImageModal = () => (
    <Modal
      visible={showImageModal}
      transparent
      animationType="fade"
      onRequestClose={closeImageModal}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
      <View style={styles.modalOverlay}>
        {/* Header */}
        <SafeAreaView style={styles.modalHeaderContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={closeImageModal} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={moderateScale(24)} color={colors.white} />
            </Pressable>
            <Text style={styles.modalTitle}>
              {selectedImageIndex + 1} of {journal.productImage?.length || 0}
            </Text>
            <View style={styles.modalHeaderSpacer} />
          </View>
        </SafeAreaView>

        {/* Image viewer */}
        <View style={styles.imageViewerContainer}>
          {journal.productImage && journal.productImage[selectedImageIndex] && (
            <ScrollView
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.imageScrollContainer}
            >
              <View style={styles.fullScreenImageContainer}>
                <Image
                  source={{ uri: journal.productImage[selectedImageIndex].url }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              </View>
            </ScrollView>
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
                  size={moderateScale(32)}
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
                  size={moderateScale(32)}
                  color={colors.white}
                />
              </Pressable>
            )}
          </>
        )}

        {/* Bottom indicator dots */}
        {journal.productImage && journal.productImage.length > 1 && (
          <SafeAreaView style={styles.indicatorContainer}>
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
          </SafeAreaView>
        )}
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
        <SafeAreaView>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation?.goBack()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={moderateScale(24)}
                color={colors.white}
              />
            </Pressable>
            <Text style={styles.headerTitle}>Journal Detail</Text>
          </View>
        </SafeAreaView>

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
                  size={moderateScale(16)}
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
                      if (!tag) return null;

                      const tagString = typeof tag === 'string' ? tag : String(tag);

                      return (
                        <View key={index} style={styles.tagGroup}>
                          <View style={styles.tagHeader}>
                            <Text style={styles.tagIndexText}>Image {index + 1}</Text>
                          </View>
                          <View style={styles.tagsList}>
                            {tagString.split(',').map((singleTag, tagIndex) => {
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
                size={moderateScale(20)}
                color={colors.white}
              />
              <Text style={styles.editButtonText}>Edit Journal</Text>
            </Pressable>

            <Pressable
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={moderateScale(20)}
                color={colors.danger}
              />
              <Text style={styles.deleteButtonText}>Delete Journal</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Image Modal */}
        {renderImageModal()}

        {/* Delete Confirmation Modal */}
        {renderDeleteModal()}
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
    padding: moderateScale(7),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(16),
  },
  backButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: moderateScale(16),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: moderateScale(16),
    paddingBottom: verticalScale(32),
  },
  mainCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: verticalScale(24),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Content styles
  contentContainer: {
    padding: moderateScale(16),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: verticalScale(8),
    letterSpacing: 0.5,
    lineHeight: moderateScale(30),
  },
  dateTime: {
    fontSize: moderateScale(14),
    color: colors.textMuted,
    marginBottom: verticalScale(12),
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(20),
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(8),
  },
  location: {
    fontSize: moderateScale(14),
    color: colors.textMuted,
    fontWeight: '500',
    flex: 1,
    lineHeight: moderateScale(20),
  },
  descriptionContainer: {
    marginTop: verticalScale(8),
  },
  descriptionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: verticalScale(12),
    letterSpacing: 0.3,
  },
  description: {
    fontSize: moderateScale(16),
    color: colors.textSecondary,
    lineHeight: moderateScale(24),
    fontWeight: '400',
  },

  // Tags styles
  tagsContainer: {
    marginTop: verticalScale(20),
  },
  tagsTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: verticalScale(12),
    letterSpacing: 0.3,
  },
  tagsWrapper: {
    gap: verticalScale(12),
  },
  tagGroup: {
    backgroundColor: colors.tagBackground,
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tagHeader: {
    marginBottom: verticalScale(8),
  },
  tagIndexText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(6),
  },
  tag: {
    backgroundColor: colors.primary,
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(4),
    paddingHorizontal: moderateScale(10),
  },
  tagText: {
    color: colors.white,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },

  // Action buttons
  actionsContainer: {
    gap: verticalScale(12),
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: moderateScale(8),
  },
  editButtonText: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deleteButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
    gap: moderateScale(8),
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: moderateScale(16),
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
    fontSize: moderateScale(14),
    marginTop: verticalScale(8),
    fontStyle: 'italic',
  },

  // Delete Modal styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
  },
  deleteModalCard: {
    backgroundColor: colors.modalCard,
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    width: '100%',
    maxWidth: isTablet ? 400 : width - 48,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  deleteModalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: moderateScale(16),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: moderateScale(22),
  },
  deleteModalActions: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    gap: moderateScale(12),
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: isSmallScreen ? undefined : 1,
    backgroundColor: colors.searchBackground,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: isSmallScreen ? undefined : 1,
    backgroundColor: colors.danger,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  confirmDeleteButtonText: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },

  // Image Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)', // Changed to pure black for better image viewing
  },
  modalHeaderContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(15),
    zIndex: 20,
  },
  closeButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 30,
  },
  modalTitle: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  modalHeaderSpacer: {
    width: moderateScale(44),
  },
  imageViewerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImageContainer: {
    width: width,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    maxWidth: width - 40,
    maxHeight: height * 0.8,
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: moderateScale(30),
    padding: moderateScale(12),
    zIndex: 15,
    marginTop: -moderateScale(30),
  },
  leftArrow: {
    left: moderateScale(20),
  },
  rightArrow: {
    right: moderateScale(20),
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    gap: moderateScale(8),
    zIndex: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  indicator: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeIndicator: {
    backgroundColor: colors.white,
    width: moderateScale(30),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: moderateScale(24),
  },
  errorText: {
    fontSize: moderateScale(18),
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
});