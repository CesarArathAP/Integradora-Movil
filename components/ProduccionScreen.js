import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import { savePendingData } from "../services/storage/offlineStorage";


const BASE_URL = 'https://2jqpt3g7-8000.usw3.devtunnels.ms';
const API_URL = `${BASE_URL}/etapas/`;

const EtapasProduccionScreen = ({ route }) => {
  const { id_lote, nombre_invernadero } = route?.params || {};


  // FORMULARIO GENERAL
  const [etapa, setEtapa] = useState('');
  const [idLote, setIdLote] = useState(id_lote || '');
  const [subEtapa, setSubEtapa] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [responsable, setResponsable] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [insumo, setInsumo] = useState('');
  const [imagen, setImagen] = useState(null);
  const [cantidadCosecha, setCantidadCosecha] = useState('');
  const [unidadCosecha, setUnidadCosecha] = useState('');

  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFin, setMostrarFin] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);

  const etapas = [
    'Siembra y Riego',
    'Fertilización y Fumigación',
    'Cosecha'
  ];

useEffect(() => {
  const obtenerInsumos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/insumos/`);
      const data = await response.json();   // ❌ CRASHEA AQUÍ EN OFFLINE
      setInsumos(data.insumos || []);
    } catch (err) {
      console.log(err);
      setInsumos([]);
    }
  };
  obtenerInsumos();
}, []);

  // 📌 Selección de imagen comprimida
  const seleccionarImagen = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      const img = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      setImagen(`data:image/jpeg;base64,${img.base64}`);
    }
  };

const registrar = async () => {
  if (!etapa || !idLote || !responsable) {
    Alert.alert("Campos incompletos", "Debes llenar los campos obligatorios (*)");
    return;
  }

  setLoading(true);

  const registro = {
    id_invernadero: id_lote,
    nombre_invernadero,
    id_lote: idLote,
    etapa_principal: etapa,
    nombre_sub_etapa: subEtapa,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    descripcion,
    responsable,
    insumos_utilizados: insumo ? [{ nombre: insumo }] : [],
    evidencias: imagen ? [{ uri: imagen }] : [],
    observaciones,
    cantidad_cosechada: etapa === "Cosecha" ? Number(cantidadCosecha) : 0,
    unidad_cosecha: etapa === "Cosecha" ? unidadCosecha : "",
    timestamp: Date.now()
  };

  try {
    const net = await NetInfo.fetch();

    // 🔌 NO HAY INTERNET → OFFLINE
    if (!net.isConnected) {
      console.log("📴 Modo offline → guardando en memoria local");

      await savePendingData(registro);
      Alert.alert("Sin conexión", "Se guardó en memoria. Se sincronizará cuando haya internet.");

      limpiarCampos();
      return;
    }

    // 🌐 HAY INTERNET → INTENTAR ENVIAR ONLINE
    console.log("🌐 Intentando registro ONLINE...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registro),
    });

    // Validación cuando el servidor está apagado o no responde JSON
    const status = response.status;

    if (status >= 200 && status < 300) {
      console.log("✅ Registro enviado ONLINE correctamente");
      Alert.alert("Éxito", "Registro enviado correctamente.");
      limpiarCampos();
    } else {
      console.log("⚠️ Servidor no respondió correctamente, guardando offline");
      await savePendingData(registro);
      Alert.alert("Servidor sin respuesta", "Registro guardado offline.");
      limpiarCampos();
    }

  } catch (error) {
    console.log("❌ Error al intentar registrar online:", error);
    await savePendingData(registro);

    Alert.alert("Error de red", "No se pudo conectar. Guardado en modo offline.");
    limpiarCampos();
  } finally {
    setLoading(false); 
  }
};


  // 📌 Render dinámico según etapa seleccionada
  const camposPorEtapa = () => {
    if (etapa === "Siembra y Riego") {
      return (
        <>
          <Text style={styles.label}>Subetapa</Text>
          <Picker selectedValue={subEtapa} onValueChange={setSubEtapa} style={styles.input}>
            <Picker.Item label="Selecciona" value="" />
            <Picker.Item label="Preparación" value="Preparación" />
            <Picker.Item label="Riego Inicial" value="Riego Inicial" />
          </Picker>

          <Text style={styles.label}>Insumo utilizado</Text>
          <Picker selectedValue={insumo} onValueChange={setInsumo} style={styles.input}>
            <Picker.Item label="Selecciona" value="" />
            {insumos.map((i) => (
              <Picker.Item key={i._id} label={i.nombre} value={i.nombre} />
            ))}
          </Picker>

          <Text style={styles.label}>Descripción</Text>
          <TextInput style={styles.textArea} multiline value={descripcion} onChangeText={setDescripcion} />

          <Text style={styles.label}>Observaciones</Text>
          <TextInput style={styles.textArea} multiline value={observaciones} onChangeText={setObservaciones} />
        </>
      );
    }

    if (etapa === "Fertilización y Fumigación") {
      return (
        <>
          <Text style={styles.label}>Insumo aplicado *</Text>
          <Picker selectedValue={insumo} onValueChange={setInsumo} style={styles.input}>
            <Picker.Item label="Selecciona" value="" />
            {insumos.map((i) => (
              <Picker.Item key={i._id} label={i.nombre} value={i.nombre} />
            ))}
          </Picker>

          <Text style={styles.label}>Observaciones</Text>
          <TextInput style={styles.textArea} multiline value={observaciones} onChangeText={setObservaciones} />
        </>
      );
    }

    if (etapa === "Cosecha") {
      return (
        <>
          <Text style={styles.label}>Cantidad cosechada *</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={cantidadCosecha}
            onChangeText={setCantidadCosecha}
          />

          <Text style={styles.label}>Unidad *</Text>
          <TextInput
            style={styles.input}
            value={unidadCosecha}
            onChangeText={setUnidadCosecha}
            placeholder="kg, cajas, etc."
          />

          <Text style={styles.label}>Observaciones</Text>
          <TextInput style={styles.textArea} multiline value={observaciones} onChangeText={setObservaciones} />
        </>
      );
    }

    return null;
  };

  const limpiarCampos = () => {
  setEtapa("");
  setSubEtapa("");
  setResponsable("");
  setDescripcion("");
  setObservaciones("");
  setInsumo("");
  setImagen(null);
  setCantidadCosecha("");
  setUnidadCosecha("");
  setFechaInicio(new Date());
  setFechaFin(new Date());
};

  return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Registro de Etapas</Text>

      {loading && (
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ marginTop: 5, color: "#4CAF50" }}>Enviando...</Text>
        </View>
      )}

      {nombre_invernadero && (
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#4CAF50" }}>
          🏠 Invernadero: {nombre_invernadero}
        </Text>
      )}

      <Text style={styles.label}>Etapa *</Text>
      <Picker selectedValue={etapa} onValueChange={setEtapa} style={styles.input}>
        <Picker.Item label="Selecciona etapa" value="" />
        {etapas.map((e) => (
          <Picker.Item key={e} label={e} value={e} />
        ))}
      </Picker>

      <Text style={styles.label}>ID Lote *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#e6e6e6" }]}
        value={idLote}
        editable={false}
      />

      <Text style={styles.label}>Responsable *</Text>
      <TextInput style={styles.input} value={responsable} onChangeText={setResponsable} />

      <Text style={styles.label}>Fecha inicio *</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setMostrarInicio(true)}>
        <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
        <Text>{fechaInicio.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {mostrarInicio && (
        <DateTimePicker
          value={fechaInicio}
          mode="date"
          onChange={(e, d) => {
            setMostrarInicio(false);
            if (d) setFechaInicio(d);
          }}
        />
      )}

      <Text style={styles.label}>Fecha fin *</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setMostrarFin(true)}>
        <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
        <Text>{fechaFin.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {mostrarFin && (
        <DateTimePicker
          value={fechaFin}
          mode="date"
          onChange={(e, d) => {
            setMostrarFin(false);
            if (d) setFechaFin(d);
          }}
        />
      )}

      {camposPorEtapa()}

      <TouchableOpacity style={styles.evidenceButton} onPress={seleccionarImagen}>
        <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
        <Text style={{ color: "#fff", marginLeft: 10 }}>Subir evidencia</Text>
      </TouchableOpacity>

      {imagen && <Image source={{ uri: imagen }} style={styles.imagePreview} />}

      <TouchableOpacity
        style={[
          styles.registerButton,
          loading && { backgroundColor: "#8BC34A" }
        ]}
        onPress={registrar}
        disabled={loading}
      >
        <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
        <Text style={styles.registerText}>
          {loading ? "Enviando..." : "Registrar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
);
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", color: "#4CAF50", marginBottom: 15 },
  label: { marginTop: 15, fontWeight: "600", color: "#333" },
  input: {
    borderWidth: 1, borderColor: "#ccc", padding: 10,
    borderRadius: 8, backgroundColor: "#fff"
  },
  textArea: {
    height: 100, borderWidth: 1, color: "#333",
    borderColor: "#ccc", borderRadius: 8, padding: 10,
    backgroundColor: "#fff", textAlignVertical: "top"
  },
  dateBtn: {
    borderWidth: 1, borderColor: "#ccc",
    padding: 12, borderRadius: 8, backgroundColor: "#fff",
    flexDirection: "row", alignItems: "center", gap: 10
  },
  evidenceButton: {
    marginTop: 20, backgroundColor: "#607D8B",
    padding: 15, borderRadius: 8, flexDirection: "row",
    justifyContent: "center", alignItems: "center"
  },
  imagePreview: {
    width: "100%", height: 200,
    borderRadius: 10, marginTop: 15
  },
  registerButton: {
    marginTop: 25, backgroundColor: "#4CAF50",
    padding: 15, borderRadius: 8, flexDirection: "row",
    justifyContent: "center", alignItems: "center"
  },
  registerText: { color: "#fff", fontWeight: "700", marginLeft: 10 }
});

export default EtapasProduccionScreen;
