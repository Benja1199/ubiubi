import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';

const Informes = ({ navigation }) => {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [opinions, setOpinions] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [activeProducts, setActiveProducts] = useState(0);
  const [averageRatings, setAverageRatings] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [outOfStockPercentage, setOutOfStockPercentage] = useState('');
  const [bestAndWorstProducts, setBestAndWorstProducts] = useState({});

  const ratingMap = {
    Excelente: 5,
    Bueno: 4,
    Regular: 3,
    Malo: 2,
    Terrible: 1,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, opinionsResponse, storeResponse] = await Promise.all([
          axios.get(`http://192.168.1.101:3000/Productos`),
          axios.get(`http://192.168.1.101:3000/Opiniones`),
          axios.get(`http://192.168.1.101:3000/tienda/${userId}`),
        ]);

        const storeData = storeResponse.data;
        const storeProducts = productsResponse.data.filter(
          (product) => product.tienda_id === storeData.tienda_id
        );

        setProducts(storeProducts);
        setOpinions(opinionsResponse.data);
        setStoreName(storeData.nombre || 'Tienda');

        generateReports(storeProducts, opinionsResponse.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const generateReports = (products, opinions) => {
    const activeCount = products.filter((product) => product.estado === 'activo').length;
    setActiveProducts(activeCount);

    const ratings = products.map((product) => {
      const productOpinions = opinions.filter(
        (opinion) => opinion.producto_id === product.producto_id
      );

      if (productOpinions.length === 0) {
        return { producto: product.nombre_producto, promedio: 'Sin calificaciones' };
      }

      const totalRating = productOpinions.reduce((sum, opinion) => {
        const ratingValue = ratingMap[opinion.calificacion?.trim()] || 0;
        return sum + ratingValue;
      }, 0);

      const averageRating = totalRating / productOpinions.length;

      return { producto: product.nombre_producto, promedio: averageRating.toFixed(2) };
    });

    setAverageRatings(ratings);
    setSelectedProduct(ratings[0]?.producto || null);

    const outOfStockCount = products.filter((product) => product.estado !== 'activo').length;
    const percentage = ((outOfStockCount / products.length) * 100).toFixed(2);
    setOutOfStockPercentage(`${percentage}%`);

    const ratedProducts = ratings.filter((r) => r.promedio !== 'Sin calificaciones').map((r) => ({
      ...r,
      promedio: parseFloat(r.promedio),
    }));

    const bestProduct = ratedProducts.reduce((best, current) =>
      current.promedio > best.promedio ? current : best,
      { producto: 'Sin datos', promedio: 0 }
    );

    const worstProduct = ratedProducts.reduce((worst, current) =>
      current.promedio < worst.promedio ? current : worst,
      { producto: 'Sin datos', promedio: 0 }
    );

    setBestAndWorstProducts({
      mejorProducto: bestProduct.producto,
      peorProducto: worstProduct.producto,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const selectedRating = averageRatings.find((r) => r.producto === selectedProduct);

  return (
    <ScrollView style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back-ios" size={20} color="#007BFF" />
        <Text style={styles.backButtonText}>Regresar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Informes {"\n"} {storeName}</Text>

      <View style={styles.cardContainer}>
        <View style={[styles.card, styles.greenCard]}>
          <Text style={styles.cardText}>Productos Activos {"\n"} </Text>
          <Text style={styles.cardValue}>{activeProducts}</Text>
        </View>
        <View style={[styles.card, styles.pinkCard]}>
          <Text style={styles.cardText}>Productos Inactivos {"\n"} </Text>
          <Text style={styles.cardValue}>{outOfStockPercentage}</Text>
        </View>
      </View>

      <View style={[styles.card, styles.blueCard]}>
        <Text style={styles.cardText}>Calificaciones Promedio {"\n"} </Text>
        <Picker
          selectedValue={selectedProduct}
          onValueChange={(itemValue) => setSelectedProduct(itemValue)}
          style={styles.picker}
        >
          {averageRatings.map((rating, index) => (
            <Picker.Item key={index} label={rating.producto} value={rating.producto} />
          ))}
        </Picker>
        {selectedRating && (
          <Text style={styles.itemText}>
            {"\n"}
            {selectedRating.producto}: {selectedRating.promedio}
          </Text>
        )}
      </View>

      <View style={styles.cardContainer}>
        <View style={[styles.card, styles.yellowCard]}>
          <Text style={styles.cardText}>Mejor Producto {"\n"} </Text>
          <Text style={styles.cardValue}>{bestAndWorstProducts.mejorProducto}</Text>
        </View>
        <View style={[styles.card, styles.grayCard]}>
          <Text style={styles.cardText}>Peor Producto {"\n"} </Text>
          <Text style={styles.cardValue}>{bestAndWorstProducts.peorProducto}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
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
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  greenCard: {
    backgroundColor: '#B2F2BB',
  },
  pinkCard: {
    backgroundColor: '#FFCCE5',
  },
  blueCard: {
    backgroundColor: '#A3DAFF',
    marginBottom: 20,
  },
  yellowCard: {
    backgroundColor: '#FFE680',
  },
  grayCard: {
    backgroundColor: '#E5E5E5',
  },
  cardText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  itemText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  picker: {
    width: '100%',
    height: 40,
    color: '#333',
    margin: 50,
    justifyContent: 'center',
  },
});

export default Informes;
