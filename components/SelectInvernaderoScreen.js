import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SelectInvernaderoScreen({ navigation }) {
  const [invernaderos, setInvernaderos] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'https://2jqpt3g7-8000.usw3.devtunnels.ms/invernaderos/';

  const fetchInvernaderos = async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // 🔹 Guarda los invernaderos localmente para modo offline
      await AsyncStorage.setItem('invernaderosCache', JSON.stringify(data.invernaderos || []));
      setInvernaderos(data.invernaderos || []);
    } catch (err) {
      console.error('🌐 Error al obtener invernaderos:', err);

      // 🔹 Si hay error, intenta cargar desde almacenamiento local
      const stored = await AsyncStorage.getItem('invernaderosCache');
      if (stored) {
        const parsed = JSON.parse(stored);
        setInvernaderos(parsed);
        Alert.alert('Modo Offline', 'Se cargaron los invernaderos almacenados localmente.');
      } else {
        Alert.alert('Error', 'No se pudieron obtener los invernaderos ni hay datos guardados.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvernaderos();
  }, []);

  const seleccionarInvernadero = async (inv) => {
    await AsyncStorage.setItem('invernaderoSeleccionado', JSON.stringify(inv));
    navigation.replace('Home', { selectedInvernadero: inv });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text>Cargando invernaderos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona un Invernadero</Text>
      <FlatList
        data={invernaderos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => seleccionarInvernadero(item)}
          >
            <Text style={styles.name}>{item.nombre}</Text>
            <Text>📍 {item.ubicacion}</Text>
            <Text>👨‍🌾 Responsable: {item.responsable || 'No asignado'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: { padding: 12, backgroundColor: '#E8F5E9', borderRadius: 10, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
