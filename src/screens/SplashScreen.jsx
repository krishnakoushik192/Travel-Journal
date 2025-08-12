import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = (props) => {
  useEffect(()=>{
    setTimeout(() => {
      props.navigation.navigate('Login');
    }, 2000);
  }, []);
  return (
    <LinearGradient colors={[ '#66BB6A','white']} style={{flex:1, justifyContent:'center', }} >
      <View style={{flex:1, justifyContent:'center', alignItems: 'center', }}>
        <Image
          source={require('../assets/logo.png')}
          style={{ resizeMode: 'contain', width: '100%', height: 280 }}
      />
      <Text style={{ color: '#403128', fontSize: 24,fontWeight: 'bold' }}>Welcome to Travel Journal</Text>
    </View>
    </LinearGradient>
  );
};

export default SplashScreen;