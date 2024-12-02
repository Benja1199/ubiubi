import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';

// Función para calcular la distancia entre dos coordenadas (fórmula de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en kilómetros
};

// Componente para mostrar cada tarjeta de producto
const ProductCard = ({ product, navigation }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
          headers: {
            Authorization: `Client-ID ML8EDJv2Br2bJJMyTcksZRbEPQRcr4aKmnkt7LkB9Ww`,
          },
          params: {
            query: product.nombre_producto,
            per_page: 1,
          },
        });

        if (response.data.results?.length > 0) {
          setImageUrl(response.data.results[0].urls.small);
        }
      } catch (error) {
        console.error('Error al obtener la imagen:', error);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchImage();
  }, [product.nombre_producto]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetails', { product })}
    >
      {loadingImage ? (
        <ActivityIndicator size="small" color="#000" />
      ) : imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
      ) : (
        <Text style={styles.noImageText}>Sin imagen</Text>
      )}
      <Text style={styles.productName}>{product.nombre_producto}</Text>
      <Text style={styles.productPrice}>Precio: ${product.precio}</Text>
      <Text style={styles.productDescription}>{product.descripcion}</Text>
      <Text style={styles.productCategory}>
        Categoría: {product.categoriaInfo?.nombre_categoria || 'Sin categoría'}
      </Text>
    </TouchableOpacity>
  );
};

// Componente principal para la pantalla de productos
const Productos = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [priceOrder, setPriceOrder] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permisos necesarios',
            'Se necesitan permisos de ubicación para filtrar productos cercanos.'
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error al obtener la ubicación:', error);
      }
    };

    fetchLocation();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://192.168.1.101:3000/categorias');
      setCategories([{ nombre_categoria: 'Todos', categoria_id: null }, ...response.data]);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchProducts = async (categoriaId = null) => {
    setLoading(true);
    try {
      const endpoint =
        categoriaId && categoriaId !== 'Todos'
          ? `http://192.168.1.101:3000/productos/categoria/${categoriaId}`
          : 'http://192.168.1.101:3000/productos/ubicacion';
      const response = await axios.get(endpoint);

      console.log('Productos recibidos:', response.data); // Depuración

      const activeProducts = response.data.filter((product) => product.estado === 'activo');
      console.log('Productos activos:', activeProducts); // Depuración

      if (userLocation) {
        const nearbyProducts = activeProducts.filter((product) => {
          const { latitud, longitud } = product.ubicacionInfo || {};
          if (!latitud || !longitud) return false;
          return calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            latitud,
            longitud
          ) <= 5;
        });
        setProducts(nearbyProducts);
      } else {
        setProducts(activeProducts);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter((product) =>
      searchText
        ? product.nombre_producto.toLowerCase().includes(searchText.toLowerCase())
        : true
    )
    .sort((a, b) => {
      const priceA = parseFloat(a.precio); // Convertimos a número para garantizar la comparación correcta
      const priceB = parseFloat(b.precio);

      if (priceOrder === 'asc') {
        return priceA - priceB; // Orden ascendente (menor a mayor)
      } else if (priceOrder === 'desc') {
        return priceB - priceA; // Orden descendente (mayor a menor)
      } else {
        return 0; // Sin ordenamiento si `priceOrder` es null
      }
    });

  console.log('Productos filtrados:', filteredProducts); // Depuración

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder="¿Qué necesitas?"
              placeholderTextColor="#B0B0B0"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.searchButton}>
              <FontAwesome name="search" size={20} color="#B0B0B0" />
            </TouchableOpacity>
          </View>

          <View style={styles.filtersContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.filterText}>Categoría: {categoryFilter}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, priceOrder && styles.activeFilter]}
              onPress={() =>
                setPriceOrder(priceOrder === 'asc' ? 'desc' : priceOrder === 'desc' ? null : 'asc')
              }
            >
              <Text style={styles.filterText}>
                {priceOrder === 'asc'
                  ? 'Mayor a menor'
                  : priceOrder === 'desc'
                  ? 'Menor a mayor'
                  : 'Ordenar por precio'}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal visible={isModalVisible} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Selecciona una categoría</Text>
                <FlatList
                  data={categories}
                  keyExtractor={(item, index) => `${item.nombre_categoria}-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setCategoryFilter(item.nombre_categoria);
                        fetchProducts(item.categoria_id);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{item.nombre_categoria}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <ScrollView contentContainerStyle={styles.productsContainer}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard
                  key={`${product._id}-${index}`}
                  product={product}
                  navigation={navigation}
                />
              ))
            ) : (
              <Text style={styles.noProductsText}>No se encontraron productos</Text>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};
export default Productos;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  searchBar: {
    flex: 1,
    height: 40,
    color: '#000',
  },
  searchButton: {
    marginLeft: 10,
  },
  filtersContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: '#4169E1',
  },
  filterText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  modalItemText: {
    fontSize: 16,
    color: '#000',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    elevation: 2,
    width: '48%',
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  noImageText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginVertical: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
  },
  noProductsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});