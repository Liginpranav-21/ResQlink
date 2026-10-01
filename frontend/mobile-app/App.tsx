// Root component for ResQLink mobile.
// Wires the theme provider, auth gate, location, and navigation together.
import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider, useTheme } from './src/hooks/useTheme';
import { useLocation } from './src/hooks/useLocation';
import { useAuthListener } from './src/hooks/useAuthListener';
import { useBackgroundTimeout } from './src/hooks/useBackgroundTimeout';
import { useAuthStore } from './src/store/authStore';
import AuthScreen from './src/screens/Auth/AuthScreen';
import MainTabs from './src/navigation/MainTabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

function Splash() {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0B10', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background glow effects — soft ambient blooms, same language as the
          web dashboard's radial-gradient glow, approximated in RN with
          large low-opacity circles (no blur module needed since there's no
          detail behind them to blur — flat colour + low alpha reads the
          same as a soft gradient at this size). */}
      <View style={{
        position: 'absolute',
        width: 340,
        height: 340,
        borderRadius: 170,
        backgroundColor: 'rgba(255, 59, 48, 0.05)',
        top: '20%',
      }} />
      <View style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(37, 99, 235, 0.035)',
        bottom: '8%',
      }} />

      {/* Multi-ring Logo Wrapper */}
      <View style={{
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
      }}>
        <View style={{
          width: 110,
          height: 110,
          borderRadius: 55,
          borderWidth: 1,
          borderColor: 'rgba(255, 59, 48, 0.22)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#FF3B30',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#FF3B30',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 22,
            elevation: 8,
          }}>
            <Feather name="radio" size={34} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <View style={{ alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <Text style={{ color: '#F3F4F7', fontSize: 32, fontWeight: '900', letterSpacing: 1 }}>ResQLink</Text>
        <Text style={{ color: '#A6ACBA', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, opacity: 0.9 }}>
          Connecting Help When Networks Fail
        </Text>
      </View>

      <ActivityIndicator color="#FF3B30" size="small" />
    </View>
  );
}

function Inner() {
  const { t, resolved } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { initializing } = useAuthListener();
  useBackgroundTimeout(!!user, 60);
  const { location, gpsStatus } = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const navTheme = {
    ...(resolved === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(resolved === 'dark' ? DarkTheme : DefaultTheme).colors,
      background: t.bg,
      card: t.surface,
      text: t.text,
      border: t.border,
      primary: '#FF3B30',
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      {initializing ? (
        <Splash />
      ) : user ? (
        <NavigationContainer theme={navTheme}>
          <MainTabs
            location={location}
            gpsStatus={gpsStatus}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
          />
        </NavigationContainer>
      ) : (
        <AuthScreen />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Inner />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
