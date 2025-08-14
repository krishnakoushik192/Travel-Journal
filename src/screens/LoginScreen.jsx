import React, { useEffect } from 'react';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const redirectUrl = 'myapp://auth/callback';

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });

      if (error) throw error;
      if (data?.url) {
        console.log('Google Sign-In URL:', data.url);
        await Linking.openURL(data.url);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const completeLogin = async (url) => {
    try {
      console.log('Processing deep link:', url);

      // Parse URL fragment into an object
      const parsedUrl = new URL(url);
      const hash = parsedUrl.hash; // e.g., "#access_token=...&refresh_token=..."
      const paramsString = hash.startsWith('#') ? hash.substring(1) : hash;
      const params = Object.fromEntries(new URLSearchParams(paramsString));

      const access_token = params.access_token;
      const refresh_token = params.refresh_token;

      if (!access_token || !refresh_token) {
        console.warn('No tokens found in deep link');
        return;
      }

      // Save the session in Supabase
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) throw error;

      const user = data.session?.user;
      console.log('✅ Signed in:', user?.user_metadata);
      await AsyncStorage.setItem('user', JSON.stringify(user?.user_metadata));

      navigation.replace('Tabs');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      completeLogin(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) completeLogin(url);
    });

    return () => sub.remove();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/BG.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image
          source={require('../assets/logo.png')}
          style={{ width: width * 0.6, height: 200 }}
          resizeMode="contain"
        />
        <Text style={styles.title}>Travel Journal</Text>
        <Text style={styles.subtitle}>Capture your journeys anywhere</Text>

        <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle}>
          <MaterialCommunityIcons name="google" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.btnText}>Sign in with Google</Text>
        </TouchableOpacity>

        <Text style={{ color: 'white', marginBottom: 5, fontSize: 20 }}>or</Text>

        <TouchableOpacity style={styles.appleBtn} disabled>
          <MaterialCommunityIcons name="apple" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.btnText}>Sign in with Apple</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width, height },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#ddd', fontSize: 16, marginBottom: 40, textAlign: 'center' },
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
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  icon: { marginRight: 10 },
  btnText: { color: '#fff', fontSize: 20 },
});
