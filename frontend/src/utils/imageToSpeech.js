import * as Speech from 'expo-speech';
import { callVisionOCR } from '../api/api';

// Extracts text from an image using Google Cloud Vision API.
export const extractText = async (imageUri) => {
    try {
        // Call the Vision API to perform OCR (Optical Character Recognition) on the image.
        const text = await callVisionOCR(imageUri);
        // Return the extracted text for further processing.
        return text;
    } catch (error) {
        // If OCR fails, throw an error with a descriptive message.
        throw new Error('Failed to extract text: ' + error.message);
    }
};

// Reads the given text aloud using the device's text-to-speech (TTS) capability.
export const readText = async (text) => {
    try {
        // Log the text that will be read aloud for debugging purposes.
        console.log('Starting TTS with text:', text);
        // Use expo-speech to read the text in English.
        await Speech.speak(text, {
            language: 'en',
        });
        // Log success confirmation after TTS completes.
        console.log('TTS completed successfully');
    } catch (error) {
        // Log any errors that occur during TTS and throw an exception.
        console.error('TTS error:', error.message);
        throw new Error('Failed to read text: ' + error.message);
    }
};

// Combines image text extraction and TTS to process an image and read the extracted text aloud.
export const imageToSpeechFunc = async (cameraRef) => {
    try {
        // Get the image URI from the provided camera reference (mocked for gallery/camera compatibility).
        const { uri } = await cameraRef.current.takePictureAsync();
        // Extract text from the image using the Vision API.
        const text = await extractText(uri);
        // Read the extracted text aloud using TTS.
        await readText(text);
        // Return the extracted text to display on the screen.
        return text;
    } catch (error) {
        // If any step fails, throw an error with a descriptive message.
        throw new Error('Image-to-speech failed: ' + error.message);
    }
};