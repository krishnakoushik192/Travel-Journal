import {  NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import StackNavigator from './src/navigation/StackNavigator';
import { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';


function App() {
  useEffect(() => {
    // Configure Google Sign-In when app starts
    GoogleSignin.configure({
      webClientId: '162657482896-4uqb7eaf060a30lup6ofnj817tacloav.apps.googleusercontent.com',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }, []);

  return (
    <NavigationContainer>
      <StatusBar hidden={true} />
        <StackNavigator />
    </NavigationContainer>
  );
}

export default App;
