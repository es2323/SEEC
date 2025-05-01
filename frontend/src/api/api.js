import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

// Base URL for our Django backend API, used for user signup and login.
const API_URL = 'http://192.168.0.94:8000/api/';
// URL for Google Cloud Vision API to perform OCR (text extraction from images), using the API key from app.json.
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${Constants.expoConfig.extra.visionApiKey}`;

// Create an axios instance for making HTTP requests to our backend API.
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // Set a timeout of 10 seconds for requests.
    headers: {
        'Content-Type': 'application/json', // Ensure all requests use JSON format.
    },
});

// Function to create a new user account by sending a POST request to the backend.
export const createUser = async (username, email, password, gdprConsent) => {
    try {
        // Send user details to the backend to create a new account.
        const response = await api.post('create-user/', {
            username,
            email,
            password,
            gdpr_consent: gdprConsent, // Include GDPR consent flag as required by the backend.
        });
        // Return the response data (e.g., success message or user ID).
        return response.data;
    } catch (error) {
        // Log any errors that occur during the request for debugging.
        console.error('Error creating user:', error.response?.data || error.message);
        // Throw the error response or a default error message if the request fails.
        throw error.response?.data || { error: 'Failed to create user' };
    }
};

// Function to log in a user by sending a POST request to the backend.
export const loginUser = async (email, password) => {
    try {
        // Send email and password to the backend to authenticate the user.
        const response = await api.post('login/', { email, password });
        // Return the response data (e.g., success message, user ID, or username).
        return response.data;
    } catch (error) {
        // Log any errors that occur during login for debugging.
        console.error('Error logging in:', error.response?.data || error.message);
        // Throw the error response or a default error message if login fails.
        throw error.response?.data || { error: 'Login failed' };
    }
};

// Function to extract text from an image using Google Cloud Vision API's OCR.
export const callVisionOCR = async (imageUri) => {
    try {
        // Read the image file and convert it to a Base64-encoded string for the API.
        const base64Image = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Prepare the request body for the Vision API to detect text in the image.
        const requestBody = {
            requests: [
                {
                    image: {
                        content: base64Image, // The Base64-encoded image data.
                    },
                    features: [
                        {
                            type: 'TEXT_DETECTION', // Specify that we want to detect text.
                        },
                    ],
                },
            ],
        };

        // Send the request to the Vision API to perform OCR.
        const response = await axios.post(VISION_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json', // Ensure the request uses JSON format.
            },
        });

        // Extract the detected text from the response, or return a default message if no text is found.
        const text = response.data.responses[0]?.textAnnotations[0]?.description || 'No text detected';
        // Return the extracted text for further processing (e.g., TTS).
        return text;
    } catch (error) {
        // Log any errors that occur during OCR for debugging.
        console.error('Error in OCR:', error.response?.data || error.message);
        // Throw the error response or a default error message if OCR fails.
        throw error.response?.data || { error: 'OCR failed' };
    }
};