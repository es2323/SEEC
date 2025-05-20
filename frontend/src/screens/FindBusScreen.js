import React, { useState, useRef } from "react";
import { View, Text, Button, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"; // Added Alert
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import { Audio } from "expo-av"; // Import Audio from expo-av
import MapView, { Marker } from 'react-native-maps'; // Assuming you have these imports for the MapView


// Fetch bus journey using Google Directions API (transit mode, bus only)
const getBusJourney = async (origin, destination) => {
  const apiKey = "AIzaSyArCo5izEub-54JZjKqsLW-qQTwWbkhiJo";
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(
    destination
  )}&mode=transit&transit_mode=bus&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

// Read aloud the journey steps
const speakJourney = (route) => {
  let text = "";
  route.legs[0].steps.forEach(step => {
    if (step.travel_mode === "TRANSIT" && step.transit_details) {
      const td = step.transit_details;
      text += `Take bus ${td.line.short_name} from ${td.departure_stop.name} at ${td.departure_time.text}. Get off at ${td.arrival_stop.name} at ${td.arrival_time.text}. `;
    } else {
      text += step.html_instructions.replace(/<[^>]+>/g, "") + ` (${step.distance.text}). `;
    }
  });
  text += `Arrival time: ${route.legs[0].arrival_time ? route.legs[0].arrival_time.text : "N/A"}.`;
  Speech.speak(text);
};

// Haversine formula for distance between two lat/lon points (in meters)
const getDistance = (lat1, lon1, lat2, lon2) => {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371e3; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const FindBusScreen = () => {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [journeys, setJourneys] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const watchId = useRef(null);

  // --- New State for Speech-to-Text ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFor, setRecordingFor] = useState(null); // 'start' or 'destination'
  const recording = useRef(null); // useRef to hold the Audio.Recording object
  const [uploading, setUploading] = useState(false);
  const [transcribing, setTranscribing] = useState(false); // New state for transcription status
  const [transcriptionProgress, setTranscriptionProgress] = useState(0); // For future use if backend sends progress

  // --- New Speech-to-Text Functions ---
  const startRecording = async (forField) => {
    try {
      setRecordingFor(forField);
      setIsRecording(true);
      setUploading(false); // Reset upload status
      setTranscribing(false); // Reset transcribing status
      setError(""); // Clear any previous errors

      console.log('Requesting audio recording permissions');
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Denied', 'Permission to record audio was denied!');
        setIsRecording(false);
        setRecordingFor(null);
        return;
      }
      console.log('Setting up audio recorder');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true, // Allows other audio to duck when recording starts (Android)
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX, // Recording takes precedence
        staysActiveInBackground: false, // Don't keep active in background for recording
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS, // Recording allows other audio to mix (iOS)
      });
      
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      recording.current = newRecording; // Store the recording object in ref
      await recording.current.startAsync();
      
      console.log('Started recording!');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Recording Error', 'Failed to start recording: ' + err.message);
      setIsRecording(false);
      setRecordingFor(null);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false); // Update UI immediately
      if (!recording.current) {
        console.warn('No recording object to stop.');
        setRecordingFor(null);
        return;
      }

      await recording.current.stopAndUnloadAsync();
      // Reset audio mode to prevent interfering with other app sounds after recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, // Turn off recording capabilities
        playsInSilentModeIOS: true, // Allow background playback
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      });

      const uri = recording.current.getURI();
      console.log('Recording stopped and stored at', uri);
      
      recording.current = null; // Clear the ref
      
      await uploadAndTranscribe(uri); // Call function to upload and transcribe
      setRecordingFor(null); // Clear which field was being recorded for
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Recording Error', 'Failed to stop recording: ' + err.message);
      setRecordingFor(null);
    }
  };

  const uploadAndTranscribe = async (fileUri) => {
    setUploading(true);
    setTranscribing(true);
    setError(""); // Clear previous errors

    const formData = new FormData();
    formData.append('audio_file', {
      uri: fileUri,
      name: `audio_${Date.now()}.m4a`, // Expo AV often saves as .m4a or .caf on iOS, .aac on Android
      type: 'audio/m4a', // Defaulting to m4a, adjust if you confirm a different format
    });

    try {
      // IMPORTANT: Replace with your actual backend URL
      const response = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      setUploading(false);
      setTranscribing(false);

      if (response.ok && data?.transcription) {
        console.log('Transcription successful:', data.transcription);
        if (recordingFor === 'start') {
          setStart(data.transcription);
        } else if (recordingFor === 'destination') {
          setDestination(data.transcription);
        }
        Alert.alert('Transcription Success', `Recognized: "${data.transcription}"`);
      } else {
        const errorMessage = data?.error || 'Unknown transcription error';
        console.error('Transcription failed:', errorMessage);
        setError(`Transcription failed: ${errorMessage}`);
        Alert.alert('Transcription Failed', errorMessage);
      }
    } catch (error) {
      setUploading(false);
      setTranscribing(false);
      console.error('Error sending audio to backend:', error);
      setError('Failed to send audio for transcription. Check backend server.');
      Alert.alert('Network Error', 'Failed to connect to transcription service. Is your backend running?');
    }
  };


  // All your existing functions remain exactly the same
  const handleFindBuses = async () => {
    setError("");
    setJourneys([]);
    setLoading(true);
    setNavigating(false);
    setCurrentStep(0);
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;
    }
    try {
      const data = await getBusJourney(start, destination);
      setLoading(false);
      if (data.status !== "OK" || !data.routes.length) {
        setError("No bus journeys found.");
        return;
      }
      setJourneys(data.routes);
    } catch (err) {
      setLoading(false);
      setError("Could not find a bus journey.");
    }
  };

  const getInitialRegion = (route) => {
    if (!route || !route.legs || !route.legs[0]) return null;
    const startLoc = route.legs[0].start_location;
    return {
      latitude: startLoc.lat,
      longitude: startLoc.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  const startJourney = async (route) => {
    setNavigating(true);
    setCurrentStep(0);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Location permission was denied.");
      setNavigating(false);
      return;
    }
    const steps = route.legs[0].steps;
    watchId.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 10 },
      (loc) => {
        if (!navigating) return;
        if (currentStep < steps.length) {
          const step = steps[currentStep];
          const { lat, lng } = step.start_location;
          const distance = getDistance(
            loc.coords.latitude,
            loc.coords.longitude,
            lat,
            lng
          );
          if (distance < 40) {
            let instruction = "";
            if (step.travel_mode === "TRANSIT" && step.transit_details) {
              const td = step.transit_details;
              instruction = `Take bus ${td.line.short_name} from ${td.departure_stop.name} at ${td.departure_time.text}. Get off at ${td.arrival_stop.name} at ${td.arrival_time.text}.`;
            } else {
              instruction = step.html_instructions.replace(/<[^>]+>/g, "") + ` (${step.distance.text})`;
            }
            Speech.speak(instruction);
            setCurrentStep((prev) => prev + 1);
          }
        } else {
          Speech.speak("You have arrived at your destination.");
          stopJourney();
        }
      }
    );
  };

  const stopJourney = () => {
    setNavigating(false);
    setCurrentStep(0);
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;
    }
    Speech.speak("Journey navigation stopped.");
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.header} accessibilityRole="header">Find Bus Journeys</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Start location (address or postcode)"
          value={start}
          onChangeText={setStart}
          accessibilityLabel="Enter your start location"
          accessibilityRole="search"
        />
        <TouchableOpacity 
          style={[styles.voiceButton, isRecording && recordingFor === 'start' && styles.voiceButtonActive]}
          onPressIn={() => startRecording('start')}
          onPressOut={stopRecording}
          accessibilityLabel="Press and hold to speak start location"
        >
          <Text style={styles.voiceButtonText}>🎤</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Destination (address or postcode)"
          value={destination}
          onChangeText={setDestination}
          accessibilityLabel="Enter your destination"
          accessibilityRole="search"
        />
        <TouchableOpacity 
          style={[styles.voiceButton, isRecording && recordingFor === 'destination' && styles.voiceButtonActive]}
          onPressIn={() => startRecording('destination')}
          onPressOut={stopRecording}
          accessibilityLabel="Press and hold to speak destination"
        >
          <Text style={styles.voiceButtonText}>🎤</Text>
        </TouchableOpacity>
      </View>
      
      <Button
        title="Find Buses"
        onPress={handleFindBuses}
        accessibilityLabel="Find bus journeys"
        accessibilityRole="button"
      />

      {/* New status indicators for upload and transcription */}
      {uploading && <Text style={styles.statusText}>Uploading audio...</Text>}
      {transcribing && <Text style={styles.statusText}>Transcribing with AssemblyAI...</Text>}
      
      {loading && <Text style={styles.statusText}>Loading bus journeys...</Text>}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {journeys.length > 0 && (
        <View style={{ height: 300, marginVertical: 20 }}>
          <MapView
            style={{ flex: 1 }}
            provider="google"
            initialRegion={getInitialRegion(journeys[0])}
            accessibilityLabel="Map showing the start and destination of the journey"
          >
            <Marker
              coordinate={{
                latitude: journeys[0].legs[0].start_location.lat,
                longitude: journeys[0].legs[0].start_location.lng,
              }}
              title="Start"
              color="blue"
              accessibilityLabel="Journey start location"
            />
            <Marker
              coordinate={{
                latitude: journeys[0].legs[0].end_location.lat,
                longitude: journeys[0].legs[0].end_location.lng,
              }}
              title="Destination"
              color="red"
              accessibilityLabel="Journey destination"
            />
          </MapView>
        </View>
      )}

      {journeys.length > 0 && (
        <Button
          title={navigating ? "Stop Journey" : "Start Journey"}
          onPress={() =>
            navigating ? stopJourney() : startJourney(journeys[0])
          }
          color={navigating ? "#d9534f" : "#007AFF"}
          accessibilityLabel={navigating ? "Stop journey navigation" : "Start journey navigation with audio"}
        />
      )}

      {journeys.length > 0 &&
        journeys.map((route, idx) => (
          <View
            key={idx}
            style={styles.journeyBox}
            accessible
            accessibilityLabel={`Journey option ${idx + 1}`}
          >
            <Text style={styles.subheader}>Journey {idx + 1}:</Text>
            <Button
              title="Read Aloud"
              onPress={() => speakJourney(route)}
              accessibilityLabel="Read this journey aloud"
              accessibilityRole="button"
              color="#228B22"
            />
            {route.legs[0].steps.map((step, sidx) => {
              if (step.travel_mode === "TRANSIT" && step.transit_details) {
                const td = step.transit_details;
                return (
                  <Text
                    key={sidx}
                    style={styles.stepText}
                    accessibilityLabel={`Take bus ${td.line.short_name} from ${td.departure_stop.name} at ${td.departure_time.text}. Get off at ${td.arrival_stop.name} at ${td.arrival_time.text}.`}
                  >
                    🚌 Take bus {td.line.short_name} from "{td.departure_stop.name}" at {td.departure_time.text}.{"\n"}
                    Get off at "{td.arrival_stop.name}" at {td.arrival_time.text}.
                  </Text>
                );
              } else {
                return (
                  <Text
                    key={sidx}
                    style={styles.stepText}
                    accessibilityLabel={step.html_instructions.replace(/<[^>]+>/g, "")}
                  >
                    🚶 {step.html_instructions.replace(/<[^>]+>/g, "")} ({step.distance.text})
                  </Text>
                );
              }
            })}
            <Text style={styles.arrivalText}>
              Arrival time: {route.legs[0].arrival_time ? route.legs[0].arrival_time.text : "N/A"}
            </Text>
          </View>
        ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: { fontWeight: "bold", fontSize: 26, marginBottom: 14, color: "#222" },
  subheader: { fontWeight: "bold", marginTop: 15, fontSize: 20, color: "#222" },
  inputContainer: { // Added style for the new View surrounding TextInput and TouchableOpacity
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  input: { 
    flex: 1, // Added flex to make TextInput take available space
    borderWidth: 2, 
    borderColor: "#222", 
    padding: 12, 
    borderRadius: 7, 
    fontSize: 18, 
    backgroundColor: "#fff" 
  },
  journeyBox: { backgroundColor: "#fffbe6", padding: 14, marginVertical: 14, borderRadius: 10, borderColor: "#222", borderWidth: 1 },
  stepText: { fontSize: 18, marginVertical: 4, color: "#222" },
  arrivalText: { fontWeight: "bold", marginTop: 10, fontSize: 18, color: "#222" },
  statusText: { fontSize: 18, color: "#222", marginVertical: 10 },
  errorText: { color: "#b00020", fontSize: 18, marginVertical: 10 },
  voiceButton: { // New style for the microphone button
    padding: 12,
    marginLeft: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  voiceButtonActive: { // Style for when recording is active
    backgroundColor: '#ffcccc', // Light red to indicate active recording
  },
  voiceButtonText: {
    fontSize: 20,
  },
});

export default FindBusScreen;