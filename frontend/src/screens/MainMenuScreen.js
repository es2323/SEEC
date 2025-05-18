import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MainMenuScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SEEC Main Menu</Text>
      <Button
        title="Find Bus"
        onPress={() => navigation.navigate('FindBus')}
        accessibilityLabel="Navigate to Find Bus screen"
      />
      <Button
        title="Image to Speech"
        onPress={() => navigation.navigate('ImageToSpeech')}
        accessibilityLabel="Navigate to Image to Speech screen"
      />
      <Button
        title="Location"
        onPress={() => navigation.navigate('Location')}
        accessibilityLabel="Navigate to Location screen"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default MainMenuScreen;