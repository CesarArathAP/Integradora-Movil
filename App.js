import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 🧠 Importa tus componentes
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import ProduccionScreen from './components/ProduccionScreen';
import CameraModule from './components/CameraModule';
import InsumosScreen from './components/InsumosScreen';
import ViewInsumos from './components/etapas/ViewInsumos';
import MainApp from './components/MainApp';
import SincronizacionScreen from './components/SincronizacionScreen';
import ReportesScreen from './components/ReportesScreen';
import InvernaderosScreen from './components/InvernaderosScreen';
import SelectInvernaderoScreen from './components/SelectInvernaderoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 🔹 Si NO ha iniciado sesión → mostrar Login */}
        {!isLoggedIn ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        ) : (
          <>
            {/* 🔹 Nueva pantalla ANTES del Home */}
            <Stack.Screen
              name="SelectInvernadero"
              component={SelectInvernaderoScreen}
              options={{
                title: 'Selecciona un Invernadero',
                headerShown: true,
                headerStyle: { backgroundColor: '#2E7D32' },
                headerTintColor: '#fff',
              }}
            />

            {/* 🏠 Pantalla principal */}
            <Stack.Screen name="Home">
              {(props) => (
                <HomeScreen
                  {...props}
                  onLogout={() => setIsLoggedIn(false)}
                />
              )}
            </Stack.Screen>

            {/* 📦 Producción */}
            <Stack.Screen
              name="Produccion"
              component={ProduccionScreen}
              options={{
                title: 'Etapas de Producción',
                headerShown: true,
                headerStyle: { backgroundColor: '#4CAF50' },
                headerTintColor: '#fff',
              }}
            />

            {/* 🧪 Insumos */}
            <Stack.Screen
              name="Insumos"
              component={InsumosScreen}
              options={{
                title: 'Registro de Insumos',
                headerShown: true,
                headerStyle: { backgroundColor: '#FFC107' },
                headerTintColor: '#fff',
              }}
            />

            <Stack.Screen
              name="ViewInsumos"
              component={ViewInsumos}
              options={{
                title: 'Lista de Insumos',
                headerShown: true,
                headerStyle: { backgroundColor: '#4CAF50' },
                headerTintColor: '#fff',
              }}
            />

            {/* 📷 Cámara */}
            <Stack.Screen
              name="CameraModule"
              component={CameraModule}
              options={{
                title: 'Cámara Multimedia',
                headerShown: true,
                headerStyle: { backgroundColor: '#03A9F4' },
                headerTintColor: '#fff',
              }}
            />

            {/* ⚙️ Sincronización */}
            <Stack.Screen
              name="Sincronizacion"
              component={SincronizacionScreen}
              options={{
                title: 'Sincronización de Datos',
                headerShown: true,
                headerStyle: { backgroundColor: '#FF5722' },
                headerTintColor: '#fff',
              }}
            />

            {/* 📊 Reportes */}
            <Stack.Screen
              name="Reportes"
              component={ReportesScreen}
              options={{
                title: 'Generar Reporte',
                headerShown: true,
                headerStyle: { backgroundColor: '#6A1B9A' },
                headerTintColor: '#fff',
              }}
            />

            {/* 🗺️ Mapa de Invernaderos */}
            <Stack.Screen
              name="Invernaderos"
              component={InvernaderosScreen}
              options={{
                title: 'Mapa de Invernaderos',
                headerShown: true,
                headerStyle: { backgroundColor: '#2E7D32' },
                headerTintColor: '#fff',
              }}
            />

            {/* 🧭 Panel principal */}
            <Stack.Screen
              name="MainApp"
              component={MainApp}
              options={{
                title: 'Panel Principal',
                headerShown: true,
                headerStyle: { backgroundColor: '#10b981' },
                headerTintColor: '#fff',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
