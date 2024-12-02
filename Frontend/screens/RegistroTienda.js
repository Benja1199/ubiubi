import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const RegistroTienda = ({ navigation }) => {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const handleRegister = async () => {
    if (password !== repeatPassword) {
      console.log('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.101:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_usuario: ownerName.trim(),
          email: email.trim().toLowerCase(),
          clave: password.trim(),
          rol_id: 2, // Rol de Tienda
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.mensaje);
        navigation.navigate('Login');
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Tienda</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del Propietario"
          placeholderTextColor="#B0B0B0"
          value={ownerName}
          onChangeText={setOwnerName}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre de la Tienda"
          placeholderTextColor="#B0B0B0"
          value={storeName}
          onChangeText={setStoreName}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#B0B0B0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#B0B0B0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Repite Contraseña"
          placeholderTextColor="#B0B0B0"
          value={repeatPassword}
          onChangeText={setRepeatPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000',
  },
  formContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#4169E1',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegistroTienda;
