import React, { createContext, useState, useContext } from 'react';

// Crear el contexto
const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState('Todos');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState({ email: '', nombre_usuario: '', telefono: '' });

  const login = (email, rol, id, nombre_usuario, telefono) => {
    console.log('Datos recibidos en login:', { email, rol, id, nombre_usuario, telefono }); // LOG DE DEPURACIÓN
  
    if (rol === 'Cliente' || rol === 'Tienda') {
      setRole(rol);
      setUserId(id); // Puedes mantener esta línea si prefieres seguir usando `userId` de forma separada
      setUserInfo({ email, nombre_usuario, telefono, id }); // Incluye el ID aquí
      setIsLoggedIn(true);
      console.log(`Sesión iniciada como ${rol}, ID: ${id}, Nombre: ${nombre_usuario}, Teléfono: ${telefono}`);
    } else {
      console.log('Rol no autorizado');
    }
  };

  const logout = () => {
    setRole('Todos');
    setUserId(null);
    setUserInfo({ email: '', nombre_usuario: '', telefono: '' });
    setIsLoggedIn(false);
    console.log('Sesión cerrada');
  };

  return (
    <AuthContext.Provider value={{ role, userId, isLoggedIn, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


// Hook para usar el contexto
export const useAuth = () => useContext(AuthContext);
