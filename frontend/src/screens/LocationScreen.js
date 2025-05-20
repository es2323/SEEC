import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import * as Speech from 'expo-speech';
import ZoomableView from '../components/ZoomableView';

const fetchNearbyBusStops = async (latitude, longitude) => {
  const app_id = 'd0b31a43';
  const app_key = '225da684f903d19c96310dcf0d305b5c';
  const url = `https://transportapi.com/v3/uk/places.json?app_id=${app_id}&app_key=${app_key}&lat=${latitude}&lon=${longitude}&type=bus_stop`;
  const response = await fetch(url);
  const data = await response.json();
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
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission was denied.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setMapRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      let addresses = await Location.reverseGeocodeAsync(currentLocation.coords);
      if (addresses.length > 0) {
        const addr = addresses[0];
        setAddress(
          `${addr.name ? addr.name + ', ' : ''}${addr.street ? addr.street + ', ' : ''}${addr.city ? addr.city + ', ' : ''}${addr.region ? addr.region + ', ' : ''}${addr.postalCode ? addr.postalCode + ', ' : ''}${addr.country || ''}`
        );
      }
    })();
  }, []);

  const fetchStops = async () => {
    if (!location) return;
    try {
      const stops = await fetchNearbyBusStops(location.latitude, location.longitude);
      setNearbyStops(stops);
    } catch (error) {
      console.error('Error fetching bus stops:', error);
    }
  };

  const fetchLiveTimes = async (stop) => {
    setSelectedStop(stop);
    setLiveTimes(null);
    const app_id = 'd0b31a43';
    const app_key = '225da684f903d19c96310dcf0d305b5c';
    const url = `https://transportapi.com/v3/uk/bus/stop/${stop.atcocode}/live.json?app_id=${app_id}&app_key=${app_key}&group=route&limit=5&nextbuses=yes`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setLiveTimes(data.departures);
    } catch (error) {
      setLiveTimes({ error: 'Could not fetch live times.' });
    }
  };

  const speakContent = () => {
    let screenText = 'Location Screen. ';
    if (errorMsg) {
      screenText += `Error: ${errorMsg}.`;
    } else if (location) {
      if (address) {
        screenText += `Your approximate address is ${address}. `;
      }
      if (nearbyStops.length > 0) {
        screenText += 'Nearby bus stops are: ';
        nearbyStops.forEach((stop, index) => {
          screenText += `${stop.stop_name}`;
          if (index < nearbyStops.length - 1) {
            screenText += ', ';
          } else {
            screenText += '. ';
          }
        });
      } else {
        screenText += 'No nearby bus stops found.';
      }
      screenText += 'Press the Find Nearby Bus Stops button to update nearby stops.';
    } else {
      screenText += 'Fetching your current location...';
    }
    Speech.speak(screenText);
  };

  return (
    <ZoomableView>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }} accessibilityLabel="My Location">
          My Location
        </Text>
        {location ? (
          <>
            {address && (
              <Text accessibilityLabel={`Address: ${address}`}>
                Address: {address}
              </Text>
            )}
            <View style={{ marginVertical: 10 }}>
              <MapView
                style={styles.map}
                region={mapRegion}
                accessibilityLabel="Map showing your current location and nearby bus stops"
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="You are here"
                  description={address || ''}
                  pinColor="blue"
                  accessibilityLabel={`You are here at ${address || `latitude ${location.latitude}, longitude ${location.longitude}`}`}
                />
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
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
                <Button
                  title="Zoom In"
                  onPress={() => {
                    setMapRegion((prev) => ({
                      ...prev,
                      latitudeDelta: prev.latitudeDelta * 0.5,
                      longitudeDelta: prev.longitudeDelta * 0.5,
                    }));
                  }}
                  accessibilityLabel="Zoom in on the map"
                />
                <Button
                  title="Zoom Out"
                  onPress={() => {
                    setMapRegion((prev) => ({
                      ...prev,
                      latitudeDelta: prev.latitudeDelta * 2,
                      longitudeDelta: prev.longitudeDelta * 2,
                    }));
                  }}
                  accessibilityLabel="Zoom out on the map"
                />
              </View>
            </View>
          </>
        ) : (
          <Text accessibilityLabel={errorMsg || 'Fetching location...'}>{errorMsg || 'Fetching location...'}</Text>
        )}
        <Button
          title="Find Nearby Bus Stops"
          onPress={fetchStops}
          accessibilityLabel="Find nearby bus stops"
        />
        {nearbyStops.length > 0 ? (
          <View>
            <Text style={{ fontWeight: 'bold' }} accessibilityLabel="Nearby bus stops, tap for live times">
              Nearby Stops (tap for live times):
            </Text>
            {nearbyStops.map((stop, idx) => (
              <TouchableOpacity key={idx} onPress={() => fetchLiveTimes(stop)}>
                <Text style={{ color: 'blue' }} accessibilityLabel={`Bus stop: ${stop.stop_name}`}>
                  {stop.stop_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text accessibilityLabel="No nearby bus stops found.">No nearby stops found.</Text>
        )}
        {selectedStop && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold' }} accessibilityLabel={`Live times for ${selectedStop.stop_name}`}>
              Live Times for {selectedStop.stop_name}:
            </Text>
            {liveTimes && !liveTimes.error ? (
              Object.keys(liveTimes).map(route =>
                liveTimes[route].map((bus, idx) => (
                  <Text
                    key={idx}
                    accessibilityLabel={`Bus ${bus.line} to ${bus.direction}, departing at ${bus.best_departure_estimate}`}
                  >
                    {bus.line} to {bus.direction}: {bus.best_departure_estimate}
                  </Text>
                ))
              )
            ) : liveTimes && liveTimes.error ? (
              <Text accessibilityLabel={liveTimes.error}>{liveTimes.error}</Text>
            ) : (
              <Text accessibilityLabel="Loading live times...">Loading...</Text>
            )}
          </View>
        )}
        <View style={{ marginVertical: 20 }}>
          <Button
            title="Read Aloud"
            onPress={speakContent}
            accessibilityLabel="Read the contents of this page aloud"
          />
        </View>
      </ScrollView>
    </ZoomableView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: 300,
    marginVertical: 10,
  },
});

export default LocationScreen;