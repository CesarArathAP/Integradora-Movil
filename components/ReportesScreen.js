import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ReportesScreen() {
  const [tipo, setTipo] = useState('');
  const [fechaGeneracion, setFechaGeneracion] = useState(new Date());
  const [invernadero, setInvernadero] = useState('');
  const [etapa, setEtapa] = useState('');
  const [rangoFechas, setRangoFechas] = useState('');
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [cargando, setCargando] = useState(false);

  const API_BASE = 'https://tu-api-backend.com/api/reportes'; // cambia esto por tu endpoint real

  const generarReporte = async () => {
    if (!tipo || !invernadero || !etapa || !rangoFechas) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los campos antes de generar el reporte.');
      return;
    }

    const reporte = {
      tipo,
      fecha_generacion: fechaGeneracion.toISOString(),
      filtros: {
        invernadero,
        etapa,
        rango_fechas: rangoFechas,
      },
    };

    console.log('📄 Enviando reporte:', reporte);

    try {
      setCargando(true);
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reporte),
      });

      const data = await response.json();
      setCargando(false);

      if (response.ok) {
        Alert.alert('✅ Éxito', `Reporte generado correctamente.\nID: ${data.id || 'N/A'}`);
      } else {
        Alert.alert('❌ Error', data.message || 'No se pudo generar el reporte.');
      }
    } catch (error) {
      setCargando(false);
      console.error('Error al generar reporte:', error);
      Alert.alert('Error', 'No se pudo conectar al servidor. Revisa tu conexión.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>Generación de Reportes</Text>

        <TextInput
          style={styles.input}
          placeholder="Tipo de Reporte (ej. Producción)"
          value={tipo}
          onChangeText={setTipo}
        />

        <TouchableOpacity style={styles.btnFecha} onPress={() => setMostrarFecha(true)}>
          <Text style={styles.btnFechaTexto}>Seleccionar Fecha de Generación</Text>
        </TouchableOpacity>

        {mostrarFecha && (
          <DateTimePicker
            value={fechaGeneracion}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') setMostrarFecha(false);
              if (selectedDate) setFechaGeneracion(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Fecha seleccionada:</Text>
        <Text style={styles.valorFecha}>{fechaGeneracion.toLocaleString()}</Text>

        <TextInput
          style={styles.input}
          placeholder="Invernadero (ej. Invernadero Principal)"
          value={invernadero}
          onChangeText={setInvernadero}
        />

        <TextInput
          style={styles.input}
          placeholder="Etapa (ej. Siembra)"
          value={etapa}
          onChangeText={setEtapa}
        />

        <TextInput
          style={styles.input}
          placeholder="Rango de Fechas (ej. 2025-10-01 a 2025-10-05)"
          value={rangoFechas}
          onChangeText={setRangoFechas}
        />

        <TouchableOpacity style={styles.boton} onPress={generarReporte} disabled={cargando}>
          <Text style={styles.textoBoton}>
            {cargando ? 'Generando...' : 'Generar Reporte'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  btnFecha: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  btnFechaTexto: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  label: {
    marginTop: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  valorFecha: {
    marginBottom: 10,
    color: '#555',
  },
  boton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  textoBoton: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
