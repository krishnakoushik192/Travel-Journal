import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

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
    indicatorActive: '#4A7C59',
    indicatorInactive: 'rgba(74, 124, 89, 0.3)',
};

const JournalCard = ({ nav, item }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const scrollViewRef = useRef(null);
    const autoPlayIntervalRef = useRef(null);
    
    // Calculate responsive dimensions
    const cardWidth = screenWidth - 32; // 16px margin on each side
    const imageHeight = Math.min(220, screenWidth * 0.6); // Responsive height with max

    console.log("JournalCard item:", item);
    
    const images = item.productImage && item.productImage.length > 0 
        ? item.productImage 
        : [{ url: 'https://via.placeholder.com/400x220/D4E7D4/4A7C59?text=No+Image' }];

    // Auto-play functionality
    useEffect(() => {
        if (images.length > 1 && isAutoPlaying) {
            autoPlayIntervalRef.current = setInterval(() => {
                setCurrentImageIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % images.length;
                    scrollViewRef.current?.scrollTo({
                        x: nextIndex * cardWidth,
                        animated: true,
                    });
                    return nextIndex;
                });
            }, 3000); // Change image every 3 seconds
        }

        return () => {
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
            }
        };
    }, [images.length, isAutoPlaying, cardWidth]);

    // Pause auto-play when user interacts
    const pauseAutoPlay = () => {
        setIsAutoPlaying(false);
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
        }
        
        // Resume auto-play after 5 seconds of no interaction
        setTimeout(() => {
            setIsAutoPlaying(true);
        }, 5000);
    };

    // Handle scroll for image carousel
    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / cardWidth);
        setCurrentImageIndex(index);
        pauseAutoPlay(); // Pause when user scrolls manually
    };

    // Navigate to specific image
    const navigateToImage = (index) => {
        setCurrentImageIndex(index);
        pauseAutoPlay(); // Pause when user taps indicator
        scrollViewRef.current?.scrollTo({
            x: index * cardWidth,
            animated: true,
        });
    };

    // Handle touch start to pause auto-play
    const handleTouchStart = () => {
        pauseAutoPlay();
    };

    // Create tags from title and description
    const generateTags = () => {
        if (item.tags && item.tags.length > 0) {
            return item.tags.slice(0, 3);
        }

        const tags = [];
        const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
        
        // Simple tag generation based on keywords
        if (text.includes('mountain') || text.includes('hill')) tags.push('mountain');
        if (text.includes('beach') || text.includes('ocean') || text.includes('sea')) tags.push('beach');
        if (text.includes('food') || text.includes('restaurant') || text.includes('eat')) tags.push('food');
        if (text.includes('sunset') || text.includes('sunrise')) tags.push('sunset');
        if (text.includes('city') || text.includes('urban')) tags.push('city');
        if (text.includes('nature') || text.includes('forest') || text.includes('park')) tags.push('nature');
        if (text.includes('adventure') || text.includes('explore')) tags.push('adventure');
        if (text.includes('culture') || text.includes('museum') || text.includes('art')) tags.push('culture');
        
        // If no tags generated, add a default based on location or just 'travel'
        if (tags.length === 0) {
            tags.push('travel');
        }
        
        return tags.slice(0, 3); // Limit to 3 tags
    };

    const displayTags = generateTags();

    return (
        <View style={[styles.cardContainer, { width: cardWidth }]}>
            <Pressable
                onPress={() => nav.navigation.navigate('Details', { journal: item })}
                style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed
                ]}
            >
                <View style={styles.cardInner}>
                    {/* Image Carousel Section */}
                    <View style={styles.imageContainer}>
                        <ScrollView
                            ref={scrollViewRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            onTouchStart={handleTouchStart}
                            scrollEventThrottle={16}
                            style={styles.imageScrollView}
                            contentContainerStyle={{ alignItems: 'center' }}
                        >
                            {images.map((image, index) => (
                                <View key={index} style={[styles.imageSlide, { width: cardWidth }]}>
                                    <Image
                                        source={{ uri: image.url }}
                                        style={[styles.cardImage, { height: imageHeight }]}
                                        resizeMode="cover"
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        
                        {/* Image overlay */}
                        <View style={[styles.imageOverlay, { height: imageHeight }]} />
                        
                        {/* Image indicators */}
                        {images.length > 1 && (
                            <View style={styles.indicatorContainer}>
                                {images.map((_, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => navigateToImage(index)}
                                        style={[
                                            styles.indicator,
                                            {
                                                backgroundColor: index === currentImageIndex 
                                                    ? colors.indicatorActive 
                                                    : colors.indicatorInactive
                                            }
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                        
                        {/* Auto-play indicator */}
                        {images.length > 1 && (
                            <View style={styles.autoPlayIndicator}>
                                <MaterialCommunityIcons
                                    name={isAutoPlaying ? "play-circle" : "pause-circle"}
                                    size={20}
                                    color={colors.white}
                                />
                            </View>
                        )}
                    </View>

                    {/* Content Section */}
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                            {item.title || 'Untitled Entry'}
                        </Text>
                        
                        <View style={styles.cardMeta}>
                            <View style={styles.metaRow}>
                                <MaterialCommunityIcons
                                    name="calendar-outline"
                                    size={16}
                                    color={colors.textMuted}
                                />
                                <Text style={styles.cardDate}>
                                    {item.dateTime || 'No date'}
                                </Text>
                            </View>
                            <View style={styles.metaRow}>
                                <MaterialCommunityIcons
                                    name="map-marker-outline"
                                    size={16}
                                    color={colors.textMuted}
                                />
                                <Text style={styles.cardLocation} numberOfLines={1}>
                                    {item.locationName || 'Unknown location'}
                                </Text>
                            </View>
                        </View>

                        {item.description && (
                            <Text style={styles.cardDescription} numberOfLines={3}>
                                {item.description}
                            </Text>
                        )}

                        {/* Tags Section */}
                        <View style={styles.cardTags}>
                            {displayTags.map((tag, index) => (
                                <View key={`${tag}-${index}`} style={styles.tagContainer}>
                                    <Text style={styles.cardTag}>#{tag}</Text>
                                </View>
                            ))}
                            {item.productImage && item.productImage.length > 0 && (
                                <View style={styles.imageCountTag}>
                                    <MaterialCommunityIcons
                                        name="image-multiple"
                                        size={14}
                                        color={colors.secondary}
                                    />
                                    <Text style={styles.imageCountText}>
                                        {item.productImage.length}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        alignSelf: 'center',
        marginVertical: 8,
    },
    card: {
        borderRadius: 20,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    cardPressed: {
        transform: [{ scale: 0.98 }],
        shadowOpacity: 0.1,
        elevation: 4,
    },
    cardInner: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
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
    cardImage: {
        width: '100%',
        backgroundColor: colors.searchBackground,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    indicatorContainer: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.white,
    },
    imageCounter: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    imageCounterText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.white,
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
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: Math.min(20, screenWidth * 0.055), // Responsive font size
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
        letterSpacing: 0.5,
        lineHeight: Math.min(26, screenWidth * 0.07),
    },
    cardMeta: {
        marginBottom: 12,
        gap: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardDate: {
        fontSize: Math.min(14, screenWidth * 0.038),
        color: colors.textMuted,
        marginLeft: 8,
        fontWeight: '500',
        flex: 1,
    },
    cardLocation: {
        fontSize: Math.min(14, screenWidth * 0.038),
        color: colors.textMuted,
        marginLeft: 8,
        fontWeight: '500',
        flex: 1,
    },
    cardDescription: {
        fontSize: Math.min(14, screenWidth * 0.038),
        color: colors.textSecondary,
        lineHeight: Math.min(20, screenWidth * 0.055),
        marginBottom: 12,
    },
    cardTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
    },
    tagContainer: {
        backgroundColor: colors.tagBackground,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.accent,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardTag: {
        fontSize: Math.min(12, screenWidth * 0.032),
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 0.5,
    },
    imageCountTag: {
        backgroundColor: colors.tagBackground,
        borderRadius: 15,
        paddingVertical: 6,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    imageCountText: {
        fontSize: Math.min(11, screenWidth * 0.03),
        fontWeight: '600',
        color: colors.secondary,
    },
});

export default JournalCard;