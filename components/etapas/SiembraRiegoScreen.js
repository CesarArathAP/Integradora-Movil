import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { saveLocalData, getPendingData } from '../../services/storage/offlineStorage';

const SiembraRiegoScreen = () => {
  const [invernadero, setInvernadero] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [responsable, setResponsable] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFin, setMostrarFin] = useState(false);
  const [imagen, setImagen] = useState(null);

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
      setImagen(result.assets[0].uri);
    }
  };

  const registrar = async () => {
    if (!invernadero || !responsable) {
      Alert.alert('Error', 'Completa todos los campos obligatorios.');
      return;
    }

    const registro = { invernadero, fechaInicio, fechaFin, responsable, descripcion, imagen };
    const guardado = await saveLocalData('siembra', registro);

    if (guardado) {
      Alert.alert('Éxito', 'Etapa de Siembra y Riego registrada correctamente (offline).');
      // Limpiar formulario
      setInvernadero('');
      setFechaInicio(new Date());
      setFechaFin(new Date());
      setResponsable('');
      setDescripcion('');
      setImagen(null);
    } else {
      Alert.alert('Error', 'No se pudo guardar el registro offline.');
    }
  };

  // 🔹 Nuevo: botón para ver datos guardados offline
  const verDatosOffline = async () => {
  const pendientes = await getPendingData();

  if (pendientes.length === 0) {
    Alert.alert('Datos offline', 'No hay registros pendientes.');
    return;
  }

  // Formateamos cada registro
  const mensaje = pendientes
    .map((item, index) => {
      const { uuid, modulo, data, fechaCreacion } = item;
      return `Registro ${index + 1}:
Modulo: ${modulo}
ID: ${uuid}
Fecha: ${new Date(fechaCreacion).toLocaleString()}
Invernadero: ${data.invernadero || '-'}
Responsable: ${data.responsable || '-'}
Fecha Inicio: ${data.fechaInicio ? new Date(data.fechaInicio).toLocaleDateString() : '-'}
Fecha Fin: ${data.fechaFin ? new Date(data.fechaFin).toLocaleDateString() : '-'}
Descripción: ${data.descripcion || '-'}
Imagen: ${data.imagen ? '📷 Sí' : 'No'}
------------------------`;
    })
    .join('\n');

  Alert.alert('Datos offline', mensaje);
};


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subtitle}>Siembra y Riego</Text>

      <Text style={styles.label}>Invernadero *</Text>
      <TextInput style={styles.input} value={invernadero} onChangeText={setInvernadero} placeholder="Ej. Invernadero 1" />

      <Text style={styles.label}>Fecha inicio *</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setMostrarInicio(true)}>
        <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
        <Text style={styles.dateText}>{fechaInicio.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {mostrarInicio && (
        <DateTimePicker
          value={fechaInicio}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, date) => { setMostrarInicio(false); if (date) setFechaInicio(date); }}
        />
      )}

      <Text style={styles.label}>Fecha fin *</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setMostrarFin(true)}>
        <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
        <Text style={styles.dateText}>{fechaFin.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {mostrarFin && (
        <DateTimePicker
          value={fechaFin}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, date) => { setMostrarFin(false); if (date) setFechaFin(date); }}
        />
      )}

      <Text style={styles.label}>Responsable *</Text>
      <TextInput style={styles.input} value={responsable} onChangeText={setResponsable} placeholder="Nombre del responsable" />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Descripción breve..."
      />

      <TouchableOpacity style={styles.evidenceButton} onPress={seleccionarImagen}>
        <Ionicons name="camera-outline" size={22} color="#fff" />
        <Text style={styles.evidenceText}>Añadir evidencia fotográfica</Text>
      </TouchableOpacity>

      {imagen && <Image source={{ uri: imagen }} style={styles.imagePreview} />}

      <TouchableOpacity style={styles.registerButton} onPress={registrar}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
        <Text style={styles.registerText}>Registrar Etapa</Text>
      </TouchableOpacity>

      {/* 🔹 Botón para ver datos offline */}
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

export default SiembraRiegoScreen;
