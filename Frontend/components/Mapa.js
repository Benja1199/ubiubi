import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Dimensions, TouchableOpacity, Text } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native'; // Agregado useRoute

const Mapa = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute(); // Obtener parámetros de navegación
  const fromPerfilTienda = route.params?.fromPerfilTienda || false; // Parámetro opcional
  const [selectedLocation, setSelectedLocation] = useState(null); // Nueva ubicación seleccionada

  // Lista de marcadores
  const [markers, setMarkers] = useState([
    {
      id: 1,
      title: 'Lugar A',
      description: 'Descripción del Lugar A',
      latitude: 37.78825,
      longitude: -122.4324,
    },
    {
      id: 2,
      title: 'Lugar B',
      description: 'Descripción del Lugar B',
      latitude: 37.78925,
      longitude: -122.4334,
    },
    {
      id: 3,
      title: 'Lugar C',
      description: 'Descripción del Lugar C',
      latitude: 37.79025,
      longitude: -122.4344,
    },
  ]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se puede acceder a la ubicación');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
      setLoading(false);
    })();
  }, []);

  // Función para mover el mapa al marcador con mucho zoom
  const zoomToMarker = (latitude, longitude) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        },
        1000 // Duración de la animación
      );
    }
  };

  // Función para ir a la ubicación actual
  const goToMyLocation = async () => {
    if (!location) {
      Alert.alert('Ubicación no disponible', 'No se puede obtener tu ubicación actual.');
      return;
    }

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
    }
  };

  // Manejar selección en el mapa
  const handleMapPress = (event) => {
    if (fromPerfilTienda) { // Solo permitir si viene de PerfilTienda
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setSelectedLocation({ latitude, longitude });
    }
  };

  // Guardar ubicación seleccionada
  const saveLocation = () => {
    if (selectedLocation) {
      console.log('Ubicación seleccionada:', selectedLocation);
      navigation.navigate('PerfilTienda', { location: selectedLocation });
    } else {
      Alert.alert('Error', 'Selecciona una ubicación en el mapa.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 37.78825,
          longitude: location?.coords.longitude || -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        onPress={handleMapPress}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
            onPress={() => zoomToMarker(marker.latitude, marker.longitude)}
          />
        ))}
        {selectedLocation && fromPerfilTienda && (
          <Marker
            coordinate={selectedLocation}
            pinColor="blue"
          />
        )}
      </MapView>

      {fromPerfilTienda && ( // Mostrar solo si viene de PerfilTienda
        <TouchableOpacity style={styles.saveButton} onPress={saveLocation}>
          <Text style={styles.saveButtonText}>Guardar ubicación</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.locationButton} onPress={goToMyLocation}>
        <FontAwesome name="location-arrow" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.4,
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 10,
  },
  locationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4169E1',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  saveButton: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: '#32CD32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Mapa;
