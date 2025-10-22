// components/MainApp.js
import React from 'react';
import { ScrollView, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Header from './Header';
import Section from './Section';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';

const MainApp = ({ navigation, onLogout }) => {
  const sections = [
    { title: 'Panel principal', content: 'Contenido del panel principal...' },
    { title: 'Cabinet, audience', content: 'Información de cabinet y audience...' },
    { title: 'Screenspace', content: 'Espacio de pantalla disponible...' },
  ];

  return (
    <View style={commonStyles.container}>
      <Header />

      <ScrollView style={styles.content}>
        {sections.map((section, index) => (
          <Section key={index} title={section.title} content={section.content} />
        ))}

        {/* Navegación entre pantallas */}
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.navButtonText}>Ir al Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Insumos')}>
            <Text style={styles.navButtonText}>Ir a Insumos</Text>
          </TouchableOpacity>
        </View>

        {/* Cerrar sesión */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  navButtons: {
    marginVertical: 20,
    alignItems: 'center',
  },
  navButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    marginVertical: 6,
    width: '60%',
    alignItems: 'center',
  },
  navButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutContainer: {
    padding: 20,
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: colors.greenLight,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MainApp;