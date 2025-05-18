import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { loginUser } from "../api/api";


const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async () => {
        try {
            const response = await loginUser(email, password);
            console.log("Login response:", response);
            setMessage(response.message);
            setTimeout(() => navigation.navigate("Location"), 1000);
        } catch (error) {
            setMessage(error.error || "Login failed");
        }
    };

    return (
        <View style={styles.container}>
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
            <Button title="Login" onPress={handleLogin} />
            <Text style={styles.message}>{message}</Text>
            <Button title="Go to Location Screen" onPress={() => navigation.navigate("Location")} />
            <Button title="Find Bus" onPress={() => navigation.navigate("FindBus")} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: "center" },
    input: { borderWidth: 1, padding: 8, marginBottom: 16 },
    message: { marginTop: 16, textAlign: "center", color: "green" },
});

export default LoginScreen;