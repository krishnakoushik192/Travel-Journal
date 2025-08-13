import {  NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import StackNavigator from './src/navigation/StackNavigator';


function App() {

  return (
    <NavigationContainer>
      <StatusBar hidden={true} />
        <StackNavigator />
    </NavigationContainer>
  );
}

export default App;
