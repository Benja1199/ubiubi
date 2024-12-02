import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

const categoryMap = {
  1: 'Vestuario',
  2: 'Casa',
  3: 'Bebida',
  4: 'Congelados',
  10: 'Ferretería',
  6: 'Tecnología',
  7: 'Despensa',
  8: 'Mascotas',
  11: 'Comida rapida',
  12: 'Comida china/japonesa',
  13: 'Hotel y Spa'
};

const AgregarProducto = ({ navigation }) => {
  const [productData, setProductData] = useState({
    tienda_id: 6,
    nombre_producto: '',
    descripcion: '',
    precio: '',
    categoria_id: null,
    estado: 'activo',
  });

  const handleSaveProduct = async () => {
    if (
      !productData.nombre_producto ||
      !productData.descripcion ||
      !productData.precio ||
      !productData.categoria_id
    ) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const payload = {
      nombre_producto: productData.nombre_producto,
      descripcion: productData.descripcion,
      precio: parseInt(productData.precio),
      categoria_id: productData.categoria_id,
      estado: productData.estado,
    };

    try {
      const response = await fetch('http://192.168.1.101:3000/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Producto guardado correctamente');
        navigation.goBack();
      } else {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        Alert.alert('Error', `No se pudo guardar el producto: ${response.status}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      Alert.alert('Error', 'Hubo un problema con la solicitud. Verifica la consola.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Agregar Producto</Text>

        <Text style={styles.label}>Nombre del Producto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: Reloj de Pared"
          value={productData.nombre_producto}
          onChangeText={(text) =>
            setProductData({ ...productData, nombre_producto: text })
          }
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Descripción del producto"
          value={productData.descripcion}
          onChangeText={(text) =>
            setProductData({ ...productData, descripcion: text })
          }
        />

        <Text style={styles.label}>Precio</Text>
        <TextInput
          style={styles.input}
          placeholder="Precio en pesos"
          keyboardType="numeric"
          value={productData.precio}
          onChangeText={(text) =>
            setProductData({ ...productData, precio: text })
          }
        />

        <Text style={styles.label}>Categoría</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() =>
            Alert.alert('Seleccionar Categoría', null, [
              ...Object.keys(categoryMap).map((key) => ({
                text: categoryMap[key],
                onPress: () =>
                  setProductData({ ...productData, categoria_id: parseInt(key) }),
              })),
              { text: 'Cancelar', style: 'cancel' },
            ])
          }
        >
          <Text style={styles.dropdownText}>
            {categoryMap[productData.categoria_id] || 'Selecciona una categoría'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
          <Text style={styles.saveButtonText}>Guardar Producto</Text>
        </TouchableOpacity>
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  dropdown: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#32CD32',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AgregarProducto;
