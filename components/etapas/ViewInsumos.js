import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import {
  saveLocalData,
  getPendingData,
  markAsSynced,
  saveInsumosLocal,
  getInsumosLocal
} from "../../services/storage/offlineStorage";



const API_BASE = 'https://2jqpt3g7-8000.usw3.devtunnels.ms';

export default function ViewInsumos() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  /* --------------------------------------------------------
     ✔ Detectar conexión y sincronizar
     -------------------------------------------------------- */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);

      if (state.isConnected) {
        sincronizarPendientes();
      }
    });

    return () => unsubscribe();
  }, []);

  /* --------------------------------------------------------
     ✔ Sincronizar datos offline (descontar stock)
     -------------------------------------------------------- */
  const sincronizarPendientes = async () => {
    const pendientes = await getPendingData();

    for (const item of pendientes) {
      if (item.modulo === "descontarStock") {
        try {
          const res = await fetch(`${API_BASE}/insumos/descontar/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.data),
          });

          if (res.ok) {
            await markAsSynced(item.uuid);
            console.log("✔ Registro sincronizado:", item.uuid);
          }
        } catch (err) {
          console.log("❌ Error al sincronizar:", err);
        }
      }
    }

    fetchInsumos(); // Recargar lista online
  };

  /* --------------------------------------------------------
     ✔ Cargar insumos (Online + Offline)
     -------------------------------------------------------- */
  const fetchInsumos = async () => {
    setLoading(true);

    if (!isConnected) {
      console.log("📴 Modo offline → mostrando datos almacenados...");

      const pendientes = await getPendingData();
      const locales = await getInsumosLocal();
setInsumos(locales);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/insumos/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

const data = await res.json();
const lista = data.insumos || data;

// Guardar copia local
await saveInsumosLocal(lista);

setInsumos(lista);


    } catch (err) {
      Alert.alert("Error", "No se pudieron cargar los insumos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  /* --------------------------------------------------------
     ✔ Descontar stock (Online + Offline)
     -------------------------------------------------------- */
  const descontarStock = async (insumoId, cantidad) => {
    if (!isConnected) {
      await saveLocalData("descontarStock", {
        insumo_id: insumoId,
        cantidad_usada: cantidad,
      });

      Alert.alert(
        "Modo Offline",
        "El descuento se guardó y se enviará cuando vuelvas a tener internet."
      );
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/insumos/descontar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insumo_id: insumoId, cantidad_usada: cantidad }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      Alert.alert("✔ Stock actualizado", `Nuevo stock: ${data.nuevo_stock}`);

      fetchInsumos();
    } catch (err) {
      Alert.alert("Error", "No se pudo descontar el stock.");
    }
  };

  /* --------------------------------------------------------
     ✔ Render
     -------------------------------------------------------- */
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Cargando insumos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Insumos Registrados</Text>

      {!isConnected && (
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
          ⚠ Estás en modo offline
        </Text>
      )}

      {insumos.length === 0 ? (
        <Text style={styles.text}>No hay insumos registrados.</Text>
      ) : (
        <FlatList
          data={insumos}
          keyExtractor={(item, index) => `${item._id || 'sin-id'}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.cardSubtitle}>{item.tipo}</Text>
              <Text style={styles.cardText}>Proveedor: {item.proveedor || 'N/A'}</Text>
              <Text style={styles.cardText}>
                Unidad: {item.unidadMedida || item.unidad || 'N/A'}
              </Text>
              <Text style={styles.cardText}>
                Stock disponible: {item.stock_disponible ?? item.stock ?? 0}
              </Text>

              {/* Botón descontar */}
              <TouchableOpacity
                style={styles.button}
                onPress={() => descontarStock(item._id, 1)}
              >
                <Text style={styles.buttonText}>Usar 1 unidad</Text>
              </TouchableOpacity>

              {/* Detalles */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2196F3', marginTop: 5 }]}
                onPress={() =>
                  Alert.alert(
                    'Detalles del Insumo',
                    `Nombre: ${item.nombre}\nTipo: ${item.tipo}\nProveedor: ${
                      item.proveedor || 'N/A'
                    }\nUnidad: ${
                      item.unidadMedida || item.unidad || 'N/A'
                    }\nStock: ${
                      item.stock_disponible ?? item.stock ?? 0
                    }\nDescripción: ${item.descripcion || 'N/A'}`
                  )
                }
              >
                <Text style={styles.buttonText}>Ver detalles</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

/* --------------------------------------------------------
   ✔ Estilos
   -------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 3,
  },
  cardText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
