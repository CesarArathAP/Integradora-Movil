import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { commonStyles } from "../../styles/common";
import { colors } from "../../styles/colors";

const CosechaScreen = () => {
  const [cosechas, setCosechas] = useState([]);
  const [nueva, setNueva] = useState({
    tipoCultivo: "",
    cantidadRecolectada: "",
    fechaCosecha: "",
    destino: "",
  });

  const API_URL = "http://localhost:3000/api/cosecha";

  const cargarCosechas = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCosechas(data);
    } catch (err) {
      console.error("Error al cargar cosechas:", err);
    }
  };

  const agregarCosecha = async () => {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nueva),
      });
      setNueva({ tipoCultivo: "", cantidadRecolectada: "", fechaCosecha: "", destino: "" });
      cargarCosechas();
    } catch (err) {
      console.error("Error al agregar cosecha:", err);
    }
  };

  useEffect(() => {
    cargarCosechas();
  }, []);

  return (
    <View style={[commonStyles.container, styles.innerContainer]}>
      <Text style={styles.title}>Registro de Cosecha</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tipo de Cultivo"
          value={nueva.tipoCultivo}
          onChangeText={(text) => setNueva({ ...nueva, tipoCultivo: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Cantidad Recolectada"
          keyboardType="numeric"
          value={nueva.cantidadRecolectada}
          onChangeText={(text) => setNueva({ ...nueva, cantidadRecolectada: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Fecha de Cosecha (YYYY-MM-DD)"
          value={nueva.fechaCosecha}
          onChangeText={(text) => setNueva({ ...nueva, fechaCosecha: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Destino"
          value={nueva.destino}
          onChangeText={(text) => setNueva({ ...nueva, destino: text })}
        />

        <TouchableOpacity style={styles.button} onPress={agregarCosecha}>
          <Text style={styles.buttonText}>Registrar Cosecha</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cosechas}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.tipoCultivo}</Text>
            <Text>Cantidad: {item.cantidadRecolectada}</Text>
            <Text>Fecha: {item.fechaCosecha}</Text>
            <Text>Destino: {item.destino}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  innerContainer: { padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  form: { marginBottom: 15 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: colors.white, fontWeight: "bold" },
  card: {
    backgroundColor: colors.greenLight,
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    borderColor: colors.greenMedium,
    borderWidth: 1,
  },
  cardTitle: { fontWeight: "bold", color: colors.textPrimary },
});

export default CosechaScreen;
