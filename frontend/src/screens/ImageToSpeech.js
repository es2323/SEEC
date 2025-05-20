import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { imageToSpeechFunc } from '../utils/imageToSpeech';
import ZoomableView from '../components/ZoomableView';

const ImageToSpeech = () => {
  const [extractedText, setExtractedText] = useState('');
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);

  useEffect(() => {
    (async () => {
      console.log('Requesting media library permissions...');
      const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Media library permission status:', mediaStatus.status);
      setHasMediaPermission(mediaStatus.status === 'granted');

      console.log('Requesting camera permissions...');
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission status:', cameraStatus.status);
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();
  }, []);

  const handleImageFromGallery = async () => {
    if (!hasMediaPermission) {
      setExtractedText('Permission to access media library denied');
      return;
    }
    try {
      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });
      console.log('Image picker result:', result);
      if (result.canceled) {
        setExtractedText('Image selection canceled');
        return;
      }
      const imageUri = result.assets[0].uri;
      console.log('Selected image URI:', imageUri);
      const text = await imageToSpeechFunc({ current: { takePictureAsync: async () => ({ uri: imageUri }) } });
      setExtractedText(text);
    } catch (error) {
      console.error('Image picker error:', error.message);
      setExtractedText('Error: ' + error.message);
    }
  };

  const handleImageFromCamera = async () => {
    if (!hasCameraPermission) {
      setExtractedText('Permission to access camera denied');
      return;
    }
    try {
      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });
      console.log('Camera result:', result);
      if (result.canceled) {
        setExtractedText('Camera capture canceled');
        return;
    }
    const imageUri = result.assets[0].uri;
    console.log('Captured image URI:', imageUri);
    const text = await imageToSpeechFunc({ current: { takePictureAsync: async () => ({ uri: imageUri }) } });
    setExtractedText(text);
  } catch (error) {
    console.error('Camera error:', error.message);
    setExtractedText('Error: ' + error.message);
  }
};

if (hasMediaPermission === null || hasCameraPermission === null) {
  return (
    <ZoomableView>
      <View style={styles.container}>
        <Text accessibilityLabel="Requesting permissions...">Requesting permissions...</Text>
      </View>
    </ZoomableView>
  );
}

if (hasMediaPermission === false || hasCameraPermission === false) {
  return (
    <ZoomableView>
      <View style={styles.container}>
        <Text accessibilityLabel={`Permissions denied: ${hasMediaPermission ? '' : 'Media Library '} ${hasCameraPermission ? '' : 'Camera'}`}>
          Permissions denied: {hasMediaPermission ? '' : 'Media Library '} {hasCameraPermission ? '' : 'Camera'}
        </Text>
      </View>
    </ZoomableView>
  );
}

return (
  <ZoomableView>
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="Select Image from Gallery"
          onPress={handleImageFromGallery}
          accessibilityLabel="Select an image from gallery to extract text"
        />
        <Button
          title="Take Picture"
          onPress={handleImageFromCamera}
          accessibilityLabel="Take a picture to extract text"
        />
      </View>
      <Text style={styles.text} accessibilityLabel={extractedText || 'No text extracted'}>
        {extractedText}
      </Text>
    </View>
  </ZoomableView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginVertical: 20,
  },
  text: {
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ImageToSpeech;