import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Asumiendo que las rutas a styles son correctas desde el componente padre
import { colors } from '../../styles/colors';
import { commonStyles } from '../../styles/common';

export default function ViewInsumos() {
  return (
    // Se elimina commonStyles.container para usar el estilo específico de la nueva estética
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Insumos Registrados</Text>
      {/* Lógica para mostrar la lista de insumos iría aquí (e.g., usando FlatList) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Usamos el estilo 'etapaContainer' del componente de referencia para el contenido
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#fff', // Fondo blanco
    padding: 15, // Aumentamos un poco el padding
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    flex: 1, 
  },
  title: {
    fontSize: 20, // Ajustado para ser un subtítulo
    fontWeight: '700',
    color: '#4CAF50', // Color verde
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    color: '#333', // Texto principal
    marginBottom: 10,
    textAlign: 'center',
  }
});