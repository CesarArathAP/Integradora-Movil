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
    // Cargamos el usuario autorizado si existe
    (async () => {
      const logins = await getPendingData(); // obtenemos todos los logins guardados
      if (logins.length > 0) {
        setUsuarioAutorizado(logins[0].data.usuario); // usamos el primer usuario guardado
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Ingresa usuario y contraseña');
      return;
    }

    // Solo permitimos el usuario autorizado
    if (usuarioAutorizado && username !== usuarioAutorizado) {
      Alert.alert('Error', 'Usuario no autorizado');
      return;
    }

    // Guardamos el login offline si es válido
    const intento = {
      usuario: username,
      fecha: new Date().toISOString(),
      exito: true,
    };

    const guardado = await saveLocalData('login', intento);

    if (guardado) {
      if (!usuarioAutorizado) {
        // Si es el primer login, establecemos este usuario como autorizado
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
      <View style={commonStyles.header}>
        <Text style={commonStyles.appTitle}>Inicio de Sesión</Text>
        <Text style={commonStyles.appSubtitle}>Inicia sesión para continuar</Text>
      </View>

      <View style={styles.formContainer}>
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
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  formContainer: { flex: 1, padding: 30, justifyContent: 'center' },
  input: {
    backgroundColor: colors.white,
    color: colors.textPrimary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: colors.greenMedium,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: colors.greenMedium,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
