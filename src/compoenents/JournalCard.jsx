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

const JournalCard = ({nav,item}) => {
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
                        source={item.image}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                    <View style={styles.imageOverlay} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.cardMeta}>
                        <View style={styles.metaRow}>
                            <MaterialCommunityIcons
                                name="calendar-outline"
                                size={14}
                                color={colors.textMuted}
                            />
                            <Text style={styles.cardDate}>{item.date}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <MaterialCommunityIcons
                                name="map-marker-outline"
                                size={14}
                                color={colors.textMuted}
                            />
                            <Text style={styles.cardLocation}>{item.location}</Text>
                        </View>
                    </View>
                    <View style={styles.cardTags}>
                        {item.tags.map(tag => (
                            <View key={tag} style={styles.tagContainer}>
                                <Text style={styles.cardTag}>#{tag}</Text>
                            </View>
                        ))}
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
    },
    cardTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
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
})

export default JournalCard;