import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Define the AppNavigator component

const AppNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name="Menu" component={MenuScreen} />

        </Stack.Navigator>
    </NavigationContainer>
);

export default AppNavigator;

