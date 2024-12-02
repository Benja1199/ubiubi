import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../components/AuthContext';
import Header from '../components/Header';
import BotonFooter from '../components/BotonFooter';

const SuscripcionTienda = ({ navigation }) => {
  const { userId } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError('ID de usuario no disponible. Asegúrate de estar autenticado.');
      setLoading(false);
      return;
    }

    const fetchSubscriptionData = async () => {
      try {
        const response = await fetch(`http://192.168.1.101:3000/tienda/plan/${userId}`);
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        setSubscriptionData(data);
      } catch (err) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const { nombre, descripcion, propietario, planInfo } = subscriptionData;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />

      {/* Contenido Principal */}
      <View style={styles.content}>
        {/* Botón de regreso */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>

        {/* Card de suscripción */}
        <View style={styles.card}>
          <Text style={styles.title}>{nombre || 'Plan de Suscripción'}</Text>
          <Text style={styles.description}>{descripcion || 'Descripción no disponible'}</Text>
          <Text style={styles.owner}>{`Propietario: ${propietario || 'Desconocido'}`}</Text>

          {planInfo && (
            <View style={styles.detailContainer}>
              <Text style={styles.label}>Plan:</Text>
              <Text style={styles.value}>{planInfo.periodo}</Text>
              <Text style={styles.label}>Costo:</Text>
              <Text style={styles.value}>${planInfo.costo}</Text>
            </View>
          )}
        </View>
      </View>

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
    flex: 1,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10, // Agrega márgenes verticales
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  owner: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  detailContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  value: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
  },
});

export default SuscripcionTienda;
