import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';
import { createUser } from '../api/api';


const SignUpScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gdprConsent, setGdprConsent] = useState(false);
    const [message, setMessage] = useState('');

    const handleSignUp = async () => {
        try {
            await createUser(username, email, password, gdprConsent);
            setMessage('Account created! Please log in.');
            setTimeout(() => navigation.navigate('Login'), 2000);
        } catch (error) {
            setMessage(error.error || 'Failed to create account');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <View style={styles.consent}>
                <Text>GDPR Consent</Text>
                <Switch value={gdprConsent} onValueChange={setGdprConsent} />
            </View>
            <Button title="Sign Up" onPress={handleSignUp} color="blue" />
            <Text style={styles.message}>{message}</Text>
            <Text style={{ marginTop: 10 }}>
                Already have an account?{' '}
                <Text style={{ color: 'blue' }} onPress={() => navigation.navigate('Login')}>
                    Log in
                </Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: 'center' },
    input: { borderWidth: 1, padding: 8, marginBottom: 16 },
    consent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    message: { marginTop: 16, textAlign: 'center', color: 'green' },
});

export default SignUpScreen;