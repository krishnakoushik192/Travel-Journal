import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import BottomNavigator from './BottomNavigator';
import JournalDetails from '../screens/JournalDetailScreen';
import AddEditJournalScreen from '../screens/AddJournalScreen';

const Stack  =  createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        cardStyleInterpolator: ({ current }) => {
          const rotate = current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['-90deg', '0deg'], 
          });

          return {
            cardStyle: {
              transform: [
                { rotateY: rotate },
                { scale: current.progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }
              ],
            },
          };
        },
      }}>
      <Stack.Screen name='Splash Screen' component={SplashScreen} />
      <Stack.Screen name='Login' component={LoginScreen} />
      <Stack.Screen name='Tabs' component={BottomNavigator} />
      <Stack.Screen name='Details' component={JournalDetails} />
      <Stack.Screen name='EditJournal' component={AddEditJournalScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;