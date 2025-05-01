import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { imageToSpeechFunc } from '../utils/imageToSpeech';

// This component allows users to select an image from their gallery or take a picture,
// then extracts text from the image and reads it aloud using text-to-speech.
const ImageToSpeech = () => {
    // State to store the extracted text from the image, displayed on the screen.
    const [extractedText, setExtractedText] = useState('');
    // State to track if the app has permission to access the media library (gallery).
    const [hasMediaPermission, setHasMediaPermission] = useState(null);
    // State to track if the app has permission to access the camera.
    const [hasCameraPermission, setHasCameraPermission] = useState(null);

    // Runs once on component mount to request permissions for media library and camera.
    useEffect(() => {
        (async () => {
            console.log('Requesting media library permissions...');
            // Request permission to access the user's photo gallery.
            const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Media library permission status:', mediaStatus.status);
            // Update state based on whether permission was granted.
            setHasMediaPermission(mediaStatus.status === 'granted');

            console.log('Requesting camera permissions...');
            // Request permission to access the device's camera.
            const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
            console.log('Camera permission status:', cameraStatus.status);
            // Update state based on whether permission was granted.
            setHasCameraPermission(cameraStatus.status === 'granted');
        })();
    }, []);

    // Function to handle selecting an image from the gallery.
    const handleImageFromGallery = async () => {
        // Check if media library permission has been granted.
        if (!hasMediaPermission) {
            setExtractedText('Permission to access media library denied');
            return;
        }

        try {
            console.log('Launching image library...');
            // Open the gallery to let the user pick an image.
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'], // Only allow image files.
                allowsEditing: true, // Let the user crop/edit the image.
                quality: 1, // Use maximum image quality.
            });

            console.log('Image picker result:', result);

            // If the user cancels the selection, show a message.
            if (result.canceled) {
                setExtractedText('Image selection canceled');
                return;
            }

            // Get the URI of the selected image.
            const imageUri = result.assets[0].uri;
            console.log('Selected image URI:', imageUri);
            // Process the image to extract text and read it aloud.
            const text = await imageToSpeechFunc({ current: { takePictureAsync: async () => ({ uri: imageUri }) } });
            // Display the extracted text on the screen.
            setExtractedText(text);
        } catch (error) {
            console.error('Image picker error:', error.message);
            // Show any errors that occur during the process.
            setExtractedText('Error: ' + error.message);
        }
    };

    // Function to handle taking a picture with the camera.
    const handleImageFromCamera = async () => {
        // Check if camera permission has been granted.
        if (!hasCameraPermission) {
            setExtractedText('Permission to access camera denied');
            return;
        }

        try {
            console.log('Launching camera...');
            // Open the camera to let the user take a picture.
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'], // Only capture images.
                allowsEditing: true, // Let the user crop/edit the image.
                quality: 1, // Use maximum image quality.
            });

            console.log('Camera result:', result);

            // If the user cancels the capture, show a message.
            if (result.canceled) {
                setExtractedText('Camera capture canceled');
                return;
            }

            // Get the URI of the captured image.
            const imageUri = result.assets[0].uri;
            console.log('Captured image URI:', imageUri);
            // Process the image to extract text and read it aloud.
            const text = await imageToSpeechFunc({ current: { takePictureAsync: async () => ({ uri: imageUri }) } });
            // Display the extracted text on the screen.
            setExtractedText(text);
        } catch (error) {
            console.error('Camera error:', error.message);
            // Show any errors that occur during the process.
            setExtractedText('Error: ' + error.message);
        }
    };

    // Show a loading message while requesting permissions.
    if (hasMediaPermission === null || hasCameraPermission === null) {
        return (
            <View style={styles.container}>
                <Text>Requesting permissions...</Text>
            </View>
        );
    }

    // Show an error message if either permission is denied.
    if (hasMediaPermission === false || hasCameraPermission === false) {
        return (
            <View style={styles.container}>
                <Text>Permissions denied: {hasMediaPermission ? '' : 'Media Library '} {hasCameraPermission ? '' : 'Camera'}</Text>
            </View>
        );
    }

    // Render the main UI with buttons to select an image or take a picture.
    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button title="Select Image from Gallery" onPress={handleImageFromGallery} />
                <Button title="Take Picture" onPress={handleImageFromCamera} />
            </View>
            <Text style={styles.text}>{extractedText}</Text>
        </View>
    );
};

// Styles for the component layout.
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