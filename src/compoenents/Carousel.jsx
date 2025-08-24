import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  Pressable,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from './Colors';

const { width: screenWidth } = Dimensions.get('window');

const ImageCarousel = ({
  images = [],
  containerWidth = screenWidth - 32,
  imageHeight = 220,
  autoPlay = true,
  autoPlayInterval = 3000,
  showIndicators = true,
  showThumbnails = false,
  showImageCounter = false,
  showExpandIcon = false,
  onImagePress,
  style,
  borderRadius = 0,
  thumbnailSize = 60,
  enablePaging = true,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const scrollViewRef = useRef(null);
  const autoPlayIntervalRef = useRef(null);

  // Safely handle images array
  const getProcessedImages = () => {
    try {
      if (images && Array.isArray(images) && images.length > 0) {
        return images.filter(img => img && (img.url || img.uri || typeof img === 'string'));
      }
      return [];
    } catch (error) {
      console.log('Error processing images:', error);
      return [];
    }
  };

  const processedImages = getProcessedImages();

  // Get image URI - handle different image formats
  const getImageUri = (image) => {
    if (typeof image === 'string') return image;
    return image?.url || image?.uri || '';
  };

  // Auto-play functionality
  useEffect(() => {
    if (processedImages.length > 1 && isAutoPlaying && autoPlay) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % processedImages.length;
          if (scrollViewRef.current) {
            try {
              scrollViewRef.current.scrollTo({
                x: nextIndex * containerWidth,
                animated: true,
              });
            } catch (error) {
              console.log('Auto-scroll error:', error);
            }
          }
          return nextIndex;
        });
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    };
  }, [processedImages.length, isAutoPlaying, autoPlay, containerWidth, autoPlayInterval]);

  // Pause auto-play when user interacts
  const pauseAutoPlay = () => {
    if (autoPlay) {
      setIsAutoPlaying(false);
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }

      // Resume auto-play after 5 seconds of no interaction
      setTimeout(() => {
        setIsAutoPlaying(true);
      }, 5000);
    }
  };

  // Handle scroll for image carousel
  const handleScroll = (event) => {
    try {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / containerWidth);
      if (index >= 0 && index < processedImages.length) {
        setCurrentImageIndex(index);
      }
      pauseAutoPlay();
    } catch (error) {
      console.log('Scroll handler error:', error);
    }
  };

  // Navigate to specific image
  const navigateToImage = (index) => {
    try {
      if (index >= 0 && index < processedImages.length) {
        setCurrentImageIndex(index);
        pauseAutoPlay();
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: index * containerWidth,
            animated: true,
          });
        }
      }
    } catch (error) {
      console.log('Navigate to image error:', error);
    }
  };

  // Handle touch start to pause auto-play
  const handleTouchStart = () => {
    pauseAutoPlay();
  };

  // Handle image press
  const handleImagePress = (index) => {
    if (onImagePress) {
      onImagePress(index, processedImages[index]);
    }
  };

  // Render no images state
  if (processedImages.length === 0) {
    return (
      <View style={[styles.noImageContainer, { height: imageHeight, width: containerWidth }, style]}>
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
    <View style={[styles.carouselContainer, { width: containerWidth }, style]}>
      {/* Main Carousel */}
      <View style={styles.imageContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled={enablePaging}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          scrollEventThrottle={16}
          style={styles.imageScrollView}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {processedImages.map((image, index) => (
            <Pressable
              key={`image-${index}`}
              style={[styles.imageSlide, { width: containerWidth }]}
              onPress={() => handleImagePress(index)}
              disabled={!onImagePress}
            >
              <Image
                source={{ uri: getImageUri(image) }}
                style={[
                  styles.carouselImage, 
                  { 
                    height: imageHeight,
                    borderRadius: borderRadius
                  }
                ]}
                resizeMode="cover"
                onError={(e) => console.log('Image load error:', e)}
              />
              
              {/* Expand Icon */}
              {showExpandIcon && onImagePress && (
                <View style={styles.expandIcon}>
                  <MaterialCommunityIcons
                    name="magnify-plus-outline"
                    size={20}
                    color={colors.white}
                  />
                </View>
              )}

              {/* Image Counter */}
              {showImageCounter && processedImages.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCountText}>
                    {index + 1} / {processedImages.length}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* Auto-play Indicator */}
        {processedImages.length > 1 && autoPlay && (
          <View style={styles.autoPlayIndicator}>
            <MaterialCommunityIcons
              name={isAutoPlaying ? "play-circle" : "pause-circle"}
              size={20}
              color={colors.white}
            />
          </View>
        )}
      </View>

      {/* Dot Indicators */}
      {showIndicators && processedImages.length > 1 && (
        <View style={styles.indicatorContainer}>
          {processedImages.map((_, index) => (
            <Pressable
              key={`indicator-${index}`}
              onPress={() => navigateToImage(index)}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentImageIndex
                    ? colors.indicatorActive || colors.primary
                    : colors.indicatorInactive || 'rgba(255, 255, 255, 0.5)'
                }
              ]}
            />
          ))}
        </View>
      )}

      {/* Thumbnail Strip */}
      {showThumbnails && processedImages.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailStrip}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {processedImages.map((image, index) => (
            <Pressable
              key={`thumbnail-${index}`}
              style={[
                styles.thumbnailWrapper,
                { width: thumbnailSize, height: thumbnailSize },
                index === currentImageIndex && styles.activeThumbnail
              ]}
              onPress={() => navigateToImage(index)}
            >
              <Image
                source={{ uri: getImageUri(image) }}
                style={[
                  styles.thumbnail, 
                  { 
                    width: thumbnailSize, 
                    height: thumbnailSize,
                    borderRadius: thumbnailSize * 0.1
                  }
                ]}
                resizeMode="cover"
              />
              {index === currentImageIndex && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    alignSelf: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  imageScrollView: {
    width: '100%',
  },
  imageSlide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselImage: {
    width: '100%',
    backgroundColor: colors.searchBackground,
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
  autoPlayIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.white,
  },
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
    backgroundColor: colors.searchBackground,
  },
  activeThumbnailOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
  },
  noImageContainer: {
    backgroundColor: colors.searchBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  noImageText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ImageCarousel;