import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = (props) => {
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    const getUserData = async () => {
      try {
        setLoading(true);
        const jsonValue = await AsyncStorage.getItem('user');
        console.log('User data:', jsonValue);
        if (jsonValue != null) {
          const data = JSON.parse(jsonValue);
          if (data) {
            props.navigation.replace('Tabs');
          }
        }else{
            setTimeout(() => {
              props.navigation.replace('Login');
            }, 3000);
          }
      } catch (e) {
        console.error('Error reading user data:', e);
      }finally{
        setLoading(false);
      }
    };
    getUserData();
  }, []);
  return (
    <LinearGradient colors={[ '#66BB6A','white']} style={{flex:1, justifyContent:'center', }} >
      <View style={{flex:1, justifyContent:'center', alignItems: 'center', }}>
        <Image
          source={require('../assets/logo.png')}
          style={{ resizeMode: 'contain', width: '100%', height: 280 }}
      />
      <Text style={{ color: '#403128', fontSize: 24,fontWeight: 'bold' }}>Welcome to Travel Journal</Text>
      <Text style={{color:'#403128',fontSize:18}}>Capture your journeys anywhere</Text>
      {loading && <ActivityIndicator size="large" color="#403128" />}
    </View>
    </LinearGradient>
  );
};

export default SplashScreen;