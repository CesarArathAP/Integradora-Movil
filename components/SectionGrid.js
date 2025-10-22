import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

const SectionGrid = () => {
  // Generar 442 secciones como en la imagen
  const sections = Array.from({ length: 442 }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Panel principal</Text>
      
      <View style={styles.grid}>
        {sections.map((sectionNumber) => (
          <View 
            key={sectionNumber} 
            style={[
              styles.sectionCard,
              sectionNumber % 2 === 0 ? styles.greenCard : styles.whiteCard
            ]}
          >
            <Text style={[
              styles.sectionText,
              sectionNumber % 2 === 0 ? styles.whiteText : styles.greenText
            ]}>
              SECTION {sectionNumber}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionCard: {
    width: '48%', // 2 columnas
    height: 80,
    marginBottom: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  whiteCard: {
    backgroundColor: colors.white,
    borderColor: colors.greenMedium,
  },
  greenCard: {
    backgroundColor: colors.primary,
    borderColor: colors.greenMedium,
  },
  sectionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  greenText: {
    color: colors.primary,
  },
  whiteText: {
    color: colors.white,
  },
});

export default SectionGrid;