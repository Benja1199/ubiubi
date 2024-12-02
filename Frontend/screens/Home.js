import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ProductCard } from '../components/ProductCard';

const Home = () => {
  const [searchText, setSearchText] = useState('');
  const [ubicaciones, setUbicaciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);

  // Función para manejar la búsqueda
  const handleSearch = () => {
    if (searchText.trim()) {
      console.log(`Texto buscado: ${searchText}`);
      // Implementar búsqueda si es necesario
    }
  };

  // Obtener datos del servidor y ubicación actual
  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const response = await fetch('http://192.168.1.101:3000/tiendas/ubicacion');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setUbicaciones(data);
        } else {
          throw new Error('Formato inesperado de datos.');
        }
      } catch (error) {
        console.error('Error obteniendo ubicaciones:', error.message);
        setError('No se pudieron cargar las ubicaciones.');
      } finally {
        setLoading(false);
      }
    };

    const fetchProductos = async () => {
      try {
        const response = await fetch('http://192.168.1.101:3000/Productos');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        setProductos(data.slice(0, 4)); // Mostrar solo los primeros 4 productos
      } catch (error) {
        console.error('Error obteniendo productos:', error.message);
        setError('No se pudieron cargar los productos.');
      }
    };

    const fetchCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Permiso de ubicación denegado');
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error obteniendo la ubicación actual:', error.message);
        setError('No se pudo obtener la ubicación actual.');
      }
    };

    fetchUbicaciones();
    fetchProductos();
    fetchCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="¿Qué necesitas?"
          placeholderTextColor="#B0B0B0"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <FontAwesome name="search" size={20} color="#B0B0B0" />
        </TouchableOpacity>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: currentLocation?.latitude || -35.4355,
              longitude: currentLocation?.longitude || -71.6433,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            showsUserLocation = {true}
          >
            {/* Marcadores de ubicaciones */}
            {ubicaciones.length > 0 &&
              ubicaciones.map((ubicacion) => {
                const { ubicacionInfo } = ubicacion;
                if (ubicacionInfo && ubicacionInfo.latitud && ubicacionInfo.longitud) {
                  return (
                    <Marker
                      key={ubicacion._id}
                      coordinate={{
                        latitude: ubicacionInfo.latitud,
                        longitude: ubicacionInfo.longitud,
                      }}
                      title={ubicacion.nombre}
                      description={ubicacion.descripcion}
                    />
                  );
                }
                console.warn(`Ubicación inválida:`, ubicacion);
                return null;
              })}
          </MapView>
        )}
      </View>

      {/* Productos destacados */}
      <ScrollView contentContainerStyle={styles.productsContainer}>
        {productos.length > 0 ? (
          productos.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))
        ) : (
          <Text style={styles.errorText}>No hay productos para mostrar.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderColor: '#B0B0B0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  searchButton: {
    marginLeft: 10,
    padding: 5,
  },
  mapContainer: {
    height: 300,
    marginBottom: 10,
    borderRadius: 45,
  },
  map: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.4,
    borderRadius: 45,
    overflow: 'hidden',
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Home;
