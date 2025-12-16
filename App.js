import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import OverzichtScreen from './screens/OverzichtScreen';
import CountdownScreen from './screens/CountdownScreen';
import SettingsScreen from './screens/SettingsScreen';
import AboutScreen from './screens/AboutScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    //Navigationcontainer dit zorgt voor de wrappeng van de navigatie, zodat je kan switchen tussen schermen, voor de styling van tabs zoals icons kleuren etc.
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Overzicht') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Countdown') {
              iconName = focused ? 'timer' : 'timer-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else if (route.name === 'About') {
              iconName = focused ? 'information-circle' : 'information-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#3b82f6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Overzicht" 
          component={OverzichtScreen}
          options={{ title: 'Schoolvakanties' }}
        />
        <Tab.Screen 
          name="Countdown" 
          component={CountdownScreen}
          options={{ title: 'Countdown' }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Instellingen' }}
        />
        <Tab.Screen 
          name="About" 
          component={AboutScreen}
          options={{ title: 'Over deze app' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}