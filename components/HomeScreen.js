import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from './Header';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const modules = [
  { id: '1', name: 'Producción', icon: 'leaf-outline', color: '#4CAF50', route: 'Produccion' },
  { id: '2', name: 'Insumos', icon: 'cube-outline', color: '#FFC107', route: 'Insumos' },
  { id: '3', name: 'Cámara multimedia', icon: 'camera-outline', color: '#03A9F4', route: 'CameraModule' },
  { id: '4', name: 'Reportes', icon: 'bar-chart-outline', color: '#9C27B0', route: 'Reportes' },
  { id: '5', name: 'Sincronización', icon: 'sync-outline', color: '#FF5722', route: 'Sincronizacion' },
  { id: '6', name: 'Invernaderos', icon: 'home-outline', color: '#8BC34A', route: 'Invernaderos' },
];

const HomeScreen = ({ route, navigation, onLogout }) => {
  const { selectedInvernadero } = route.params || {};
  const [invernaderoActual, setInvernaderoActual] = useState(null);

  // ✅ Cargar invernadero al iniciar
  useEffect(() => {
    const cargarInvernadero = async () => {
      try {
        const netState = await NetInfo.fetch();
        if (netState.isConnected && selectedInvernadero) {
          // 🌐 Modo online: guardar el seleccionado
          await AsyncStorage.setItem('invernaderoSeleccionado', JSON.stringify(selectedInvernadero));
          setInvernaderoActual(selectedInvernadero);
        } else {
          // 📴 Modo offline: recuperar el último guardado
          const guardado = await AsyncStorage.getItem('invernaderoSeleccionado');
          if (guardado) {
            setInvernaderoActual(JSON.parse(guardado));
          }
        }
      } catch (error) {
        console.error('Error al cargar el invernadero:', error);
      }
    };

    cargarInvernadero();
  }, [selectedInvernadero]);

  console.log("🌿 Invernadero actual:", invernaderoActual);

  const handlePress = (item) => {
  if (item.route) {
    navigation.navigate(item.route, { 
      id_lote: invernaderoActual?.id_lote,
      nombre_invernadero: invernaderoActual?.nombre
    });
  } else {
    alert(`El módulo "${item.name}" está en desarrollo.`);
  }
};


  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.moduleCard} onPress={() => handlePress(item)}>
      <Ionicons name={item.icon} size={40} color={item.color} />
      <Text style={styles.moduleText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={commonStyles.container}>
      <Header />

      {/* 🔹 Info del invernadero actual */}
      {invernaderoActual && (
        <View style={styles.invernaderoInfo}>
          <Text style={styles.invernaderoTitle}>🏠 {invernaderoActual.nombre}</Text>
          <Text style={styles.invernaderoText}>📍 {invernaderoActual.ubicacion}</Text>
          <Text style={styles.invernaderoText}>🌱 Cultivo: {invernaderoActual.tipo_cultivo || 'No especificado'}</Text>
          <Text style={styles.invernaderoText}>📐 Superficie: {invernaderoActual.superficie_m2 || '—'} m²</Text>

          {/* 🔁 Botón para cambiar de invernadero */}
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => navigation.replace('SelectInvernadero')}
          >
            <Text style={styles.changeText}>🔄 Cambiar Invernadero</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🔹 Menú principal */}
      <FlatList
        data={modules}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />

      {/* 🔹 Botón de logout */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* 🎨 ESTILOS */
const styles = StyleSheet.create({
  gridContainer: {
    padding: 16,
    justifyContent: 'center',
  },
  moduleCard: {
    flex: 1,
    margin: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  moduleText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textPrimary,
  },
  logoutContainer: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  invernaderoInfo: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    elevation: 3,
  },
  invernaderoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 6,
  },
  invernaderoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  changeButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default HomeScreen;
