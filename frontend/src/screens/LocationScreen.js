import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Dimensions } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";

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
        setErrorMsg("Permission denied");
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

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>My Location</Text>
      {location ? (
        <>
          <Text>Latitude: {location.latitude}, Longitude: {location.longitude}</Text>
          {address && <Text>Address: {address}</Text>}
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
              />
            ))}
          </MapView>
        </>
      ) : (
        <Text>{errorMsg || "Fetching location..."}</Text>
      )}
      <Button title="Find Nearby Bus Stops" onPress={fetchStops} />
      {nearbyStops.length > 0 ? (
        <View>
          <Text>Nearby Stops:</Text>
          {nearbyStops.map((stop, idx) => (
            <Text key={idx}>
              {stop.stop_name} ({stop.latitude}, {stop.longitude})
            </Text>
          ))}
        </View>
      ) : (
        <Text>No nearby stops found.</Text>
      )}
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