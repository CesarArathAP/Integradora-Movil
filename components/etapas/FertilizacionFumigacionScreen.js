import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { commonStyles } from "../../styles/common";
import { colors } from "../../styles/colors";

const FertilizacionFumigacionScreen = () => {
  const [fertilizaciones, setFertilizaciones] = useState([]);
  const [nuevo, setNuevo] = useState({
    tipoFertilizante: "",
    cantidad: "",
    fechaAplicacion: "",
    observaciones: "",
  });

  const API_URL = "http://localhost:3000/api/fertilizacion";

  const cargarFertilizaciones = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setFertilizaciones(data);
    } catch (err) {
      console.error("Error al cargar fertilizaciones:", err);
    }
  };

  const agregarFertilizacion = async () => {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });
      setNuevo({ tipoFertilizante: "", cantidad: "", fechaAplicacion: "", observaciones: "" });
      cargarFertilizaciones();
    } catch (err) {
      console.error("Error al agregar fertilización:", err);
    }
  };

  useEffect(() => {
    cargarFertilizaciones();
  }, []);

  return (
    <View style={[commonStyles.container, styles.innerContainer]}>
      <Text style={styles.title}>Fertilización y Fumigación</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tipo de Fertilizante"
          value={nuevo.tipoFertilizante}
          onChangeText={(text) => setNuevo({ ...nuevo, tipoFertilizante: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Cantidad"
          keyboardType="numeric"
          value={nuevo.cantidad}
          onChangeText={(text) => setNuevo({ ...nuevo, cantidad: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Fecha de Aplicación (YYYY-MM-DD)"
          value={nuevo.fechaAplicacion}
          onChangeText={(text) => setNuevo({ ...nuevo, fechaAplicacion: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Observaciones"
          value={nuevo.observaciones}
          onChangeText={(text) => setNuevo({ ...nuevo, observaciones: text })}
        />

        <TouchableOpacity style={styles.button} onPress={agregarFertilizacion}>
          <Text style={styles.buttonText}>Registrar Fertilización</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={fertilizaciones}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.tipoFertilizante}</Text>
            <Text>Cantidad: {item.cantidad}</Text>
            <Text>Fecha: {item.fechaAplicacion}</Text>
            <Text>Obs: {item.observaciones}</Text>
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

export default FertilizacionFumigacionScreen;
