import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  StyleSheet, Dimensions, Platform 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { commonStyles } from '../styles/common';
import { colors } from '../styles/colors';
import ViewInsumos from './etapas/ViewInsumos';

const { width } = Dimensions.get('window');

// --- Formulario de Registro ---
const RegistroInsumos = ({ stylesRegistro }) => {
  const [invernadero, setInvernadero] = useState('');
  const [etapa, setEtapa] = useState('');
  const [tipo, setTipo] = useState('');
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('');
  const [fecha, setFecha] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleRegistro = () => {
    console.log({
      invernadero,
      etapa,
      tipo,
      nombre,
      cantidad,
      unidad,
      fecha,
      proveedor,
    });
    alert('Insumo Registrado (simulado)');
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

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.etapaContainer}
    >
      <Text style={stylesRegistro.titleScreen}>+ Registrar insumo</Text>

      {/* INVERNADERO */}
      <Text style={stylesRegistro.label}>Invernadero</Text>
      <View style={stylesRegistro.pickerBox}>
        <Picker selectedValue={invernadero} onValueChange={setInvernadero}>
          <Picker.Item label="Seleccionar invernadero" value="" />
          <Picker.Item label="Invernadero 1" value="1" />
          <Picker.Item label="Invernadero 2" value="2" />
        </Picker>
      </View>

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
      <TextInput
        style={stylesRegistro.input}
        placeholder="Ej. Fertilizante NPK 30-20"
        placeholderTextColor="#999"
        value={nombre}
        onChangeText={setNombre}
      />

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

      {/* FECHA DE APLICACIÓN */}
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

      {/* BOTÓN REGISTRO */}
      <TouchableOpacity style={stylesRegistro.button} onPress={handleRegistro}>
        <Text style={stylesRegistro.buttonText}>Registrar Insumo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- Componente principal InsumosScreen ---
export default function InsumosScreen() {
  const [activeTab, setActiveTab] = useState('registro');

  const renderContent = () => (
    activeTab === 'registro' ? <RegistroInsumos stylesRegistro={styles} /> : <ViewInsumos />
  );

  return (
    <View style={styles.safeArea}>
      <Text style={styles.title}>Gestión de Insumos</Text>

      {/* Tabs */}
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

// --- Estilos (sin cambios estructurales) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E0E0E0',
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    color: '#333',
    fontSize: width < 380 ? 12 : 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: { color: '#fff' },
  contentWrapper: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  etapaContainer: {
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    flex: 1,
  },
  titleScreen: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    color: '#333',
    marginBottom: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    color: '#333',
    backgroundColor: '#fff',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    height: 50,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});