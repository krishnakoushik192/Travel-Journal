import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import Accounts from '../screens/Accounts';
import AddJournal from '../screens/AddJournalScreen';
import SearchScreen from '../screens/SearchScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


const Tab = createBottomTabNavigator();

const BottomNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name='Home' component={HomeScreen} />
      <Tab.Screen name='Add Journal' component={AddJournal} />
      <Tab.Screen name='Search' component={SearchScreen} />
      <Tab.Screen name='Profile' component={Accounts} />
    </Tab.Navigator>
  );
};

export default BottomNavigator;