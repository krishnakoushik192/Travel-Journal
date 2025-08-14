import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import StackNavigator from './src/navigation/StackNavigator';
import { useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useJournalStore } from './src/store/Store';
import NetInfo from '@react-native-community/netinfo';
import NoInternetConnection from './src/compoenents/NoInternetConnection';


function App() {
  const initializeStore = useJournalStore((state) => state.initializeStore);
  const [internetAvailable, setInternetAvailable] = useState(false)

  useEffect(() => {
    // Configure Google Sign-In when app starts
    GoogleSignin.configure({
      webClientId: '187999964641-o0o88el0coep64k946vtpususrpbe0vc.apps.googleusercontent.com',
      offlineAccess: false,
    });
    const unsubscribe = NetInfo.addEventListener(state => {
      global.isConnected = state.isConnected;
      setInternetAvailable(state.isConnected)
    });
    initializeStore();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar hidden={true} />
      <NoInternetConnection isConnected={internetAvailable} />
      <StackNavigator />
    </NavigationContainer>
  );
}

export default App;
