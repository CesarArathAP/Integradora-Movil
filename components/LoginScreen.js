import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';
import { saveLocalData, getPendingData } from '../services/storage/offlineStorage';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usuarioAutorizado, setUsuarioAutorizado] = useState(null);

  useEffect(() => {
    (async () => {
      const logins = await getPendingData();
      if (logins.length > 0) {
        setUsuarioAutorizado(logins[0].data.usuario);
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Ingresa usuario y contraseña');
      return;
    }

    if (usuarioAutorizado && username !== usuarioAutorizado) {
      Alert.alert('Error', 'Usuario no autorizado');
      return;
    }

    const intento = { usuario: username, fecha: new Date().toISOString(), exito: true };
    const guardado = await saveLocalData('login', intento);

    if (guardado) {
      if (!usuarioAutorizado) {
        setUsuarioAutorizado(username);
        Alert.alert('Éxito', `Usuario ${username} registrado y autorizado (offline)`);
      } else {
        Alert.alert('Éxito', `Bienvenido ${username}`);
      }
      onLogin(username);
    } else {
      Alert.alert('Error', 'No se pudo guardar el registro offline');
    }

    setUsername('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AgroApp Trazabilidad</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      </View>

      {/* Tarjeta central */}
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor={colors.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.9}>
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Fondo base
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#4CAF50', // Verde primario
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#424242', // Gris oscuro
    fontSize: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#5D4037', // Texto principal
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;