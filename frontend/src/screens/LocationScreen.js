import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";

// Fetch bus stops from TransportAPI
const fetchNearbyBusStops = async (latitude, longitude) => {
  const app_id = "d0b31a43";
  const app_key = "225da684f903d19c96310dcf0d305b5c";
  const url = `https://transportapi.com/v3/uk/places.json?app_id=${app_id}&app_key=${app_key}&lat=${latitude}&lon=${longitude}&type=bus_stop`;

  const response = await fetch(url);
  const data = await response.json();
  // Each stop has an 'atcocode' (NaPTAN code), 'name', and coordinates
  return data.member.map(stop => ({
    stop_name: stop.name,
    latitude: stop.latitude,
    longitude: stop.longitude,
    atcocode: stop.atcocode,
  }));
};

const LocationScreen = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [liveTimes, setLiveTimes] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);

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

  // Fetch stops from TransportAPI
  const fetchStops = async () => {
    if (!location) return;
    try {
      const stops = await fetchNearbyBusStops(location.latitude, location.longitude);
      setNearbyStops(stops);
    } catch (error) {
      console.error("Error fetching bus stops:", error);
    }
  };

  // Fetch live times for a selected stop
  const fetchLiveTimes = async (stop) => {
    setSelectedStop(stop);
    setLiveTimes(null);
    const app_id = "d0b31a43";
    const app_key = "225da684f903d19c96310dcf0d305b5c";
    const url = `https://transportapi.com/v3/uk/bus/stop/${stop.atcocode}/live.json?app_id=${app_id}&app_key=${app_key}&group=route&limit=5&nextbuses=yes`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setLiveTimes(data.departures);
    } catch (error) {
      setLiveTimes({ error: "Could not fetch live times." });
    }
  };

  const speakContent = () => {
    let screenText = "Location Screen. ";
    if (errorMsg) {
      screenText += `Error: ${errorMsg}.`;
    } else if (location) {
      if (address) {
        screenText += `Your approximate address is ${address}. `;
      }
      if (nearbyStops.length > 0) {
        screenText += "Nearby bus stops are: ";
        nearbyStops.forEach((stop, index) => {
          screenText += `${stop.stop_name}`;
          if (index < nearbyStops.length - 1) {
            screenText += ", ";
          } else {
            screenText += ". ";
          }
        });
      } else {
        screenText += "No nearby bus stops found.";
      }
      screenText += "Press the Find Nearby Bus Stops button to update nearby stops.";
    } else {
      screenText += "Fetching your current location...";
    }
    Speech.speak(screenText);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>My Location</Text>
        {location ? (
          <>
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
                  accessibilityLabel={`Nearby bus stop: ${stop.stop_name}`}
                />
              ))}
            </MapView>
          </>
        ) : (
          <Text accessibilityLabel={errorMsg || "Fetching location..."}>{errorMsg || "Fetching location..."}</Text>
        )}
        <Button title="Find Nearby Bus Stops" onPress={fetchStops} />
        {nearbyStops.length > 0 ? (
          <View>
            <Text style={{ fontWeight: "bold" }}>Nearby Stops (tap for live times):</Text>
            {nearbyStops.map((stop, idx) => (
              <TouchableOpacity key={idx} onPress={() => fetchLiveTimes(stop)}>
                <Text style={{ color: "blue" }}>
                  {stop.stop_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text accessibilityLabel="No nearby bus stops found.">No nearby stops found.</Text>
        )}
        {/* Show live times for the selected stop */}
        {selectedStop && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: "bold" }}>
              Live Times for {selectedStop.stop_name}:
            </Text>
            {liveTimes && !liveTimes.error ? (
              Object.keys(liveTimes).map(route =>
                liveTimes[route].map((bus, idx) => (
                  <Text key={idx}>
                    {bus.line} to {bus.direction}: {bus.best_departure_estimate}
                  </Text>
                ))
              )
            ) : liveTimes && liveTimes.error ? (
              <Text>{liveTimes.error}</Text>
            ) : (
              <Text>Loading...</Text>
            )}
          </View>
        )}
        {/* Always show the Read Aloud button after the stops list */}
        <View style={{ marginVertical: 20 }}>
          <Button
            title="Read Aloud"
            onPress={speakContent}
            accessibilityLabel="Read the contents of this page aloud"
          />
        </View>
      </ScrollView>
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