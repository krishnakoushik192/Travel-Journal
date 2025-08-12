import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import Accounts from '../screens/Accounts';
import AddJournal from '../screens/AddJournalScreen';
import SearchScreen from '../screens/SearchScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


const Tab = createBottomTabNavigator();

const BottomNavigator = () => {
  const isDarkMode = true;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#437373' , 
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor:  '#F2DCEC' , 
        tabBarInactiveTintColor: '#A9D4D9' ,
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Add Journal') iconName = 'book-plus';
          else if (route.name === 'Search') iconName = 'magnify';
          else if (route.name === 'Profile') iconName = 'account';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add Journal" component={AddJournal} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={Accounts} />
    </Tab.Navigator>

  );
};


export default BottomNavigator;