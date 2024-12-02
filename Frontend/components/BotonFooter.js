import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';

const BotonFooter = () => {
    const navigation = useNavigation();
    const { role } = useAuth();

    return (
        <View style={styles.container}>
            {/* Botón Home */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate(role === 'Tienda' ? 'HomeTienda' : 'Home')}
            >
                <FontAwesome name="home" size={24} color="black" />
                <Text style={styles.label}>Home</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Botón Productos */}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Productos')}>
                <FontAwesome name="tag" size={24} color="black" />
                <Text style={styles.label}>Productos</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Botón Perfil */}
            <TouchableOpacity
                style={styles.button}
                onPress={() =>
                    navigation.navigate(
                        role === 'Tienda' ? 'PerfilTienda' : role === 'Cliente' ? 'PerfilCliente' : 'Login'
                    )
                }
            >
                <FontAwesome name="user" size={24} color="black" />
                <Text style={styles.label}>Mi Perfil</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#E0E0E0',
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 15,
        color: 'black',
        marginTop: 2,
    },
    divider: {
        width: 5,
        backgroundColor: '#CCCCCC',
        height: '70%',
    },
});

export default BotonFooter;
