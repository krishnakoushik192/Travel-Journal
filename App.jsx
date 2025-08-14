import {  NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import StackNavigator from './src/navigation/StackNavigator';
import { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useJournalStore } from './src/store/Store';


function App() {
  const initializeStore = useJournalStore((state) => state.initializeStore);
  useEffect(() => {
    // Configure Google Sign-In when app starts
    GoogleSignin.configure({
      webClientId: '187999964641-o0o88el0coep64k946vtpususrpbe0vc.apps.googleusercontent.com',
      offlineAccess: false,
    });
    initializeStore();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar hidden={true} />
        <StackNavigator />
    </NavigationContainer>
  );
}

export default App;
