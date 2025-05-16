import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Dimensions } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import ReactNativeTTS from 'react-native-tts';

// Function to fetch nearby bus stops from OpenStreetMap Overpass API
const fetchNearbyBusStops = async (latitude, longitude) => {
  const radius = 500; // meters
  const query = `
    [out:json];
    node
      [highway=bus_stop]
      (around:${radius},${latitude},${longitude});
    out;
  `;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`
  });
  const data = await response.json();
  return data.elements.map(el => ({
    stop_name: el.tags?.name || "Unnamed Stop",
    latitude: el.lat,
    longitude: el.lon
  }));
};

const LocationScreen = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyStops, setNearbyStops] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Location permission was denied.");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      let addresses = await Location.reverseGeocodeAsync(currentLocation.coords);
      if (addresses.length > 0) {
        const addr = addresses[0];
        setAddress(
          `${addr.name ? addr.name + ", " : ""}${addr.street ? addr.street + ", " : ""}${addr.city ? addr.city + ", " : ""}${addr.region ? addr.region + ", " : ""}${addr.postalCode ? addr.postalCode + ", " : ""}${addr.country || ""}`
        );
      }
    })();
  }, []);

  // Fetch nearby bus stops from OpenStreetMap
  const fetchStops = async () => {
    if (!location) return;
    try {
      const stops = await fetchNearbyBusStops(location.latitude, location.longitude);
      setNearbyStops(stops);
    } catch (error) {
      console.error("Error fetching bus stops:", error);
    }
  };

  const speakContent = () => {
    let screenText = "Location Screen. ";
    if (errorMsg) {
      screenText += `Error: ${errorMsg}.`;
    } else if (location) {
      screenText += `Your current location is latitude ${location.latitude}, longitude ${location.longitude}. `;
      if (address) {
        screenText += `Your approximate address is ${address}. `;
      }
      if (nearbyStops.length > 0) {
        screenText += "Nearby bus stops are: ";
        nearbyStops.forEach((stop, index) => {
          screenText += `${stop.stop_name} at latitude ${stop.latitude}, longitude ${stop.longitude}`;
          if (index < nearbyStops.length - 1) {
            screenText += ", ";
          } else {
            screenText += ". ";
          }
        });
      } else {
        screenText += "No nearby bus stops found.";
      }
      screenText += "Press the Send Location button to update nearby stops.";
    } else {
      screenText += "Fetching your current location...";
    }
    ReactNativeTTS.speak(screenText);
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>My Location</Text>
      {location ? (
        <>
          <Text accessibilityLabel={`Latitude: ${location.latitude}`}>Latitude: {location.latitude}</Text>
          <Text accessibilityLabel={`Longitude: ${location.longitude}`}>Longitude: {location.longitude}</Text>
          {address && <Text accessibilityLabel={`Address: ${address}`}>Address: {address}</Text>}
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            accessibilityLabel="Map showing your current location and nearby bus stops"
          >
            {/* User location marker */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
              description={address || ""}
              pinColor="blue"
              accessibilityLabel={`You are here at ${address || `latitude ${location.latitude}, longitude ${location.longitude}`}`}
            />
            {/* Nearby stops markers */}
            {nearbyStops.map((stop, idx) => (
              <Marker
                key={idx}
                coordinate={{
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                }}
                title={stop.stop_name}
                pinColor="red"
                accessibilityLabel={`Nearby bus stop: ${stop.stop_name} at latitude ${stop.latitude}, longitude ${stop.longitude}`}
              />
            ))}
          </MapView>
        </>
      ) : (
        <Text accessibilityLabel={errorMsg || "Fetching location..."}>{errorMsg || "Fetching location..."}</Text>
      )}
<<<<<<< HEAD
      <Button title="Find Nearby Bus Stops" onPress={fetchStops} />
=======
      <Button title="Send Location" onPress={sendLocationToBackend} accessibilityLabel="Send your current location to find nearby bus stops" />
>>>>>>> 09e4755f66e260510ce18ae93554e5fe34e4e31f
      {nearbyStops.length > 0 ? (
        <View>
          <Text style={{ fontWeight: "bold" }}>Nearby Stops:</Text>
          {nearbyStops.map((stop, idx) => (
            <Text key={idx} accessibilityLabel={`Nearby stop: ${stop.stop_name} at latitude ${stop.latitude}, longitude ${stop.longitude}`}>
              {stop.stop_name} ({stop.latitude}, {stop.longitude})
            </Text>
          ))}
        </View>
      ) : (
        <Text accessibilityLabel="No nearby bus stops found.">No nearby stops found.</Text>
      )}
      <Button
        title="Read Aloud"
        onPress={speakContent}
        accessibilityLabel="Read the contents of this page aloud"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get("window").width,
    height: 300,
    marginVertical: 10,
  },
});

export default LocationScreen;