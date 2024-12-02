import React, { useState, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, Text, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";

const AgregarUbicacion = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const onLocationSelect = route.params?.onLocationSelect;

  const goToMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No se puede acceder a la ubicación.");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync();
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la ubicación.");
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const confirmarUbicacion = () => {
    if (!selectedLocation) {
      Alert.alert("Error", "Por favor selecciona una ubicación.");
      return;
    }
    if (onLocationSelect) {
      onLocationSelect(selectedLocation);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        onPress={handleMapPress}
      >
        {selectedLocation && <Marker coordinate={selectedLocation} />}
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.locationButton} onPress={goToMyLocation}>
          <Text>Mi ubicación</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={confirmarUbicacion}>
          <Text>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    subHeaderText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginVertical: 10,
    },
    map: {
        flex: 1,
        marginVertical: 10,
        borderRadius: 15,
        marginHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 20,
    },
    locationButton: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        backgroundColor: '#4169E1', // Azul del diseño
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
    confirmButton: {
        backgroundColor: '#32CD32', // Verde del diseño
        paddingVertical: 15,
        width: '90%',
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default AgregarUbicacion;
