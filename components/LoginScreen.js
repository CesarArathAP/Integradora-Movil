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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { saveLocalData, saveUser, getUser } from '../services/storage/offlineStorage'; // ✅ Ahora usamos funciones centralizadas
import { colors } from '../styles/colors';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usuarioLocal, setUsuarioLocal] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = 'https://2jqpt3g7-8000.usw3.devtunnels.ms';

  /* =====================================================
     🔹 Cargar usuario guardado localmente al iniciar
     ===================================================== */
  useEffect(() => {
  (async () => {
    try {
      const usuario = await getUser();
      if (usuario && usuario.estado === 'activo') {
        console.log('🔐 Autologin con usuario local:', usuario.correo);
        onLogin(usuario);
      }
    } catch (err) {
      console.error('❌ Error al leer usuario local:', err);
    }
  })();
}, []);


  /* =====================================================
     🔹 Manejo del Login
     ===================================================== */
  const handleLogin = async () => {
  console.log('🔑 Intento de login con:', username);

  if (!username || !password) {
    Alert.alert('Error', 'Ingresa usuario y contraseña');
    return;
  }

  const url = `${API_BASE}/usuarios/login`;
  console.log('📡 Conectando a:', url);

  try {
    setLoading(true);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: username, password }),
    });

    console.log('📥 Estado HTTP:', res.status);
    const json = await res.json();

    if (!res.ok) {
      const msg = json?.detail || json?.error || 'Error en autenticación';
      Alert.alert('Error', msg.toString());
      return;
    }

    if (!json.usuario) {
      Alert.alert('Error', 'Respuesta inválida del servidor.');
      return;
    }

    // ✅ Usuario autenticado correctamente
    const usuario = { ...json.usuario, correo: username };
    console.log('✅ Usuario autenticado:', usuario);

    await saveUser(usuario);
    console.log('💾 Usuario guardado localmente con correo incluido');

    Alert.alert('Éxito', `Bienvenido ${usuario.nombre || username}`);
    onLogin(usuario);

    setUsername('');
    setPassword('');
  } catch (err) {
    console.error('⚠️ Error general o sin conexión:', err);

    // 🔹 Guardar intento de login offline
    const offlineSaved = await saveLocalData('login', { correo: username, password });
    if (offlineSaved) console.log('📥 Login guardado para sincronización offline');

    // 🔹 Intentar acceder en modo offline
    try {
      const storedUser = await getUser(); // 👈 leer directamente de AsyncStorage
      if (storedUser && storedUser.correo === username) {
        Alert.alert('Offline', `Bienvenido de nuevo ${storedUser.nombre || username} (modo sin conexión)`);
        onLogin(storedUser);
        return;
      }
    } catch (e) {
      console.error('❌ Error al intentar leer usuario local en modo offline:', e);
    }

    Alert.alert('Sin conexión', 'No se pudo conectar y no hay usuario guardado.');
  } finally {
    setLoading(false);
  }
};


  /* =====================================================
     🔹 UI (interfaz de inicio de sesión)
     ===================================================== */
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>AgroApp Trazabilidad</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

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

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* =====================================================
   🎨 ESTILOS
   ===================================================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
  },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { color: '#4CAF50', fontSize: 26, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#424242', fontSize: 16 },
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
    color: '#5D4037',
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
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default LoginScreen;
