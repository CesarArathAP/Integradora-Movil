import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function InvernaderosScreen() {
  const [invernaderos, setInvernaderos] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'https://2jqpt3g7-8000.usw3.devtunnels.ms/invernaderos/';

// =====================================================
// LIMPIA COORDENADAS (extrae solo el número)
// =====================================================
const limpiarCoordenada = (valor) => {
  if (!valor) return null;

  const match = String(valor).match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
};


  const buscarCoordenadas = async (ubicacion) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ubicacion)}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        return {
          latitud: parseFloat(data[0].lat),
          longitud: parseFloat(data[0].lon),
        };
      }
    } catch (err) {
      console.error('Error buscando coordenadas:', err);
    }
    return null;
  };

  const fetchInvernaderos = async () => {
    try {
      setLoading(true);

      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const invsConCoords = await Promise.all(
  data.invernaderos.map(async (inv) => {
    let lat = limpiarCoordenada(inv.latitud);
    let lon = limpiarCoordenada(inv.longitud);

    // Si venían mal, buscamos coordenadas
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      const coords = await buscarCoordenadas(inv.ubicacion);
      return { ...inv, ...coords };
    }

    // Si venían bien, regresamos limpias
    return { ...inv, latitud: lat, longitud: lon };
  })
);

      console.log("COORDENADAS DE INVERNADEROS:");
      invsConCoords.forEach((i) =>
        console.log(i.nombre, i.latitud, i.longitud)
      );

      setInvernaderos(invsConCoords);

    } catch (err) {
      console.error("Error API:", err);
      Alert.alert("Error", "No se pudieron obtener los invernaderos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvernaderos();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text>Cargando invernaderos...</Text>
      </View>
    );
  }

  if (invernaderos.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No hay invernaderos registrados.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {invernaderos.map((inv) => {
        // LIMPIAMOS LAS COORDENADAS ANTES DE USARLAS
        const lat = limpiarCoordenada(inv.latitud);
        const lon = limpiarCoordenada(inv.longitud);

        const coordsValidas =
          lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon);

        return (
          <View key={inv._id} style={styles.invernaderoCard}>
            <Text style={styles.nombre}>{inv.nombre}</Text>
            <Text>Ubicación: {inv.ubicacion}</Text>
            <Text>Responsable: {inv.responsable || '-'}</Text>
            <Text>Superficie: {inv.superficie_m2} m²</Text>
            <Text>Tipo de cultivo: {inv.tipo_cultivo}</Text>

            {coordsValidas ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: lat,
                  longitude: lon,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{ latitude: lat, longitude: lon }}
                  title={inv.nombre}
                  description={`Responsable: ${inv.responsable || '-'}`}
                />
              </MapView>
            ) : (
              <Text style={{ color: "red", marginTop: 10 }}>
                ⚠ Coordenadas inválidas o no encontradas
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  invernaderoCard: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  nombre: { fontWeight: 'bold', fontSize: 16 },
  map: { height: 150, marginTop: 10 },
});
