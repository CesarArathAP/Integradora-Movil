import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import { saveLocalData, getPendingData } from '../../services/storage/offlineStorage';

const BASE_URL = 'https://2jqpt3g7-8000.usw3.devtunnels.ms';
const API_URL = `${BASE_URL}/etapas/`;

const EtapasProduccionScreen = ({ route }) => {
  const { invernadero } = route?.params || {};
  const [idLote, setIdLote] = useState('');
  const [nombreSubEtapa, setNombreSubEtapa] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [responsable, setResponsable] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [insumo, setInsumo] = useState('');
  const [imagen, setImagen] = useState(null);

  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFin, setMostrarFin] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [cargando, setCargando] = useState(false);

  const etapas = ['Siembra', 'Riego', 'Cosecha', 'Mantenimiento'];
  const subEtapas = ['Preparación', 'Ejecución', 'Seguimiento'];
  const [insumos, setInsumos] = useState([]);
  const etapaPrincipal = 'Siembra y Riego';

  useEffect(() => {
    const obtenerInsumos = async () => {
      try {
        const response = await fetch(`${BASE_URL}/insumos/`);
        const data = await response.json();
        setInsumos(data.insumos || []);
      } catch (error) {
        console.error('Error al obtener insumos:', error);
        setInsumos([]);
      }
    };
    obtenerInsumos();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => setIsConnected(state.isConnected));
    return () => unsubscribe();
  }, []);

  // 🔽 Aquí está el cambio: compresión + conversión a base64 🔽
  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permiso.status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere acceso a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const imagenOriginal = result.assets[0].uri;

      // Reducir tamaño de la imagen
      const imagenComprimida = await ImageManipulator.manipulateAsync(
        imagenOriginal,
        [{ resize: { width: 800 } }], // 📏 ajusta el ancho máximo
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      // Guardar solo base64 comprimido
      setImagen(`data:image/jpeg;base64,${imagenComprimida.base64}`);
    }
  };
  // 🔼 Fin del cambio 🔼

  const registrar = async () => {
    if (!idLote || !nombreSubEtapa || !responsable) {
      Alert.alert('Error', 'Completa todos los campos obligatorios.');
      return;
    }

    setCargando(true);

    const registro = {
      id_lote: idLote,
      etapa_principal: etapaPrincipal,
      nombre_sub_etapa: nombreSubEtapa,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      descripcion,
      responsable,
      insumos_utilizados: insumo ? [{ nombre: insumo }] : [],
      evidencias: imagen ? [{ uri: imagen }] : [],
      observaciones,
      cantidad_cosechada: 0,
      unidad_cosecha: '',
    };

    try {
      if (isConnected) {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registro),
        });

        if (response.ok) {
          Alert.alert('✅ Éxito', 'Etapa registrada correctamente en el servidor.');
        } else {
          await saveLocalData('etapas', registro);
          Alert.alert('⚠️ Guardado offline', 'Servidor no disponible. Registro almacenado localmente.');
        }
      } else {
        await saveLocalData('etapas', registro);
        Alert.alert('📦 Guardado offline', 'Registro almacenado localmente.');
      }
    } catch (error) {
      await saveLocalData('etapas', registro);
      Alert.alert('⚠️ Sin conexión', 'Registro guardado localmente.');
    } finally {
      setCargando(false);
      limpiarCampos();
    }
  };

  const limpiarCampos = () => {
    setIdLote('');
    setNombreSubEtapa('');
    setDescripcion('');
    setResponsable('');
    setObservaciones('');
    setInsumo('');
    setImagen(null);
    setFechaInicio(new Date());
    setFechaFin(new Date());
  };

  const verDatosOffline = async () => {
    const pendientes = await getPendingData();

    if (pendientes.length === 0) {
      Alert.alert('Datos offline', 'No hay registros pendientes.');
      return;
    }

    const mensaje = pendientes
      .filter(item => item.collection === 'etapas')
      .map((item, i) => {
        const d = item.data;
        return `Registro ${i + 1}:
Etapa: ${d.etapa_principal}
Subetapa: ${d.nombre_sub_etapa}
Responsable: ${d.responsable}
Lote: ${d.id_lote}
Fecha inicio: ${new Date(d.fecha_inicio).toLocaleDateString()}
Imagen: ${d.evidencias?.length ? '📷 Sí' : 'No'}
----------------------`;
      })
      .join('\n');

    Alert.alert('📦 Etapas pendientes', mensaje);
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="refresh-circle-outline" size={60} color="#4CAF50" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#4CAF50' }}>
          Registrando etapa...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subtitle}>Registro de Etapas de Producción</Text>

      {/* MOSTRAR INVERNADERO SELECCIONADO */}
