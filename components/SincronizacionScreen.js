import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getPendingData, markAsSynced } from "../services/storage/offlineStorage";

const API_URL = "https://2jqpt3g7-8000.usw3.devtunnels.ms/sincronizar/";

export default function SincronizacionScreen() {
  const [offlineData, setOfflineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});
  const [syncing, setSyncing] = useState(false);

  // Detectar conexión
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Cargar registros offline
  const loadOfflineData = async () => {
    const data = await getPendingData();
    setOfflineData(data || []);
  };

  useEffect(() => {
    loadOfflineData();
    const interval = setInterval(loadOfflineData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Agrupar por módulo y fecha
  const groupByModuleAndDate = (data) => {
    return data.reduce((acc, item) => {
      const module = item.modulo || "Desconocido";
      const date = item.fechaCreacion?.split("T")[0] || "Sin Fecha";

      acc[module] = acc[module] || {};
      acc[module][date] = acc[module][date] || [];

      acc[module][date].push(item);

      return acc;
    }, {});
  };

  // Sincronización general
  const syncData = async (mode = "all") => {
    if (!isConnected) {
      Alert.alert("Sin conexión", "Conéctate a internet para sincronizar.");
      return;
    }

    try {
      setSyncing(true);
      setLoading(true);

      const pending = await getPendingData();

      if (!pending || pending.length === 0) {
        Alert.alert("Sin registros", "No hay datos pendientes por sincronizar.");
        return;
      }

      let filtered = pending;

      if (mode === "today") {
        const todayLocal = new Date().toLocaleDateString("en-CA");

        filtered = pending.filter((item) => {
          if (!item.fechaCreacion) return false;
          const itemLocal = new Date(item.fechaCreacion).toLocaleDateString("en-CA");
          return itemLocal === todayLocal;
        });
      }

      if (filtered.length === 0) {
        Alert.alert("Sin registros", "No hay datos pendientes del día de hoy.");
        return;
      }

      let successCount = 0;

      for (const item of filtered) {
        try {
          const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              modulo: item.modulo,
              data: item.data,
            }),
          });

          if (!response.ok) continue;

          await markAsSynced(item.id || item.uuid);
          successCount++;
        } catch (err) {
          console.error("Error fetch:", err);
        }
      }

      await loadOfflineData();

      Alert.alert("✅ Sincronización completa", `${successCount} registros sincronizados.`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo sincronizar los datos.");
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  // Sincronización individual
  const syncSingle = async (item) => {
    if (!isConnected) {
      Alert.alert("Sin conexión", "Conéctate a internet para sincronizar.");
      return;
    }

    try {
      setSyncing(true);
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modulo: item.modulo,
          data: item.data,
        }),
      });

      if (!response.ok) {
        Alert.alert("Error", "No se pudo sincronizar en el servidor.");
        return;
      }

      await markAsSynced(item.id || item.uuid);
      await loadOfflineData();

      Alert.alert("✅ Registro sincronizado", `Módulo: ${item.modulo}`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo sincronizar este registro.");
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  const groupedData = groupByModuleAndDate(offlineData);

  const toggleDateExpand = (key) => {
    setExpandedDates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalRegistros = offlineData.length;
  const pendientes = offlineData.filter((i) => !i.isSynced).length;
  const sincronizados = totalRegistros - pendientes;

  return (
    <View style={styles.container}>
      {/* Banner offline */}
      {isConnected === false && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>⚠️ Sin conexión</Text>
        </View>
      )}

      {/* Banner sincronizando */}
      {syncing && (
        <View style={styles.syncBanner}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.syncText}>Sincronizando...</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>🔄 Módulo de Sincronización</Text>

        <View style={styles.statusContainer}>
          <Ionicons
            name={isConnected ? "wifi-outline" : "cloud-offline-outline"}
            size={20}
            color={isConnected ? "#4CAF50" : "#E53935"}
          />
          <Text style={styles.statusText}>
            {isConnected ? "En línea" : "Sin conexión"}
          </Text>
        </View>
      </View>

      {/* Botones */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btn} onPress={() => syncData("all")}>
          <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Todo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => syncData("today")}>
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Hoy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.refreshBtn]}
          onPress={loadOfflineData}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Actualizar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>📦 Total: {totalRegistros}</Text>
        <Text style={styles.statText}>⏳ Pendientes: {pendientes}</Text>
        <Text style={styles.statText}>✅ Sincronizados: {sincronizados}</Text>
      </View>

      {/* Lista */}
      {offlineData.length === 0 ? (
        <Text style={styles.noData}>No hay registros offline.</Text>
      ) : (
        <ScrollView style={{ marginTop: 10 }}>
          {Object.entries(groupedData).map(([module, dates]) => {
            const groupColor = Object.values(dates)
              .flat()
              .some((i) => !i.isSynced)
              ? "#E53935"
              : "#4CAF50";

            return (
              <View key={`module-${module}`} style={styles.group}>
                <Text style={[styles.groupTitle, { color: groupColor }]}>
                  🧩 {module}
                </Text>

                {Object.entries(dates).map(([date, items]) => {
                  const key = `${module}-${date}`;
                  const expanded = expandedDates[key];

                  return (
                    <View key={key} style={styles.dateGroup}>
                      {/* Fecha */}
                      <TouchableOpacity
                        style={styles.dateHeader}
                        onPress={() => toggleDateExpand(key)}
                      >
                        <Ionicons
                          name={
                            expanded
                              ? "chevron-down-outline"
                              : "chevron-forward-outline"
                          }
                          size={18}
                          color="#333"
                        />
                        <Text style={styles.dateTitle}>{date}</Text>
                        <Text style={styles.itemCount}>({items.length})</Text>
                      </TouchableOpacity>

                      {/* Registros */}
                      {expanded &&
                        items.map((item, idx) => (
                          <View key={`item-${idx}`} style={styles.card}>
                            <Text style={styles.cardTitle}>
                              Módulo: {item.modulo}
                            </Text>

                            <Text>
                              📅 Fecha creación:{" "}
                              {new Date(item.fechaCreacion).toLocaleString()}
                            </Text>

                            <Text>
                              🔁 Estado:{" "}
                              {item.isSynced ? "✅ Sincronizado" : "❌ Pendiente"}
                            </Text>

                            {/* Data */}
                            {item.data && (
                              <View style={{ marginTop: 6 }}>
                                <Text>
                                  🌱 Invernadero: {item.data.id_invernadero}
                                </Text>
                                <Text>🗓 Etapa: {item.data.id_etapa}</Text>
                                <Text>📦 Nombre: {item.data.nombre}</Text>
                                <Text>🔹 Tipo: {item.data.tipo}</Text>
                                <Text>
                                  🔢 Cantidad: {item.data.cantidad}{" "}
                                  {item.data.unidad}
                                </Text>
                                <Text>
                                  🧑 Responsable:{" "}
                                  {item.data.responsable || "-"}
                                </Text>
                                <Text>
                                  📅 Fecha aplicación:{" "}
                                  {item.data.fecha_aplicacion
                                    ? new Date(
                                        item.data.fecha_aplicacion
                                      ).toLocaleDateString()
                                    : "-"}
                                </Text>
                                <Text>
                                  📝 Observaciones:{" "}
                                  {item.data.observaciones || "-"}
                                </Text>
                                <Text>
                                  📦 Stock disponible:{" "}
                                  {item.data.stock_disponible}
                                </Text>
                              </View>
                            )}

                            {/* Botón sincronizar individual */}
                            {!item.isSynced && (
                              <TouchableOpacity
                                style={styles.singleSyncBtn}
                                onPress={() => syncSingle(item)}
                              >
                                <Ionicons
                                  name="cloud-upload-outline"
                                  size={16}
                                  color="#fff"
                                />
                                <Text style={styles.singleSyncText}>
                                  Sincronizar
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        ))}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },

  offlineBanner: {
    backgroundColor: "#E53935",
    padding: 6,
    alignItems: "center",
    borderRadius: 6,
    marginBottom: 8,
  },
  offlineText: { color: "#fff", fontWeight: "bold" },

  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  syncText: { color: "#fff", fontWeight: "600", marginLeft: 6 },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#333" },

  statusContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusText: { fontSize: 14, color: "#555" },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  refreshBtn: { backgroundColor: "#4CAF50" },

  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 10,
  },
  statText: { fontWeight: "600", color: "#333" },

  noData: { textAlign: "center", color: "#999", marginTop: 30 },

  group: { marginBottom: 15 },
  groupTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },

  dateGroup: { marginLeft: 8, marginBottom: 8 },
  dateHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5 },

  dateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
  },

  itemCount: { fontSize: 14, color: "#777", marginLeft: 6 },

  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#222",
  },

  singleSyncBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 6,
    gap: 4,
  },

  singleSyncText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
});
