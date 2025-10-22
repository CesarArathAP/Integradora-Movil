import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { commonStyles } from '../styles/common'; // Manteniendo por si se usan en otros lugares
import { colors } from '../styles/colors'; // Manteniendo por si se usan en otros lugares
import ViewInsumos from './etapas/ViewInsumos'; 

const { width } = Dimensions.get('window');

// Componente del Formulario de Registro (Tu código original)
const RegistroInsumos = ({ stylesRegistro }) => {
  const [invernadero, setInvernadero] = useState('');
  const [etapa, setEtapa] = useState('');
  const [tipo, setTipo] = useState('');
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('');
  const [fecha, setFecha] = useState('');
  const [proveedor, setProveedor] = useState('');

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

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent} // Usamos el estilo de contenido del componente de referencia
      style={styles.etapaContainer} // El formulario estará dentro del contenedor con sombra
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
        placeholderTextColor="#999" // Color más neutro
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
      <TextInput
        style={stylesRegistro.input}
        placeholder="DD-MM-AAAA"
        placeholderTextColor="#999"
        value={fecha}
        onChangeText={setFecha}
      />

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
      <TouchableOpacity
        style={stylesRegistro.button}
        onPress={handleRegistro}
      >
        <Text style={stylesRegistro.buttonText}>
          Registrar Insumo
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};


// Componente principal InsumosScreen con la navegación por tabs
export default function InsumosScreen() {
  const [activeTab, setActiveTab] = useState('registro'); // 'registro' o 'ver'

  const renderContent = () => {
    // Renderiza el componente basado en la pestaña activa
    return activeTab === 'registro' 
      ? <RegistroInsumos stylesRegistro={styles} />
      : <ViewInsumos />;
  };

  return (
    <View style={styles.safeArea}>
      
      {/* Título de la pantalla */}
      <Text style={styles.title}>Gestión de Insumos</Text>

      {/* Tabs de selección */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton, 
            activeTab === 'registro' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('registro')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'registro' && styles.tabTextActive,
          ]}>
            ➕ Registrar Insumo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton, 
            activeTab === 'ver' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('ver')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'ver' && styles.tabTextActive,
          ]}>
            📋 Ver Insumos
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Contenido de la Pestaña Activa */}
      <View style={styles.contentWrapper}>
        {renderContent()}
      </View>
      
    </View>
  );
}

// Estilos basados en el componente de referencia, ajustados para el formulario.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9', // Fondo claro
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50', // Color verde
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },

  // --- Estilos de la Barra de Navegación (Tabs) ---
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
    backgroundColor: '#F0F0F0', // Fondo inactivo
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#4CAF50', // Fondo activo (Verde)
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
  tabTextActive: {
    color: '#fff', // Texto activo (Blanco)
  },
  
  // --- Contenedor del Contenido (Registro/Lista) ---
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
     paddingBottom: 20,
  },
  etapaContainer: {
    // Estilo de sombra y fondo blanco para el contenido del tab
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


  // --- Estilos del Formulario de Registro (Inputs) ---
  titleScreen: {
    fontSize: 20, // Ajustado para ser un subtítulo dentro del contenedor
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
    borderColor: '#ccc', // Borde más suave
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    color: '#333',
    backgroundColor: '#fff', // Fondo del input blanco
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
    backgroundColor: '#4CAF50', // Verde principal
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
    fontSize: 16
  }
});