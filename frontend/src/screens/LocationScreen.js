import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Dimensions } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";

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

  const sendLocationToBackend = async () => {
    if (!location) return;

    const locationData = {
      latitude: location.latitude,
      longitude: location.longitude
    };

    try {
      const response = await fetch("http://192.168.0.42:8000/api/user-location/", { // Adjust with your own IP address(SEEC members)
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
        setNearbyStops(data.nearby_stops || []);
      } catch (e) {
        return;
      }
    } catch (error) {
      console.error("Error sending location:", error);
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
      <Button title="Send Location" onPress={sendLocationToBackend} />
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