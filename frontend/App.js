import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import ImageToSpeech from './src/screens/ImageToSpeech';
import LocationScreen from './src/screens/LocationScreen';
import FindBusScreen from './src/screens/FindBusScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="SignUp">
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="ImageToSpeech" component={ImageToSpeech} />
                <Stack.Screen name="Location" component={LocationScreen} />
                <Stack.Screen name="FindBus" component={FindBusScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

