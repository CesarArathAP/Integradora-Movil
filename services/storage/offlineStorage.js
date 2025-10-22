import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveLocalData(modulo, data) {
  try {
    const newRecord = {
      uuid: Date.now().toString(), // ID único simple
      modulo,
      data,
      isSynced: false,
      fechaCreacion: new Date().toISOString(),
    };

    const existing = await AsyncStorage.getItem('offlineData');
    const parsed = existing ? JSON.parse(existing) : [];
    parsed.push(newRecord);
    await AsyncStorage.setItem('offlineData', JSON.stringify(parsed));

    console.log(`✅ Datos guardados offline en módulo: ${modulo}`);
    return true;
  } catch (error) {
    console.error('❌ Error al guardar datos offline:', error);
    return false;
  }
}

export async function getPendingData() {
  try {
    const existing = await AsyncStorage.getItem('offlineData');
    const parsed = existing ? JSON.parse(existing) : [];
    return parsed.filter(item => !item.isSynced);
  } catch (error) {
    console.error('❌ Error al obtener datos pendientes:', error);
    return [];
  }
}

export async function markAsSynced(uuid) {
  try {
    const existing = await AsyncStorage.getItem('offlineData');
    if (!existing) return;

    const parsed = JSON.parse(existing);
    const updated = parsed.map(item =>
      item.uuid === uuid ? { ...item, isSynced: true } : item
    );

    await AsyncStorage.setItem('offlineData', JSON.stringify(updated));
    console.log(`🔄 Registro ${uuid} marcado como sincronizado.`);
  } catch (error) {
    console.error('❌ Error al marcar como sincronizado:', error);
  }
}
