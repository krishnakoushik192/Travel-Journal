import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView, Dimensions, Modal } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useJournalStore } from '../store/Store';
import colors from './Colors';
import ImageCarousel from './Carousel';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const { width: screenWidth } = Dimensions.get('window');


const JournalCard = ({ nav, item }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const swipeableRef = useRef(null);
    const { removeJournal } = useJournalStore();

    // Calculate responsive dimensions
    const cardWidth = screenWidth - 32;
    const imageHeight = Math.min(220, screenWidth * 0.6);

    // Safely handle images
    const getImages = () => {
        try {
            if (item?.productImage && Array.isArray(item.productImage) && item.productImage.length > 0) {
                return item.productImage.filter(img => img && img.url);
            }
            return [{ url: 'https://via.placeholder.com/400x220/D4E7D4/4A7C59?text=No+Image' }];
        } catch (error) {
            console.log('Error getting images:', error);
            return [{ url: 'https://via.placeholder.com/400x220/D4E7D4/4A7C59?text=No+Image' }];
        }
    };

    const images = getImages();

    // Safely generate tags
    const generateTags = () => {
        try {
            // First check if item.tags exists and has valid values
            if (item?.tags) {
                let validTags = [];

                if (Array.isArray(item.tags)) {
                    validTags = item.tags
                        .filter(tag => tag != null && tag !== undefined)
                        .map(tag => {
                            if (typeof tag === 'string') {
                                return tag.trim();
                            } else if (typeof tag === 'object' && tag.name) {
                                return String(tag.name).trim();
                            } else {
                                return String(tag).trim();
                            }
                        })
                        .filter(tag => tag.length > 0)
                        .slice(0, 3);
                }

                if (validTags.length > 0) {
                    return validTags;
                }
            }

            // Generate from title and description if no valid tags
            const tags = [];
            const text = `${item?.title || ''} ${item?.description || ''}`.toLowerCase();

            const tagKeywords = [
                { keywords: ['mountain', 'hill'], tag: 'mountain' },
                { keywords: ['beach', 'ocean', 'sea'], tag: 'beach' },
                { keywords: ['food', 'restaurant', 'eat'], tag: 'food' },
                { keywords: ['sunset', 'sunrise'], tag: 'sunset' },
                { keywords: ['city', 'urban'], tag: 'city' },
                { keywords: ['nature', 'forest', 'park'], tag: 'nature' },
                { keywords: ['adventure', 'explore'], tag: 'adventure' },
                { keywords: ['culture', 'museum', 'art'], tag: 'culture' }
            ];

            tagKeywords.forEach(({ keywords, tag }) => {
                if (keywords.some(keyword => text.includes(keyword)) && !tags.includes(tag)) {
                    tags.push(tag);
                }
            });

            if (tags.length === 0) {
                tags.push('travel');
            }

            return tags.slice(0, 3);
        } catch (error) {
            console.log('Generate tags error:', error);
            return ['travel'];
        }
    };

    const displayTags = generateTags();

    // Safe navigation handler
    const handleCardPress = () => {
        try {
            if (nav?.navigation?.navigate) {
                nav.navigation.navigate('Details', { journal: item });
            }
        } catch (error) {
            console.log('Navigation error:', error);
        }
    };

    // Handle delete button press
    const handleDeletePress = () => {
        setShowDeleteModal(true);
        // Close the swipeable
        if (swipeableRef.current) {
            swipeableRef.current.close();
        }
    };

    // Handle delete confirmation
    const handleDeleteConfirm = () => {
        removeJournal(item.id);
        setShowDeleteModal(false);
    };

    // Handle delete cancel
    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    // Render right action (delete button)
    const renderDeleteModal = () => {
        return (
            <DeleteConfirmationModal
                visible={showDeleteModal}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                title="Delete Journal Entry"
                message={`Are you sure you want to delete "${item?.title || 'Untitled Entry'}"?`}
                // Custom message with journal preview
                customContent={
                    <View style={styles.modalPreview}>
                        <Text style={styles.modalPreviewTitle} numberOfLines={1}>
                            "{item?.title || 'Untitled Entry'}"
                        </Text>
                        <View style={styles.modalPreviewMeta}>
                            <MaterialCommunityIcons
                                name="calendar-outline"
                                size={14}
                                color={colors.textMuted}
                            />
                            <Text style={styles.modalPreviewDate}>
                                {item?.dateTime || 'No date'}
                            </Text>
                        </View>
                    </View>
                }
            />
        );
    };
    const onSwipeOpen = () => {
        setShowDeleteModal(true);
        // close the swipe right away so card resets
        swipeableRef.current?.close();
    };
    // Safe render function
    const renderCard = () => {
        try {
            return (
                <>
                    <Swipeable
                        ref={swipeableRef}
                        onSwipeableOpen={onSwipeOpen}
                        renderRightActions={() => (
                            <View style={styles.deleteActionContainer}>
                                <Pressable
                                    onPress={handleDeletePress}
                                    style={({ pressed }) => [
                                        styles.deleteButton,
                                        pressed && styles.deleteButtonPressed
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="trash-can-outline"
                                        size={24}
                                        color={colors.white}
                                    />
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </Pressable>
                            </View>
                        )}
                        rightThreshold={40}
                        friction={2}
                    >
                        <View style={[styles.cardContainer, { width: cardWidth }]}>
                            <Pressable
                                onPress={handleCardPress}
                                style={({ pressed }) => [
                                    styles.card,
                                    pressed && styles.cardPressed
                                ]}
                            >
                                <View style={styles.cardInner}>
                                    {/* Image Carousel Section */}
                                    <ImageCarousel
                                        images={images}
                                        containerWidth={cardWidth}
                                        imageHeight={imageHeight}
                                        autoPlay={true}
                                        autoPlayInterval={3000}
                                        showIndicators={true}
                                        showImageCounter={images.length > 1}
                                        borderRadius={20}
                                        style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                                    />

                                    {/* Content Section */}
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle} numberOfLines={2}>
                                            {item?.title || 'Untitled Entry'}
                                        </Text>

                                        <View style={styles.cardMeta}>
                                            <View style={styles.metaRow}>
                                                <MaterialCommunityIcons
                                                    name="calendar-outline"
                                                    size={16}
                                                    color={colors.textMuted}
                                                />
                                                <Text style={styles.cardDate}>
                                                    {item?.dateTime || 'No date'}
                                                </Text>
                                            </View>
                                            <View style={styles.metaRow}>
                                                <MaterialCommunityIcons
                                                    name="map-marker-outline"
                                                    size={16}
                                                    color={colors.textMuted}
                                                />
                                                <Text style={styles.cardLocation} numberOfLines={1}>
                                                    {item?.locationName || 'Unknown location'}
                                                </Text>
                                            </View>
                                        </View>

                                        {item?.description && (
                                            <Text style={styles.cardDescription} numberOfLines={3}>
                                                {item.description}
                                            </Text>
                                        )}

                                        {/* Tags Section */}
                                        <View style={styles.cardTags}>
                                            {displayTags.map((tag, index) => (
                                                <View key={`tag-${index}`} style={styles.tagContainer}>
                                                    <Text style={styles.cardTag}>{String(tag)}</Text>
                                                </View>
                                            ))}
                                            {images.length > 1 && (
                                                <View style={styles.imageCountTag}>
                                                    <MaterialCommunityIcons
                                                        name="image-multiple"
                                                        size={14}
                                                        color={colors.secondary}
                                                    />
                                                    <Text style={styles.imageCountText}>
                                                        {images.length}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        </View>
                    </Swipeable>
                    {renderDeleteModal()}
                </>
            );
        } catch (error) {
            console.log('Render error:', error);
            return (
                <View style={[styles.cardContainer, { width: cardWidth }]}>
                    <View style={styles.errorCard}>
                        <Text style={styles.errorText}>Error loading journal card</Text>
                    </View>
                </View>
            );
        }
    };

    return renderCard();
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
    errorCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    errorText: {
        color: colors.textMuted,
        fontSize: 14,
        fontWeight: '500',
    },
    // Delete action styles
    deleteActionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 16,
        marginVertical: 8,
    },
    deleteButton: {
        backgroundColor: colors.danger,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        shadowColor: colors.danger,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    deleteButtonPressed: {
        transform: [{ scale: 0.95 }],
        shadowOpacity: 0.2,
        elevation: 3,
    },
    deleteButtonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    },
    modalPreview: {
        backgroundColor: colors.tagBackground,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    modalPreviewTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    modalPreviewMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalPreviewDate: {
        fontSize: 14,
        color: colors.textMuted,
        marginLeft: 8,
        fontWeight: '500',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: Math.min(20, screenWidth * 0.055),
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