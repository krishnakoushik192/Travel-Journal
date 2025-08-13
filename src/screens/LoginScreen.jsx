import React from 'react';
import { Image } from 'react-native';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function LoginScreen(props) {
  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));
      console.log('User Info:', userInfo);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled sign in');
      } else {
        console.error(error);
      }
    }
  };

  return (
    <ImageBackground
      source={require('../assets/BG.jpg')}
      style={styles.background}
      resizeMode="cover"
    >

      {/* Black Overlay */}
      <View style={styles.overlay}>
        <Image
          source={require('../assets/logo.png')}
          style={{ width: width * 0.6, height: 200 }}
          resizeMode='contain'
        />
        <Text style={styles.title}>Travel Journal</Text>
        <Text style={styles.subtitle}>Capture your journeys anywhere</Text>

        {/* Google Sign-in */}
        <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle}>
          <MaterialCommunityIcons name="google" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.btnText}>Sign in with Google</Text>
        </TouchableOpacity>

        <Text style={{ color: 'white', marginBottom: 5, size: 20 }}>or</Text>

        {/* Apple Sign-in */}
        <TouchableOpacity style={styles.appleBtn}>
          <MaterialCommunityIcons name="apple" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.btnText}>Sign in with Apple</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F9D58',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000', // Apple black
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 20,
  },
});
