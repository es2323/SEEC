import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfileScreen = ({ route }) => {
    const { username } = route.params || { username: 'Guest' }; // Fallback if route.params is undefined

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {username}!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold' },
});

export default ProfileScreen;