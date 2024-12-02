import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Linking } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';

const ProductDetails = ({ route, navigation }) => {
  const { product } = route.params;
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [productImageUrl, setProductImageUrl] = useState(null); // State to store the image URL from Unsplash
  const { isLoggedIn, userId, userInfo } = useAuth();

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permisos necesarios', 'Se requieren permisos de ubicación.');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      } catch (error) {
        console.error('Error al obtener ubicación del usuario:', error);
        Alert.alert('Error', 'No se pudo obtener la ubicación del usuario.');
      }
    };

    fetchUserLocation();

    const fetchReviews = async () => {
      if (!product.producto_id) {
        console.error('Error: producto_id está indefinido.');
        return;
      }

      try {
        const response = await axios.get(
          `http://192.168.1.101:3000/opiniones/producto/${product.producto_id}`
        );
        setReviews(response.data);
      } catch (error) {
        console.error('Error al obtener opiniones:', error);
        Alert.alert('Error', 'No se pudieron cargar las opiniones.');
      }
    };

    const fetchProductImage = async () => {
      try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
          params: {
            query: product.nombre_producto || 'default',
            per_page: 1,
          },
          headers: {
            Authorization: `Client-ID ML8EDJv2Br2bJJMyTcksZRbEPQRcr4aKmnkt7LkB9Ww`,
          },
        });
        if (response.data.results.length > 0) {
          setProductImageUrl(response.data.results[0].urls.regular); // Set the URL of the first image
        }
      } catch (error) {
        console.error('Error al obtener la imagen de Unsplash:', error);
        Alert.alert('Error', 'No se pudo cargar la imagen.');
      }
    };

    fetchReviews();
    fetchProductImage(); // Fetch the image from Unsplash
  }, [product.producto_id, product.nombre_producto]);

  const handleNavigateToStore = () => {
    if (!userLocation) {
      Alert.alert('Error', 'No se pudo obtener la ubicación del usuario.');
      return;
    }

    const { latitud, longitud } = product.ubicacionInfo;
    if (!latitud || !longitud) {
      Alert.alert('Error', 'No se pudo obtener la ubicación de la tienda.');
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${latitud},${longitud}&travelmode=driving`;

    Linking.openURL(url).catch((err) => {
      console.error('Error al abrir Google Maps:', err);
      Alert.alert('Error', 'No se pudo abrir Google Maps.');
    });
  };

  const handleAddReview = async () => {
    if (!isLoggedIn) {
      Alert.alert('Error', 'Debes iniciar sesión para agregar una reseña.');
      return;
    }

    const rating = Math.min(5, Math.max(1, parseInt(newRating)));
    if (!newReview.trim() || rating <= 0) {
      Alert.alert('Error', 'Debe ingresar una reseña válida y una calificación entre 1 y 5.');
      return;
    }

    try {
      const newOpinion = {
        opinion_id: Date.now(),
        user_id: userId,
        producto_id: product.producto_id,
        calificacion: rating,
        comentario: newReview.trim(),
      };

      await axios.post('http://192.168.1.101:3000/opiniones', newOpinion);
      setReviews([ ...reviews, { ...newOpinion, usuario: userInfo.nombre_usuario } ]);
      setNewReview('');
      setNewRating('');
      setModalVisible(false);
      Alert.alert('Éxito', 'Reseña añadida exitosamente.');
    } catch (error) {
      console.error('Error al agregar reseña:', error);
      Alert.alert('Error', 'No se pudo agregar la reseña.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Botón Regresar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back-ios" size={20} color="#007BFF" />
        <Text style={styles.backButtonText}>Regresar</Text>
      </TouchableOpacity>

      {/* Información del producto */}
      <View style={styles.card}>
        <Text style={styles.storeName}>Líder</Text>
        <Image
          source={{ uri: productImageUrl || 'https://via.placeholder.com/150' }} // Use fetched image or fallback
          style={styles.productImage}
        />
        <Text style={styles.productName}>{product.nombre_producto}</Text>
        <Text style={styles.productPrice}>${product.precio}</Text>
        <Text style={styles.productDescription}>{product.descripcion}</Text>
        {/* Botón Ir a tienda */}
        <TouchableOpacity style={styles.navigateButton} onPress={handleNavigateToStore}>
          <Text style={styles.navigateButtonText}>Ir a tienda</Text>
        </TouchableOpacity>
      </View>

      {/* Sección de reseñas */}
      <View style={styles.reviewsHeader}>
        <Text style={styles.reviewsTitle}>Reseñas</Text>
        <TouchableOpacity
          style={styles.addReviewButton}
          onPress={() => (isLoggedIn ? setModalVisible(true) : Alert.alert('Error', 'Debes iniciar sesión para agregar una reseña.'))}
        >
          <FontAwesome name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <View key={review.opinion_id} style={styles.reviewCard}>
            <Text style={styles.reviewAuthor}>{review.usuario || 'Usuario desconocido'}:</Text>
            <View style={styles.reviewRating}>
              {Array.from({ length: review.calificacion }).map((_, i) => (
                <FontAwesome key={i} name="star" size={16} color="gold" />
              ))}
            </View>
            <Text style={styles.reviewText}>{review.comentario}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noReviewsText}>No hay reseñas para este producto.</Text>
      )}

      {/* Modal para agregar reseña */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Añadir Reseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu reseña..."
              placeholderTextColor="#888"
              value={newReview}
              onChangeText={setNewReview}
            />
            <TextInput
              style={styles.input}
              placeholder="Calificación (1-5)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={newRating}
              onChangeText={(value) => setNewRating(value.replace(/[^0-9]/g, ''))}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddReview}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007BFF',
    marginLeft: 5,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00C853',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  navigateButton: {
    backgroundColor: '#FF5722',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  navigateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addReviewButton: {
    backgroundColor: '#4169E1',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCard: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  reviewAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 14,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4169E1',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ProductDetails;
