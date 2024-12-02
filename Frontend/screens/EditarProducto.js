import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../components/Header';
import BotonFooter from '../components/BotonFooter';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';

const EditarProducto = ({ navigation }) => {
  const { userId } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(`http://192.168.1.101:3000/products/${userId}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [userId]);

  const handleProductSelection = () => {
    if (products.length === 0) {
      Alert.alert('Error', 'No tienes productos para editar.');
      return;
    }

    Alert.alert('Seleccionar producto', 'Elige un producto:', [
      ...products.map((product) => ({
        text: product.name,
        onPress: () => handleProductChange(product),
      })),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleProductChange = (product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setImage(product.image || null);
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere acceso a la galería para continuar');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara para continuar');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleSaveProduct = async () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Por favor selecciona un producto primero.');
      return;
    }

    const updatedProduct = {
      ...selectedProduct,
      name: productName,
      description,
      price: parseFloat(price),
      image,
    };

    try {
      await axios.put(`http://192.168.0.104:3000/products/${selectedProduct.id}`, updatedProduct);
      Alert.alert('Producto actualizado', `El producto "${updatedProduct.name}" ha sido actualizado.`);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar el producto.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Botón de regreso */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#007BFF" />
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Editar Producto</Text>

          {/* Selección de producto */}
          <TouchableOpacity style={styles.dropdownButton} onPress={handleProductSelection}>
            <Text style={styles.dropdownButtonText}>
              {selectedProduct ? selectedProduct.name : 'Seleccionar producto'}
            </Text>
          </TouchableOpacity>

          {/* Nombre del producto */}
          <TextInput
            style={styles.input}
            placeholder="Nombre del producto"
            placeholderTextColor="#B0B0B0"
            value={productName}
            onChangeText={setProductName}
          />

          {/* Descripción */}
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            placeholderTextColor="#B0B0B0"
            value={description}
            onChangeText={setDescription}
          />

          {/* Precio */}
          <TextInput
            style={styles.input}
            placeholder="Precio"
            placeholderTextColor="#B0B0B0"
            value={price}
            onChangeText={(text) => {
              if (/^\d*$/.test(text)) setPrice(text);
            }}
            keyboardType="numeric"
          />

          {/* Imagen */}
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity style={styles.removeButton} onPress={handleRemoveImage}>
                <Text style={styles.removeButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imageButton}
              onPress={() =>
                Alert.alert('Subir imagen', 'Selecciona una opción', [
                  { text: 'Cámara', onPress: handleCamera },
                  { text: 'Galería', onPress: handleImagePicker },
                  { text: 'Cancelar', style: 'cancel' },
                ])
              }
            >
              <Text style={styles.imageButtonText}>Subir imagen</Text>
            </TouchableOpacity>
          )}

          {/* Botón de guardar */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <BotonFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007BFF',
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#FFFBEA',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  dropdownButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFF7C5',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    marginBottom: 15,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#000',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    color: '#000',
  },
  imageButton: {
    width: '60%',
    height: 50,
    backgroundColor: '#5FBBFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  imageButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 15,
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default EditarProducto;
