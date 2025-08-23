import { NavigationContainer } from '@react-navigation/native';
import 'react-native-url-polyfill/auto';
import { StatusBar } from 'react-native';
import StackNavigator from './src/navigation/StackNavigator';
import { useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useJournalStore } from './src/store/Store';
import NetInfo from '@react-native-community/netinfo';
import NoInternetConnection from './src/compoenents/NoInternetConnection';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


function App() {
  const initializeStore = useJournalStore((state) => state.initializeStore);
  const [internetAvailable, setInternetAvailable] = useState(false)

  useEffect(() => {
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
    <GestureHandlerRootView>
      <NavigationContainer>
        <StatusBar hidden={true} />
        <NoInternetConnection isConnected={internetAvailable} />
        <StackNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
