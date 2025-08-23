import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Header = () => {
    return (
        <View style={styles.header}>
            <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
                resizeMode='contain'
            />
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>Travel Journal</Text>
                <Text style={styles.subtitle}>Capture your journeys anywhere</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 30
    },
    logo: {
        width: 80,
        height: 80,
        marginRight: 10,
    },
    title: {
        color: '#ffffff',
        fontSize: 26,
        fontWeight: 'bold',
        textShadowColor: '#2D5016',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 2,
    },
    subtitle: {
        color: '#ffffff',
        fontSize: 14,
        textShadowColor: '#2D5016',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 2,
    },
})

export default Header;