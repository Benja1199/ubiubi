import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>UBISHOP</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4169E1', // Color azul intenso
    paddingTop: 50, // Espacio para evitar solapamiento con el notch
    paddingBottom: 15, // Espacio inferior
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF', // Texto blanco
    fontSize: 48, // Tamaño del texto
    fontWeight: 'bold', // Texto en negrita
  },
});

export default Header;
