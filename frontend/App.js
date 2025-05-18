import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainMenuScreen from './src/screens/MainMenuScreen';
import ImageToSpeech from './src/screens/ImageToSpeech';
import LocationScreen from './src/screens/LocationScreen';
import FindBusScreen from './src/screens/FindBusScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainMenu">
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="ImageToSpeech" component={ImageToSpeech} />
        <Stack.Screen name="Location" component={LocationScreen} />
        <Stack.Screen name="FindBus" component={FindBusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}