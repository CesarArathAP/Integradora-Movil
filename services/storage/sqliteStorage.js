// services/storage/sqliteStorage.js

import * as SQLite from 'expo-sqlite';

// Abrir la base de datos
const db = SQLite.openDatabaseSync('offlineData.db');

// Inicializar la tabla
export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS siembra (
        id INTEGER PRIMARY KEY NOT NULL,
        invernadero TEXT NOT NULL,
        fechaInicio TEXT NOT NULL,
        fechaFin TEXT NOT NULL,
        responsable TEXT NOT NULL,
        descripcion TEXT,
        imagen TEXT,
        isSynced INTEGER DEFAULT 0,
        fechaCreacion TEXT NOT NULL
      );`
    );
  }, (err) => console.log('❌ Error creando tabla', err), () => console.log('✅ Tabla SQLite lista'));
};

// Guardar registro
export const saveLocalData = (registro) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO siembra (invernadero, fechaInicio, fechaFin, responsable, descripcion, imagen, fechaCreacion) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          registro.invernadero,
          registro.fechaInicio.toISOString(),
          registro.fechaFin.toISOString(),
          registro.responsable,
          registro.descripcion,
          registro.imagen,
          new Date().toISOString(),
        ],
        (_, result) => resolve(true),
        (_, error) => { console.log(error); reject(false); }
      );
    });
  });
};

// Obtener registros pendientes (no sincronizados)
export const getPendingData = () => {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM siembra WHERE isSynced = 0',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => { console.log(error); resolve([]); }
      );
    });
  });
};

// Marcar registro como sincronizado
export const markAsSynced = (id) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE siembra SET isSynced = 1 WHERE id = ?',
      [id],
      (_, result) => console.log(`🔄 Registro ${id} sincronizado.`),
      (_, error) => console.log('❌ Error al marcar sincronizado', error)
    );
  });
};
