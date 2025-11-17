import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function FotoRegistroScreen({ navigation }) {
  const [etapas, setEtapas] = useState([]);
  const [selectedEtapa, setSelectedEtapa] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [photo, setPhoto] = useState(null);
  const [invernadero, setInvernadero] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const API_BASE = "https://2jqpt3g7-8000.usw3.devtunnels.ms";

  useEffect(() => {
    const fetchData = async () => {
      const inv = await AsyncStorage.getItem("invernaderoSeleccionado");
      const user = await AsyncStorage.getItem("usuario");
      if (inv) setInvernadero(JSON.parse(inv));
      if (user) setUsuario(JSON.parse(user));
      fetchEtapas();
    };
    fetchData();
  }, []);

  const fetchEtapas = async () => {
  try {
    const res = await fetch(`${API_BASE}/etapas/`);
    const data = await res.json();
    const lista = Array.isArray(data) ? data : data.etapas || [];
    setEtapas(lista);
    console.log("✅ Etapas obtenidas:", lista);
  } catch (e) {
    console.log("⚠️ Error al obtener etapas:", e);
  }
};

  const takePicture = async () => {
    if (cameraRef.current) {
      const pic = await cameraRef.current.takePictureAsync({ base64: true });
      setPhoto(pic);
      setShowCamera(false);
      console.log("📸 Foto tomada:", pic.uri);
    }
  };

  const subirImagen = async () => {
    if (!photo || !selectedEtapa || !descripcion) {
      Alert.alert("Campos incompletos", "Completa todos los campos antes de enviar.");
      return;
    }

    try {
      setLoading(true);
      const fechaActual = new Date().toISOString();

      const body = {
        id_invernadero: invernadero?._id || "",
        id_etapa: selectedEtapa,
        tipo: "foto",
        nombre_original: "foto_campo.jpg",
        descripcion,
        fecha_subida: fechaActual,
        subido_por: usuario?._id || "anonimo",
        archivo_base64: photo.base64,
      };

      const res = await fetch(`${API_BASE}/imagenes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert("✅ Éxito", "Imagen subida correctamente");
        setPhoto(null);
        setDescripcion("");
        setSelectedEtapa("");
      } else {
        Alert.alert("Error", data.detail || "No se pudo subir la imagen");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al subir la imagen");
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Cargando permisos...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "black" }}>Se requiere permiso para usar la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.text}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text>Subiendo imagen...</Text>
      </View>
    );
  }
if (showCamera) {
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef} />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => setShowCamera(false)}>
          <Text style={styles.text}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.text}>Tomar Foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


  const fechaHoy = new Date().toLocaleDateString();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📷 Registro Fotográfico</Text>

      <View style={styles.infoBox}>
        {invernadero && (
          <Text style={styles.info}>
            🌿 Invernadero: <Text style={styles.bold}>{invernadero.nombre}</Text>
          </Text>
        )}
        <Text style={styles.info}>
          👤 Usuario: <Text style={styles.bold}>{usuario?.nombre || "Desconocido"}</Text>
        </Text>
        <Text style={styles.info}>
          📅 Fecha: <Text style={styles.bold}>{fechaHoy}</Text>
        </Text>
      </View>

      <Text style={styles.label}>Etapa:</Text>
      <Picker
        selectedValue={selectedEtapa}
        style={styles.picker}
        onValueChange={(val) => setSelectedEtapa(val)}
      >
        {etapas.map((e) => (
        <Picker.Item
          key={e._id}
          label={e.nombre_sub_etapa || e.etapa_principal || "Sin nombre"}
          value={e._id}
        />
      ))}
      </Picker>

      <Text style={styles.label}>Descripción:</Text>
      <TextInput
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Ejemplo: Siembra de jitomate cherry"
        style={styles.input}
      />

      {!photo ? (
        <TouchableOpacity style={styles.captureBtn} onPress={() => setShowCamera(true)}>
          <Text style={styles.text}>📸 Abrir cámara</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.preview} />
          <TouchableOpacity
            style={[styles.button, { marginVertical: 10 }]}
            onPress={() => setPhoto(null)}
          >
            <Text style={styles.text}>Tomar otra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={subirImagen}>
            <Text style={styles.text}>📤 Subir Imagen</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", padding: 10 },
  header: {
    color: "#2E7D32",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  info: { color: "#333", textAlign: "center", marginVertical: 2 },
  bold: { fontWeight: "bold", color: "#1B5E20" },
  label: { color: "#333", marginTop: 10 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  camera: { flex: 1, borderRadius: 10, overflow: "hidden" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  captureBtn: {
    backgroundColor: "#2E7D32",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  text: { color: "#fff", fontWeight: "bold" },
  previewContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  preview: { width: "90%", height: "60%", borderRadius: 10 },
  button: {
    backgroundColor: "#1B5E20",
    padding: 12,
    borderRadius: 10,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
