import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  StyleSheet, Dimensions, Platform, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { getUser, saveLocalData } from '../services/storage/offlineStorage';
import ViewInsumos from './etapas/ViewInsumos';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');
const API_BASE = 'https://2jqpt3g7-8000.usw3.devtunnels.ms'; // Ajusta con tu endpoint real

// --- FORMULARIO DE REGISTRO ---
const RegistroInsumos = ({ stylesRegistro, invernaderoProp }) => {
  const [invernadero, setInvernadero] = useState(invernaderoProp?.nombre || '');
  const [idLote, setIdLote] = useState(invernaderoProp?.id_lote || '');
  const [etapa, setEtapa] = useState('');
  const [tipo, setTipo] = useState('');
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('');
  const [fecha, setFecha] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Lista de insumos disponibles desde la API
  const [insumosDisponibles, setInsumosDisponibles] = useState([]);

  // Cargar usuario local
  useEffect(() => {
    const cargarUsuario = async () => {
      const user = await getUser();
      if (user) {
        setUsuario(user);
        console.log('👤 Usuario logueado detectado:', user);
      }
    };
    cargarUsuario();
  }, []);

  // Cargar insumos disponibles
  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        const res = await fetch(`${API_BASE}/insumos/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const lista = data.insumos || data;
        setInsumosDisponibles(lista);
        console.log('📦 Insumos disponibles:', lista);
      } catch (err) {
        console.warn('⚠️ Error al obtener insumos:', err);
      }
    };
    fetchInsumos();
  }, []);

const handleRegistro = async () => {
  // Validación: nombre NO obligatorio
  if (
    !invernadero.trim() ||
    !etapa.trim() ||
    !tipo.trim() ||
    !cantidad.toString().trim() ||
    !unidad.trim()
  ) {
    Alert.alert("Error", "Completa todos los campos excepto el nombre del insumo.");
    return;
  }

  setCargando(true);
  const cantidadFloat = parseFloat(cantidad);

  // Formato base del registro
  const data = {
    id_invernadero: invernaderoProp?.id_lote || "",
    id_etapa: etapa,
    nombre, // puede ir vacío
    tipo,
    cantidad: cantidadFloat,
    unidad,
    fecha_aplicacion: fecha
      ? new Date(fecha.split("-").reverse().join("-")).toISOString()
      : null,
    responsable: usuario?.nombre || usuario?.correo || "Usuario local",
    observaciones: "",
    stock_disponible: cantidadFloat,
  };

  try {
    const state = await NetInfo.fetch();

    // 🔍 Verificar si realmente podemos contactar al servidor
    let servidorDisponible = false;

if (state.isConnected) {
  try {
    const res = await fetch(`${API_BASE}/insumos/`, { method: "GET" });
    servidorDisponible = res.ok;
  } catch (e) {
    servidorDisponible = false;
  }
}


    // 🟢 ONLINE REAL: Registrar en API
    if (state.isConnected && servidorDisponible) {
      const res = await fetch(`${API_BASE}/insumos/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const response = await res.json();

      // Descontar stock
      await fetch(`${API_BASE}/insumos/descontar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          insumo_id: response.id,
          cantidad_usada: cantidadFloat,
        }),
      });

      Alert.alert("✅ Éxito", "Insumo registrado y stock actualizado");
    } 
    else {
      // 🔴 OFFLINE REAL → Guardar registro para sincronizar
      const insumoSel = insumosDisponibles.find((i) => i.nombre === nombre);

      const offlineData = {
        ...data,
        insumo_id: insumoSel?._id || null,
        cantidad_usada: cantidadFloat,
        stock_antes: insumoSel?.stock || 0,
        offline: true,
        fecha_registro_offline: new Date().toISOString(),
      };

      const saved = await saveLocalData("Insumos", offlineData);

      if (saved) {
        Alert.alert(
          "⚠️ Sin conexión",
          "El insumo se guardó localmente y se sincronizará cuando haya internet."
        );
      } else {
        Alert.alert("Error", "No se pudo guardar el insumo localmente.");
      }
    }

    // 🧹 Limpiar formulario
    setEtapa("");
    setTipo("");
    setNombre("");
    setCantidad("");
    setUnidad("");
    setFecha("");
    setProveedor("");

  } catch (err) {
    console.warn("⚠️ Error al registrar insumo:", err);
    Alert.alert("Error", "No se pudo registrar el insumo.");
  } finally {
    setCargando(false);
  }
};


  const onChangeFecha = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      const dia = selectedDate.getDate().toString().padStart(2, '0');
      const mes = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const año = selectedDate.getFullYear();
      setFecha(`${dia}-${mes}-${año}`);
    }
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="refresh-circle-outline" size={80} color="#4CAF50" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#4CAF50' }}>
          Registrando insumo...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.etapaContainer}>
      <Text style={stylesRegistro.titleScreen}>+ Registrar insumo</Text>

      {/* INVERNADERO */}
      <Text style={stylesRegistro.label}>Invernadero</Text>
      <View style={stylesRegistro.pickerBox}>
        <Picker selectedValue={invernadero} onValueChange={setInvernadero}>
          {invernaderoProp && (
            <Picker.Item label={invernaderoProp.nombre} value={invernaderoProp.nombre} />
          )}
        </Picker>
      </View>

      {/* ID Lote */}
      <Text style={stylesRegistro.label}>ID del lote</Text>
      <TextInput
        style={[stylesRegistro.input, { backgroundColor: "#eee" }]}
        value={idLote}
        editable={false}
      />

      {/* ETAPA */}
      <Text style={stylesRegistro.label}>Etapa</Text>
      <View style={stylesRegistro.pickerBox}>
        <Picker selectedValue={etapa} onValueChange={setEtapa}>
          <Picker.Item label="Selecciona etapa" value="" />
          <Picker.Item label="Siembra" value="siembra" />
          <Picker.Item label="Fertilización / Fumigación" value="fertilizacion" />
          <Picker.Item label="Cosecha" value="cosecha" />
        </Picker>
      </View>

      {/* TIPO DE INSUMO */}
      <Text style={stylesRegistro.label}>Tipo de insumo</Text>
      <View style={stylesRegistro.pickerBox}>
        <Picker selectedValue={tipo} onValueChange={setTipo}>
          <Picker.Item label="Selecciona tipo" value="" />
          <Picker.Item label="Químico" value="quimico" />
          <Picker.Item label="Fertilizante" value="fertilizante" />
          <Picker.Item label="Otro" value="otro" />
        </Picker>
      </View>

      {/* NOMBRE DEL INSUMO */}
      <Text style={stylesRegistro.label}>Nombre del insumo</Text>
      <View style={stylesRegistro.pickerBox}>
        <Picker selectedValue={nombre} onValueChange={setNombre}>
          <Picker.Item label="Selecciona un insumo" value="" />
          {insumosDisponibles.map((insumo) => (
            <Picker.Item key={insumo._id} label={insumo.nombre} value={insumo.nombre} />
          ))}
        </Picker>
      </View>

      {/* CANTIDAD Y UNIDAD */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={stylesRegistro.label}>Cantidad</Text>
          <TextInput
            style={stylesRegistro.input}
            keyboardType="numeric"
            placeholder="25"
            placeholderTextColor="#999"
            value={cantidad}
            onChangeText={setCantidad}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={stylesRegistro.label}>Unidad</Text>
          <View style={stylesRegistro.pickerBox}>
            <Picker selectedValue={unidad} onValueChange={setUnidad}>
              <Picker.Item label="Kg" value="kg" />
              <Picker.Item label="L" value="l" />
              <Picker.Item label="g" value="g" />
            </Picker>
          </View>
        </View>
      </View>

      {/* FECHA */}
      <Text style={stylesRegistro.label}>Fecha de aplicación</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <TextInput
          style={stylesRegistro.input}
          placeholder="DD-MM-AAAA"
          placeholderTextColor="#999"
          value={fecha}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          value={new Date()}
          onChange={onChangeFecha}
          maximumDate={new Date()}
        />
      )}

      {/* PROVEEDOR */}
      <Text style={stylesRegistro.label}>Proveedor</Text>
      <TextInput
        style={stylesRegistro.input}
        placeholder="Nombre del proveedor"
        placeholderTextColor="#999"
        value={proveedor}
        onChangeText={setProveedor}
      />

      {/* BOTÓN */}
      <TouchableOpacity style={stylesRegistro.button} onPress={handleRegistro}>
        <Text style={stylesRegistro.buttonText}>Registrar Insumo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function InsumosScreen({ route, navigation }) {
  const { id_lote, nombre_invernadero } = route.params || {};
  const [activeTab, setActiveTab] = useState('registro');
  const [insumos, setInsumos] = useState([]);

  const fetchInsumos = async () => {
    try {
      const res = await fetch(`${API_BASE}/insumos/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const lista = data.insumos || data;
      setInsumos(lista);
    } catch (err) {
      console.warn('⚠️ Error al obtener insumos:', err);
      Alert.alert('Error', 'No se pudieron cargar los insumos.');
    }
  };

  useEffect(() => {
    if (activeTab === 'ver') fetchInsumos();
  }, [activeTab]);

  const renderContent = () => {
    if (activeTab === 'registro') {
      return (
        <RegistroInsumos
          stylesRegistro={styles}
          invernaderoProp={{ nombre: nombre_invernadero, id_lote }}
        />
      );
    }
    if (activeTab === 'ver') return <ViewInsumos />;
  };

  return (
    <View style={styles.safeArea}>
      <Text style={styles.title}>Gestión de Insumos</Text>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'registro' && styles.tabButtonActive]}
          onPress={() => setActiveTab('registro')}
        >
          <Text style={[styles.tabText, activeTab === 'registro' && styles.tabTextActive]}>
            ➕ Registrar Insumo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'ver' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ver')}
        >
          <Text style={[styles.tabText, activeTab === 'ver' && styles.tabTextActive]}>
            📋 Ver Insumos
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>{renderContent()}</View>
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9F9F9', paddingHorizontal: 15 },
  title: { fontSize: 24, fontWeight: '700', color: '#4CAF50', textAlign: 'center', marginTop: 30, marginBottom: 20 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#E0E0E0', paddingVertical: 8, borderRadius: 10, marginBottom: 15 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 8, marginHorizontal: 4, backgroundColor: '#F0F0F0', alignItems: 'center' },
  tabButtonActive: { backgroundColor: '#4CAF50', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  tabText: { color: '#333', fontSize: width < 380 ? 12 : 14, fontWeight: '600', textAlign: 'center' },
  tabTextActive: { color: '#fff' },
  contentWrapper: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  etapaContainer: { borderRadius: 12, backgroundColor: '#fff', padding: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, elevation: 2, flex: 1 },
  titleScreen: { fontSize: 20, fontWeight: '700', color: '#4CAF50', marginBottom: 15, textAlign: 'center' },
  label: { color: '#333', marginBottom: 5, fontSize: 14, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10, color: '#333', backgroundColor: '#fff' },
  pickerBox: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10, backgroundColor: '#fff', justifyContent: 'center', height: 50 },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  contentWrapper: { flex: 1 },
});
