import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const UNSPLASH_ACCESS_KEY = 'ML8EDJv2Br2bJJMyTcksZRbEPQRcr4aKmnkt7LkB9Ww';

// Componente que representa una tarjeta de producto
const ProductCard = ({ product }) => {
  const { nombre_producto, precio, descripcion } = product;
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const fetchImageFromUnsplash = async () => {
      try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
          params: {
            query: nombre_producto,
            per_page: 1,
          },
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        });
        if (response.data.results.length > 0) {
          setImageUrl(response.data.results[0].urls.small);
        } else {
          setImageUrl(null); // Imagen no encontrada
        }
      } catch (error) {
        console.error(`Error obteniendo imagen para ${nombre_producto}:`, error.message || error);
        setImageUrl(null);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchImageFromUnsplash();
  }, [nombre_producto]);

  return (
    <View style={styles.card}>
      {loadingImage ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Imagen no disponible</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={2}>
        {nombre_producto}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {descripcion}
      </Text>
      <Text style={styles.price}>
        {precio !== undefined ? `$${precio.toLocaleString()}` : 'Precio no disponible'}
      </Text>
    </View>
  );
};

// Componente Home que muestra los productos
const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://192.168.1.32:3000/Productos');
        // Limita la cantidad de productos a 4
        setProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Error obteniendo productos:', error.message || error);
      }
    };

    fetchProductos();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {products.map((product) => (
        <ProductCard key={product.id || product._id} product={product} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  placeholder: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 10,
    color: '#777',
    textAlign: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: '#32CD32',
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export { ProductCard, Home };
