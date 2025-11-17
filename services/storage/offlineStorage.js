import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  OFFLINE_DATA: 'offlineData',
  USER_DATA: 'userData',
};

/* ===========================================================
   🧩 FUNCIONES DE DATOS OFFLINE (sincronización)
   =========================================================== */
export async function saveLocalData(modulo, data) {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
    const parsed = existing ? JSON.parse(existing) : [];

    // 🔹 Aseguramos que data siempre sea un objeto
    const dataObj = typeof data === 'string' ? { nombre: data } : data;
    const newDataStr = JSON.stringify(dataObj, Object.keys(dataObj).sort());

    const existingIndex = parsed.findIndex(
      item =>
        item.modulo === modulo &&
        JSON.stringify(item.data, Object.keys(item.data).sort()) === newDataStr
    );

    if (existingIndex !== -1) {
      parsed[existingIndex].fechaCreacion = new Date().toISOString();
      parsed[existingIndex].intentos = (parsed[existingIndex].intentos || 0) + 1;
      console.log(`🔄 Registro existente actualizado en módulo: ${modulo}`);
    } else {
      parsed.push({
        uuid: Date.now().toString(),
        modulo,
        data: dataObj,
        isSynced: false,
        intentos: 1,
        fechaCreacion: new Date().toISOString(),
      });
      console.log(`✅ Nuevo registro guardado offline en módulo: ${modulo}`);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(parsed));
    return true;
  } catch (error) {
    console.error('❌ Error al guardar datos offline:', error);
    return false;
  }
}

export async function getPendingData() {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
    const parsed = existing ? JSON.parse(existing) : [];
    return parsed.filter(item => !item.isSynced);
  } catch (error) {
    console.error('❌ Error al obtener datos pendientes:', error);
    return [];
  }
}

export async function markAsSynced(uuid) {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
    if (!existing) return;

    const parsed = JSON.parse(existing);
    const updated = parsed.map(item =>
      item.uuid === uuid ? { ...item, isSynced: true } : item
    );

    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(updated));
    console.log(`✅ Registro ${uuid} marcado como sincronizado.`);
  } catch (error) {
    console.error('❌ Error al marcar como sincronizado:', error);
  }
}

/* ===========================================================
   👤 FUNCIONES DE USUARIO (sesión local)
   =========================================================== */
export async function saveUser(userData) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    console.log('✅ Usuario guardado localmente.');
  } catch (error) {
    console.error('❌ Error al guardar el usuario:', error);
  }
}

export async function getUser() {
  try {
    const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('❌ Error al obtener el usuario:', error);
    return null;
  }
}

export async function clearUser() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    console.log('🧹 Usuario eliminado del almacenamiento local.');
  } catch (error) {
    console.error('❌ Error al eliminar el usuario:', error);
  }
}

export async function savePendingData(data) {
  return await saveLocalData("etapas_produccion", data);
}

/* ===========================================================
   📦 INSUMOS OFFLINE (consulta offline)
   =========================================================== */

const STORAGE_INSUMOS = "insumosLocal";

/* Guardar insumos descargados localmente */
export async function saveInsumosLocal(lista) {
  try {
    await AsyncStorage.setItem(STORAGE_INSUMOS, JSON.stringify(lista));
    console.log("📦 Insumos guardados para uso offline.");
  } catch (error) {
    console.error("❌ Error guardando insumos offline:", error);
  }
}

/* Leer insumos cuando no hay internet */
export async function getInsumosLocal() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_INSUMOS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("❌ Error obteniendo insumos offline:", error);
    return [];
  }
}
