import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';
import { createUser } from '../api/api';
import ReactNativeTTS from 'react-native-tts';

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

  const speakContent = () => {
    const consentStatus = gdprConsent ? 'accepted' : 'not accepted';
    const screenText = `Sign Up screen. Username: ${username}. Email: ${email}. Password: ${password}. GDPR Consent is ${consentStatus}. Press the Sign Up button to create your account. If you already have an account, tap the Log in link.`;
    ReactNativeTTS.speak(screenText);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        accessibilityLabel="Username"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        accessibilityLabel="Email address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        accessibilityLabel="Password"
      />
      <View style={styles.consent}>
        <Text>GDPR Consent</Text>
        <Switch
          value={gdprConsent}
          onValueChange={setGdprConsent}
          accessibilityLabel={`GDPR Consent is ${consentStatus}`}
        />
      </View>
      <Button title="Sign Up" onPress={handleSignUp} color="blue" accessibilityLabel="Sign Up" />
      <Text style={styles.message}>{message}</Text>
      <Text style={{ marginTop: 10 }}>
        Already have an account?{' '}
        <Text style={{ color: 'blue' }} onPress={() => navigation.navigate('Login')} accessibilityLabel="Log in">
          Log in
        </Text>
      </Text>
      <Button
        title="Read Aloud"
        onPress={speakContent}
        accessibilityLabel="Read the contents of this page aloud"
      />
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