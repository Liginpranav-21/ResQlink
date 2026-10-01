// NearbyScreen — shows hospitals, police stations, and fire rescue teams
// closest to the user's live GPS position. Tapping any place (or the GPS
// card itself) opens it directly in Google Maps.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { Screen, Card, OfflineBanner } from '../../components/common/UI';
import { useTheme } from '../../hooks/useTheme';
import { NearbyService, type NearbyCategory, type NearbyPlace } from '../../services/NearbyService';
import { fmtDistance, fmtEta, navLink, openInGoogleMaps } from '../../utils/helpers';
import type { GpsStatus } from '../../hooks/useLocation';
import type { GPSCoordinates } from '../../types';
import { SIGNAL } from '../../utils/theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  location: GPSCoordinates | null;
  gpsStatus: GpsStatus;
}

const TABS: { id: NearbyCategory; label: string; icon: keyof typeof Feather.glyphMap; color: string }[] = [
  { id: 'hospital', label: 'Hospitals', icon: 'plus-square', color: '#FF3B30' },
  { id: 'police', label: 'Police', icon: 'shield', color: '#2563EB' },
  { id: 'fire_station', label: 'Fire Rescue', icon: 'zap', color: '#F97316' },
];

export default function NearbyScreen({ location, gpsStatus }: Props) {
  const { t } = useTheme();
  const titleColor = t.text;
  const [tab, setTab] = useState<NearbyCategory>('hospital');
  const [results, setResults] = useState<Record<NearbyCategory, NearbyPlace[]>>({
    hospital: [],
    police: [],
    fire_station: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchedFor, setSearchedFor] = useState<GPSCoordinates | null>(null);

  const load = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError('');
    try {
      const data = await NearbyService.fetchAll(location);
      setResults(data);
      setSearchedFor(location);
    } catch (err) {
      console.error('[NearbyScreen] load failed', err);
      setError(err instanceof Error ? err.message : 'Could not load nearby services. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (location && !searchedFor) load();
  }, [location, searchedFor, load]);

  const active = TABS.find((tb) => tb.id === tab)!;
  const list = results[tab];

  return (
    <View style={{ flex: 1, backgroundColor: '#07080A' }}>
      <Screen scroll={true}>
        <OfflineBanner />
        <View style={{ padding: 20 }}>
          <Text style={[styles.titleText, { color: titleColor }]}>Nearby Help</Text>
          <Text style={styles.subtitleText}>
            Hospitals, police, and fire rescue closest to you
          </Text>

          {/* Your location card */}
          <Pressable
            onPress={() => location && openInGoogleMaps(location.latitude, location.longitude, 'My location')}
            disabled={!location}
          >
            {({ pressed }) => (
              <Card style={[styles.locationCard, { opacity: pressed ? 0.85 : 1 }]}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: gpsStatus === 'granted' ? '#34d399' : gpsStatus === 'denied' ? '#fbbf24' : t.muted },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#A6ACB6', fontSize: 13, fontWeight: '700' }}>Your Location</Text>
                  <Text style={{ color: '#767C87', fontSize: 12, marginTop: 4, fontWeight: '600' }}>
                    {gpsStatus === 'denied'
                      ? 'Location off — enable it to find nearby help'
                      : location
                      ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                      : 'Acquiring position…'}
                  </Text>
                </View>
                {!!location && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Text style={{ color: SIGNAL, fontSize: 12, fontWeight: '800' }}>Open in Maps</Text>
                    <Feather name="external-link" size={12} color={SIGNAL} />
                  </View>
                )}
              </Card>
            )}
          </Pressable>

          {/* Category tabs */}
          <View style={styles.tabRow}>
            {TABS.map((tb) => {
              const isActive = tab === tb.id;
              return (
                <Pressable
                  key={tb.id}
                  onPress={() => setTab(tb.id)}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: isActive ? '#16181D' : '#101216',
                      borderColor: isActive ? tb.color : '#181B20',
                    },
                  ]}
                >
                  <Feather name={tb.icon} size={18} color={isActive ? tb.color : '#A6ACB6'} />
                  <Text style={{ color: isActive ? '#FFFFFF' : '#A6ACB6', fontSize: 11, fontWeight: '800', marginTop: 6 }}>
                    {tb.label}
                  </Text>
                  {results[tb.id].length > 0 && (
                    <Text style={{ color: isActive ? tb.color : '#767C87', fontSize: 10, marginTop: 2, fontWeight: '700' }}>
                      {results[tb.id].length} found
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Refresh */}
          <Pressable
            onPress={load}
            disabled={!location || loading}
            style={({ pressed }) => [
              styles.refreshBtn,
              { opacity: !location || loading ? 0.5 : pressed ? 0.8 : 1 }
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {!loading && <Feather name="refresh-cw" size={12} color="#A6ACB6" />}
              <Text style={{ color: '#A6ACB6', fontSize: 12, fontWeight: '700' }}>
                {loading ? 'Searching…' : 'Refresh nearby search'}
              </Text>
            </View>
          </Pressable>

          {!!error && (
            <View style={[styles.warn, { flexDirection: 'row', gap: 8, alignItems: 'center' }]}>
              <Feather name="alert-triangle" size={13} color="#fbbf24" />
              <Text style={{ color: '#fbbf24', fontSize: 12, flex: 1 }}>{error}</Text>
            </View>
          )}

          {gpsStatus === 'denied' && (
            <View style={[styles.warn, { flexDirection: 'row', gap: 8, alignItems: 'flex-start' }]}>
              <Feather name="alert-triangle" size={13} color="#fbbf24" style={{ marginTop: 1 }} />
              <Text style={{ color: '#fbbf24', fontSize: 12, flex: 1 }}>
                Location is off, so nearby results can't be found. Enable location access to use this feature.
              </Text>
            </View>
          )}

          {/* Results */}
          <View style={{ marginTop: 16 }}>
            {loading ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <ActivityIndicator color={SIGNAL} />
                <Text style={{ color: '#A6ACB6', fontSize: 12, marginTop: 10, fontWeight: '600' }}>Finding {active.label.toLowerCase()} near you…</Text>
              </View>
            ) : list.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                <Feather name={active.icon} size={30} color="#4C525B" />
                <Text style={{ color: '#767C87', fontSize: 13, marginTop: 10, textAlign: 'center', fontWeight: '600' }}>
                  {location ? `No ${active.label.toLowerCase()} found nearby.` : 'Waiting for your location…'}
                </Text>
              </View>
            ) : (
              list.map((place) => (
                <Card key={place.id} style={styles.resultCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View style={[styles.iconWrapper, { backgroundColor: `${active.color}15` }]}>
                      <Feather name={active.icon} size={20} color={active.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>{place.name}</Text>
                      {!!place.address && (
                        <Text style={{ color: '#A6ACB6', fontSize: 12, marginTop: 4, fontWeight: '500', lineHeight: 16 }}>{place.address}</Text>
                      )}
                      <View style={{ flexDirection: 'row', gap: 14, marginTop: 8 }}>
                        <Text style={{ color: active.color, fontSize: 12, fontWeight: '800' }}>
                          {fmtDistance(place.distanceKm)} away
                        </Text>
                        <Text style={{ color: '#767C87', fontSize: 12, fontWeight: '600' }}>~{fmtEta(place.distanceKm)}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                    <Pressable
                      onPress={() => openInGoogleMaps(place.latitude, place.longitude, place.name)}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        { backgroundColor: active.color, opacity: pressed ? 0.9 : 1 }
                      ]}
                    >
                      <Feather name="map-pin" size={12} color="#FFFFFF" style={{ marginRight: 5 }} />
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>View on Maps</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => Linking.openURL(navLink(place.latitude, place.longitude))}
                      style={({ pressed }) => [
                        styles.actionBtnOutline,
                        { opacity: pressed ? 0.85 : 1 }
                      ]}
                    >
                      <Feather name="navigation" size={12} color="#A6ACB6" style={{ marginRight: 5 }} />
                      <Text style={{ color: '#A6ACB6', fontSize: 12, fontWeight: '800' }}>Directions</Text>
                    </Pressable>
                    {!!place.phone && (
                      <Pressable
                        onPress={() => Linking.openURL(`tel:${place.phone}`)}
                        style={({ pressed }) => [
                          styles.actionBtnOutline,
                          { opacity: pressed ? 0.85 : 1 }
                        ]}
                      >
                        <Feather name="phone" size={12} color="#A6ACB6" style={{ marginRight: 5 }} />
                        <Text style={{ color: '#A6ACB6', fontSize: 12, fontWeight: '800' }}>Call</Text>
                      </Pressable>
                    )}
                  </View>
                </Card>
              ))
            )}
          </View>

          <Text style={{ color: '#4C525B', fontSize: 10, marginTop: 12, textAlign: 'center', lineHeight: 14, fontWeight: '500' }}>
            Place data from OpenStreetMap contributors. Always call local emergency numbers in a life-threatening situation.
          </Text>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  titleText: {
    color: '#F0F1F3',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitleText: {
    color: '#767C87',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  locationCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#101216',
    borderWidth: 1,
    borderColor: '#181B20',
    borderRadius: 20,
    padding: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  tabRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  refreshBtn: {
    marginTop: 14,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#181B20',
    backgroundColor: '#101216',
  },
  warn: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(240, 182, 92,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(240, 182, 92,0.25)',
  },
  resultCard: {
    marginBottom: 10,
    backgroundColor: '#101216',
    borderWidth: 1,
    borderColor: '#181B20',
    borderRadius: 24,
    padding: 16,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#181B20',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
});
