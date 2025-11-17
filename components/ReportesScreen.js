import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, Alert, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = "https://2jqpt3g7-8000.usw3.devtunnels.ms";

export default function ReportesScreen() {

  const [invernaderos, setInvernaderos] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const safeJson = async (res) => {
    try {
      const txt = await res.text();
      return txt ? JSON.parse(txt) : null;
    } catch (e) {
      console.log("⚠ JSON vacío o inválido");
      return null;
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Invernaderos
      const resInv = await fetch(`${API_BASE}/invernaderos/`);
      const invData = await safeJson(resInv);
      const invs = invData?.invernaderos || [];
      setInvernaderos(invs);

      // Etapas
      const etapasPromises = invs.map(inv =>
        fetch(`${API_BASE}/etapas/${inv.id_lote}`).then(res => safeJson(res))
      );
      const etapasPorLote = await Promise.all(etapasPromises);
      const allEtapas = etapasPorLote.flatMap(e => e?.etapas || []).map(et => ({
        ...et,
        fecha_inicio: et.fecha_inicio ? new Date(et.fecha_inicio).toISOString() : null,
        fecha_fin: et.fecha_fin ? new Date(et.fecha_fin).toISOString() : null
      }));
      setEtapas(allEtapas);

      // Insumos
      const insumosPromises = invs.map(inv =>
        fetch(`${API_BASE}/insumos/invernadero/${inv.id_lote}`).then(res => safeJson(res))
      );
      const insumosPorLote = await Promise.all(insumosPromises);
      const allInsumos = insumosPorLote.flatMap(i => i?.insumos || []).map(ins => ({
        ...ins,
        fecha_aplicacion: ins.fecha_aplicacion ? new Date(ins.fecha_aplicacion).toISOString() : null
      }));
      setInsumos(allInsumos);

    } catch (e) {
      console.log("❌ Error cargando datos:", e);
    } finally {
      setLoading(false);
    }
  };

  const generarReporte = async () => {
    try {
      const payload = {
        titulo: `Reporte generado ${new Date().toLocaleString()}`,
        descripcion: "Reporte automático de sistema",
        fecha_generacion: new Date().toISOString(),
        invernaderos: invernaderos.map(inv => ({
          ...inv,
          fecha_registro: inv.fecha_registro ? new Date(inv.fecha_registro).toISOString() : null
        })),
        etapas: etapas,
        insumos: insumos
      };

      const res = await fetch(`${API_BASE}/reportes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await safeJson(res);
      if (!res.ok) throw result;

      Alert.alert("✅ Reporte generado", `ID: ${result.id}`);
    } catch (e) {
      console.log("❌ Error generando reporte:", e);
      Alert.alert("Error", JSON.stringify(e, null, 2));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  // Timeline combinado
  const timelineData = [...etapas.map(e => ({ tipo: "etapa", ...e })),
                        ...insumos.map(i => ({ tipo: "insumo", ...i }))].sort(
    (a, b) => new Date(a.fecha_inicio || a.fecha_aplicacion) - new Date(b.fecha_inicio || b.fecha_aplicacion)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={timelineData}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.card}>
            <Text style={styles.title}>🌿 Reporte General</Text>
            <Text>Total de Invernaderos: {invernaderos.length}</Text>
            <Text>Total de Etapas: {etapas.length}</Text>
            <Text>Total de Insumos: {insumos.length}</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={generarReporte}
            >
              <Text style={styles.buttonText}>📄 Generar Reporte</Text>
            </TouchableOpacity>

            <Text style={styles.timelineTitle}>📅 Línea de tiempo global</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: item.tipo === "etapa" ? "#1565C0" : "#FF9800" }]} />
            <View style={[styles.timelineContent, { borderLeftColor: item.tipo === "etapa" ? "#1565C0" : "#FF9800" }]}>
              <Text style={styles.timelineDate}>
                {item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString() :
                 item.fecha_aplicacion ? new Date(item.fecha_aplicacion).toLocaleDateString() :
                 "Sin fecha"}
              </Text>
              <Text style={styles.timelineType}>
                {item.tipo === "etapa" ? "🌱 Etapa" : "🧪 Insumo"}
              </Text>
              <Text style={styles.timelineName}>{item.nombre_sub_etapa || item.nombre}</Text>
              <Text style={styles.timelineDesc}>{item.descripcion || `Cantidad usada: ${item.cantidad || ""}`}</Text>
              <Text style={styles.loteText}>Lote: {item.id_lote || item.id_invernadero || "—"}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },
  timelineTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
  timelineItem: { flexDirection: "row", marginBottom: 20 },
  timelineDot: { width: 15, height: 15, borderRadius: 10, marginRight: 10, marginTop: 5 },
  timelineContent: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    borderLeftWidth: 4,
    elevation: 2
  },
  timelineDate: { fontSize: 12, color: "#777" },
  timelineType: { fontWeight: "bold", marginTop: 2 },
  timelineName: { fontSize: 16, fontWeight: "600" },
  timelineDesc: { color: "#555" },
  loteText: { fontSize: 12, marginTop: 5, color: "#2E7D32" },
  button: {
    marginTop: 10,
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 8,
    alignItems: "center"
  },
  buttonText: { color: "#fff", fontWeight: "bold" }
});
