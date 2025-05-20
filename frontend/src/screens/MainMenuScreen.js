import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ZoomableView from '../components/ZoomableView';

const MainMenuScreen = () => {
  const navigation = useNavigation();

  return (
    <ZoomableView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>SEEC</Text>
        <Text style={styles.subtitle}>
          Smart, accessible travel: Find buses, get spoken directions, and more.
        </Text>
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('FindBus')}
            accessibilityLabel="Navigate to Find Bus screen"
          >
            <Text style={styles.menuButtonText}>🚌 Find Bus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('ImageToSpeech')}
            accessibilityLabel="Navigate to Image to Speech screen"
          >
            <Text style={styles.menuButtonText}>🖼️ Image to Speech</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Location')}
            accessibilityLabel="Navigate to Location screen"
          >
            <Text style={styles.menuButtonText}>📍 Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ZoomableView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: 300,
  },
  menu: {
    width: '100%',
    alignItems: 'center',
  },
  menuButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginBottom: 18,
    width: 260,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  menuButtonText: {
    fontSize: 20,
    color: '#222',
    fontWeight: '600',
  },
});

export default MainMenuScreen;