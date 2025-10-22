import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import ProduccionScreen from './components/ProduccionScreen';
import CameraModule from './components/CameraModule';
import InsumosScreen from './components/InsumosScreen'; // ✅ nueva pantalla
import MainApp from './components/MainApp'; // opcional si lo usas como menú adicional

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          // 🔹 Si NO ha iniciado sesión → mostrar Login
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        ) : (
          // 🔹 Si está logueado → mostrar Home y otras pantallas
          <>
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} onLogout={() => setIsLoggedIn(false)} />}
            </Stack.Screen>

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

            <Stack.Screen
              name="Insumos"
              component={InsumosScreen}
              options={{
                title: 'Gestión de Insumos',
                headerShown: true,
                headerStyle: { backgroundColor: '#FFC107' },
                headerTintColor: '#fff',
              }}
            />

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