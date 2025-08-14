import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

const JournalCard = ({ nav, item }) => {
    // Get the first image from productImage array or use a default
    console.log("JournalCard item:", item);
    const getDisplayImage = () => {
        if (item.productImage && item.productImage.length > 0) {
            return { uri: item.productImage[0].url };
        }
    };

    // Create tags from title and description (simple implementation)
    const generateTags = () => {
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

    return (
        <Pressable
            onPress={() => nav.navigation.navigate('Details', { journal: item })}
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
            ]}
        >
            <View style={styles.cardInner}>
                <View style={styles.imageContainer}>
                    <Image
                        source={getDisplayImage()}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                    <View style={styles.imageOverlay} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title || 'Untitled Entry'}
                    </Text>
                    <View style={styles.cardMeta}>
                        <View style={styles.metaRow}>
                            <MaterialCommunityIcons
                                name="calendar-outline"
                                size={14}
                                color={colors.textMuted}
                            />
                            <Text style={styles.cardDate}>
                                {(item.dateTime)}
                            </Text>
                        </View>
                        <View style={styles.metaRow}>
                            <MaterialCommunityIcons
                                name="map-marker-outline"
                                size={14}
                                color={colors.textMuted}
                            />
                            <Text style={styles.cardLocation} numberOfLines={1}>
                                {item.locationName || 'Unknown location'}
                            </Text>
                        </View>
                    </View>
                    {item.description && (
                        <Text style={styles.cardDescription} numberOfLines={5}>
                            {item.description}
                        </Text>
                    )}
                    <View style={styles.cardTags}>
                        {generateTags().map((tag, index) => (
                            <View key={`${tag}-${index}`} style={styles.tagContainer}>
                                <Text style={styles.cardTag}>#{tag}</Text>
                            </View>
                        ))}
                        {item.productImage && item.productImage.length > 0 && (
                            <View style={styles.imageCountTag}>
                                <MaterialCommunityIcons
                                    name="camera"
                                    size={12}
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
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 10,
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
    cardImage: {
        width: '100%',
        height: 220,
        backgroundColor: colors.searchBackground, // Fallback color
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    cardMeta: {
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 14,
        color: colors.textMuted,
        marginLeft: 6,
        fontWeight: '500',
    },
    cardLocation: {
        fontSize: 14,
        color: colors.textMuted,
        marginLeft: 6,
        fontWeight: '500',
        flex: 1,
    },
    cardDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
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
        fontSize: 12,
        fontWeight: '600',
        color: colors.secondary,
        letterSpacing: 0.5,
    },
    imageCountTag: {
        backgroundColor: colors.tagBackground,
        borderRadius: 15,
        paddingVertical: 4,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: colors.secondary,
    },
    imageCountText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
    },
});

export default JournalCard;