<Text style={styles.label}>Invernadero</Text>

<View style={styles.input}>
  <Picker
  selectedValue={invernadero?.id}
  onValueChange={(valor) => setInvernadero(valor)}
>
  {invernadero && (
    <Picker.Item
      label={invernadero.nombre}   // 👈 Muestra el nombre real
      value={invernadero.id}       // 👈 El id del invernadero
    />
  )}
</Picker>
</View>

      <Text style={styles.label}>ID Lote *</Text>
<TextInput
  style={styles.input}
  value={idLote}
  onChangeText={setIdLote}
  placeholder="Ej. Lote 1"
  keyboardType="default"
/>


      <Text style={styles.label}>Subetapa *</Text>
      <Picker selectedValue={nombreSubEtapa} onValueChange={setNombreSubEtapa} style={styles.picker}>
        <Picker.Item label="Selecciona subetapa" value="" />
        {subEtapas.map((sub) => <Picker.Item key={sub} label={sub} value={sub} />)}
      </Picker>

      <Text style={styles.label}>Insumo utilizado</Text>
      <Picker selectedValue={insumo} onValueChange={setInsumo} style={styles.picker}>
        <Picker.Item label="Selecciona un insumo" value="" />
        {insumos.map((item) => (
          <Picker.Item key={item.id || item._id || item.nombre} label={item.nombre} value={item.nombre} />
        ))}
      </Picker>

      <Text style={styles.label}>Fecha inicio *</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setMostrarInicio(true)}>
        <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
        <Text style={styles.dateText}>{fechaInicio.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {mostrarInicio && (
        <DateTimePicker value={fechaInicio} mode="date" display="default" onChange={(e, d) => { setMostrarInicio(false); if (d) setFechaInicio(d); }} />
      )}

      <Text style={styles.label}>Fecha fin *</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setMostrarFin(true)}>
        <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
        <Text style={styles.dateText}>{fechaFin.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {mostrarFin && (
        <DateTimePicker value={fechaFin} mode="date" display="default" onChange={(e, d) => { setMostrarFin(false); if (d) setFechaFin(d); }} />
      )}

      <Text style={styles.label}>Responsable *</Text>
      <TextInput style={styles.input} value={responsable} onChangeText={setResponsable} placeholder="Nombre del responsable" />

      <Text style={styles.label}>Descripción</Text>
      <TextInput style={[styles.input, styles.textArea]} multiline value={descripcion} onChangeText={setDescripcion} placeholder="Descripción breve..." />

      <Text style={styles.label}>Observaciones</Text>
      <TextInput style={[styles.input, styles.textArea]} multiline value={observaciones} onChangeText={setObservaciones} placeholder="Notas u observaciones..." />

      <TouchableOpacity style={styles.evidenceButton} onPress={seleccionarImagen}>
        <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
        <Text style={styles.evidenceText}>Subir evidencia fotográfica</Text>
      </TouchableOpacity>

      {imagen && <Image source={{ uri: imagen }} style={styles.imagePreview} />}

      <TouchableOpacity style={styles.registerButton} onPress={registrar}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
        <Text style={styles.registerText}>Registrar Etapa</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewButton} onPress={verDatosOffline}>
        <Ionicons name="eye-outline" size={20} color="#fff" />
        <Text style={styles.viewText}>Ver datos offline</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  subtitle: { fontSize: 18, fontWeight: '700', color: '#4CAF50', textAlign: 'center', marginBottom: 10 },
  label: { fontWeight: '600', color: '#333', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
  textArea: { height: 100, textAlignVertical: 'top' },
  picker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff', marginBottom: 5 },
  dateButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
  dateText: { marginLeft: 10 },
  evidenceButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#607D8B', padding: 15, borderRadius: 8, marginTop: 20 },
  evidenceText: { color: '#fff', marginLeft: 10, fontWeight: '600' },
  registerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, marginTop: 25 },
  registerText: { color: '#fff', fontWeight: '700', marginLeft: 10 },
  imagePreview: { width: '100%', height: 200, borderRadius: 10, marginTop: 15 },
  viewButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#2196F3', padding: 15, borderRadius: 8, marginTop: 15 },
  viewText: { color: '#fff', marginLeft: 10, fontWeight: '600' },
});

export default EtapasProduccionScreen;
