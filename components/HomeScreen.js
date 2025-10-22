// components/HomeScreen.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from './Header';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';

const modules = [
  { id: '1', name: 'Producción', icon: 'leaf-outline', color: '#4CAF50', route: 'Produccion' },
  { id: '2', name: 'Insumos', icon: 'cube-outline', color: '#FFC107', route: 'Insumos' }, // ✅ ahora con ruta
  { id: '3', name: 'Cámara multimedia', icon: 'camera-outline', color: '#03A9F4', route: 'CameraModule' },
  { id: '4', name: 'Reportes', icon: 'bar-chart-outline', color: '#9C27B0' },
  { id: '5', name: 'Sincronización', icon: 'sync-outline', color: '#FF5722' },
  { id: '6', name: 'Invernaderos', icon: 'home-outline', color: '#8BC34A' },
];

const HomeScreen = ({ navigation, onLogout }) => {
  const handlePress = (item) => {
    if (item.route) {
      navigation.navigate(item.route);
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
      <FlatList
        data={modules}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
});

export default HomeScreen;