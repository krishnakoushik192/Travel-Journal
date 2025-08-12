import {  NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet } from 'react-native';
import StackNavigator from './src/navigation/StackNavigator';


function App() {

  return (
    <NavigationContainer>
      <StatusBar hidden={true} />
      <StackNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
