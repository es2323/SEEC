import React, { useState, useRef } from "react";
import { View, Text, Button, StyleSheet, ScrollView, TextInput } from "react-native";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline";

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

// Decode polyline to coordinates
const getPolylineCoords = (overview_polyline) => {
  if (!overview_polyline || !overview_polyline.points) return [];
  return polyline.decode(overview_polyline.points).map(([latitude, longitude]) => ({
    latitude,
    longitude,
  }));
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

  // Use current location for start
  const useCurrentLocation = async () => {
    try {
      setLoading(true);
      setError("");
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission was denied.");
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      let addresses = await Location.reverseGeocodeAsync(location.coords);
      if (addresses.length > 0) {
        const addr = addresses[0];
        const addressString = `${addr.name ? addr.name + ", " : ""}${addr.street ? addr.street + ", " : ""}${addr.city ? addr.city + ", " : ""}${addr.region ? addr.region + ", " : ""}${addr.postalCode ? addr.postalCode + ", " : ""}${addr.country || ""}`;
        setStart(addressString);
      } else {
        setError("Could not determine address from location.");
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to get current location.");
      setLoading(false);
    }
  };

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
      <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholder="Start location (address or postcode)"
        value={start}
        onChangeText={setStart}
        accessibilityLabel="Enter your start location"
        accessibilityRole="search"
      />
      
    </View>
    <Button
        title="Use Current Location"
        onPress={useCurrentLocation}
        accessibilityLabel="Use your current location as the start"
      />
      <TextInput
        style={styles.input}
        placeholder="Destination (address or postcode)"
        value={destination}
        onChangeText={setDestination}
        accessibilityLabel="Enter your destination"
        accessibilityRole="search"
      />
      <Button
        title="Find Buses"
        onPress={handleFindBuses}
        accessibilityLabel="Find bus journeys"
        accessibilityRole="button"
      />
      {loading && <Text style={styles.statusText}>Loading...</Text>}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {journeys.length > 0 && (
        <View style={{ height: 300, marginVertical: 20 }}>
          <MapView
            style={{ flex: 1 }}
            provider="google"
            initialRegion={getInitialRegion(journeys[0])}
            accessibilityLabel="Map showing the start and destination of the journey"
          >
            {/* Polyline for the route */}
            {journeys[0].overview_polyline && (
              <Polyline
                coordinates={getPolylineCoords(journeys[0].overview_polyline)}
                strokeColor="#007AFF"
                strokeWidth={4}
              />
            )}
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
  input: { borderWidth: 2, borderColor: "#222", padding: 12, marginVertical: 10, borderRadius: 7, fontSize: 18, backgroundColor: "#fff" },
  journeyBox: { backgroundColor: "#fffbe6", padding: 14, marginVertical: 14, borderRadius: 10, borderColor: "#222", borderWidth: 1 },
  stepText: { fontSize: 18, marginVertical: 4, color: "#222" },
  arrivalText: { fontWeight: "bold", marginTop: 10, fontSize: 18, color: "#222" },
  statusText: { fontSize: 18, color: "#222", marginVertical: 10 },
  errorText: { color: "#b00020", fontSize: 18, marginVertical: 10 }
});

export default FindBusScreen;