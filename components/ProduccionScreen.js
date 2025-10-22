import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import SiembraRiegoScreen from './etapas/SiembraRiegoScreen';
import FertilizacionFumigacionScreen from './etapas/FertilizacionFumigacionScreen';
import CosechaScreen from './etapas/CosechaScreen';

const { width } = Dimensions.get('window');

const ProduccionScreen = () => {
  const [etapaSeleccionada, setEtapaSeleccionada] = useState('Siembra y Riego');

  const renderEtapa = () => {
    switch (etapaSeleccionada) {
      case 'Siembra y Riego':
        return <SiembraRiegoScreen />;
      case 'Fertilización y Fumigación':
        return <FertilizacionFumigacionScreen />;
      case 'Cosecha':
        return <CosechaScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Etapas de Producción</Text>

        {/* Tabs de selección */}
        <View style={styles.tabContainer}>
          {['Siembra y Riego', 'Fertilización y Fumigación', 'Cosecha'].map(
            (etapa) => (
              <TouchableOpacity
                key={etapa}
                style={[
                  styles.tabButton,
                  etapaSeleccionada === etapa && styles.tabButtonActive,
                ]}
                onPress={() => setEtapaSeleccionada(etapa)}
              >
                <Text
                  style={[
                    styles.tabText,
                    etapaSeleccionada === etapa && styles.tabTextActive,
                  ]}
                >
                  {etapa}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Contenido dinámico de la etapa */}
        <View style={styles.etapaContainer}>{renderEtapa()}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContent: {
    paddingTop: 30,
    paddingHorizontal: 15,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
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
  tabTextActive: {
    color: '#fff',
  },
  etapaContainer: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
});

export default ProduccionScreen;
