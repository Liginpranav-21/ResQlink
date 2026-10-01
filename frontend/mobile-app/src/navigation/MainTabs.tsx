// Bottom-tab navigation for the authenticated app.
import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import HomeScreen from '../screens/Home/HomeScreen';
import SOSScreen from '../screens/SOS/SOSScreen';
import NearbyScreen from '../screens/Nearby/NearbyScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { SIGNAL } from '../utils/theme';
import type { GpsStatus } from '../hooks/useLocation';
import type { GPSCoordinates } from '../types';

const Tab = createBottomTabNavigator();

interface Props {
  location: GPSCoordinates | null;
  gpsStatus: GpsStatus;
  selectedType: string | null;
  setSelectedType: (id: string) => void;
}

const icons: Record<string, keyof typeof Feather.glyphMap> = {
  Home: 'home', SOS: 'radio', Nearby: 'map-pin', History: 'clock', Profile: 'user',
};

export default function MainTabs({ location, gpsStatus, selectedType, setSelectedType }: Props) {
  const { t } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: SIGNAL,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: {
          backgroundColor: t.glass,
          borderTopColor: t.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused }) =>
          route.name === 'SOS' ? (
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                marginTop: -18,
                backgroundColor: '#FF3B30',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: t.surface,
                shadowColor: '#FF3B30',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              <Feather name={icons.SOS} size={20} color="#F0F1F3" />
            </View>
          ) : (
            <Feather name={icons[route.name] || 'circle'} size={19} color={focused ? SIGNAL : t.muted} />
          ),
      })}
    >
      <Tab.Screen name="Home">
        {(navProps) => (
          <HomeScreen
            location={location}
            gpsStatus={gpsStatus}
            onPickType={(id) => {
              setSelectedType(id);
              navProps.navigation.navigate('SOS');
            }}
            onOpenSOS={() => navProps.navigation.navigate('SOS')}
            onOpenNearby={() => navProps.navigation.navigate('Nearby')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="SOS"
        options={{ tabBarLabelStyle: { fontSize: 10, fontWeight: '800', color: '#FF3B30', letterSpacing: 0.5 } }}
      >
        {() => <SOSScreen selectedType={selectedType} location={location} gpsStatus={gpsStatus} />}
      </Tab.Screen>
      <Tab.Screen name="Nearby">
        {() => <NearbyScreen location={location} gpsStatus={gpsStatus} />}
      </Tab.Screen>
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
