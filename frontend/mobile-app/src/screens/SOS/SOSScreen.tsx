// SOSScreen — the heart of the app. Dispatches an emergency with the user's
// live location, notifies contacts, and offers an SMS fallback that works on
// cell signal even when data/internet is down.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { showAlert } from '../../utils/alert';
import { Screen } from '../../components/common/UI';
import { OfflineBanner } from '../../components/common/UI';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { useEmergencyStore } from '../../store/emergencyStore';
import { EMERGENCY_TYPES, FIRST_AID, SOS_LEVELS } from '../../utils/constants';
import { genId, mapsLink } from '../../utils/helpers';
import { ProfileService, AlertService, NotificationService, ActivityService, EmergencyService } from '../../services';
import type { Emergency, EmergencyLevel, EmergencyContact } from '../../types';
import type { GpsStatus } from '../../hooks/useLocation';
import type { GPSCoordinates } from '../../types';

interface Props {
  selectedType: string | null;
  location: GPSCoordinates | null;
  gpsStatus: GpsStatus;
}

export default function SOSScreen({ selectedType, location, gpsStatus }: Props) {
  const { t } = useTheme();
  const titleColor = t.text;
  const user = useAuthStore((s) => s.user);
  const setSOSActive = useEmergencyStore((s) => s.setSOSActive);
  const setCurrentEmergency = useEmergencyStore((s) => s.setCurrentEmergency);
  const setHistory = useEmergencyStore((s) => s.setHistory);
  const history = useEmergencyStore((s) => s.history);

  const [level, setLevel] = useState<EmergencyLevel>(1);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [lastSos, setLastSos] = useState<Emergency | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const type = EMERGENCY_TYPES.find((e) => e.id === selectedType);
  const firstAid = selectedType ? FIRST_AID[selectedType] : undefined;
  const lvlInfo = SOS_LEVELS[level];

  const handleSOS = async () => {
    if (sending || sent || !user) return;
    setError('');
    if (gpsStatus === 'denied') {
      setError('Location is off. You can still send, but responders won’t get your coordinates. Enable location for best results.');
    }
    setSending(true);
    try {
      // Try to grab the freshest fix right now. The `location` prop may be null
      // if the first GPS read hadn't resolved when this screen mounted; a
      // last-second read greatly improves the odds responders get coordinates.
      let coords: GPSCoordinates | null = location;
      if (gpsStatus !== 'denied') {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            coords = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              altitude: pos.coords.altitude ?? undefined,
              accuracy: pos.coords.accuracy ?? undefined,
              timestamp: pos.timestamp,
            };
          }
        } catch (e) {
          console.warn('[SOS] live location read failed, falling back to last known', e);
        }
      }

      let profile: Record<string, unknown> = {};
      try {
        profile = ((await ProfileService.fetchLatest(user.uid)) || {}) as Record<string, unknown>;
      } catch (e) {
        console.error('[SOS] profile fetch failed, using session data', e);
      }

      const displayName = (profile.displayName as string) || user.displayName || 'User';
      const phone = (profile.phone as string) || user.phone || '';
      const bloodGroup = (profile.bloodGroup as string) || '';
      const cts: EmergencyContact[] =
        Array.isArray(profile.emergencyContacts) && profile.emergencyContacts.length
          ? (profile.emergencyContacts as EmergencyContact[])
          : [];
      setContacts(cts);

      const id = genId();
      const emergency: Emergency = {
        id,
        userId: user.uid,
        userName: displayName,
        userPhone: phone,
        type: (selectedType as Emergency['type']) || 'accident',
        level,
        status: 'active',
        // Pass the real coordinates or null — never a fake empty object, which
        // RTDB silently strips and which crashes the dashboard's map render.
        location: coords as GPSCoordinates,
        bloodGroup,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await EmergencyService.create(emergency);
      const results = await AlertService.notifyContacts(emergency, cts);
      await NotificationService.push(user.uid, {
        type: 'sos',
        title: 'SOS activated',
        body: `Your ${(selectedType || 'emergency').replace(/_/g, ' ')} alert was sent. ${results.length} contact(s) notified.`,
      });
      await ActivityService.log(
        'sos_created',
        `${displayName} triggered a ${(selectedType || 'emergency').replace(/_/g, ' ')} SOS (L${level})`,
        { sosId: id, userId: user.uid, level }
      );

      setLastSos(emergency);
      setCurrentEmergency(emergency);
      setHistory([emergency, ...history]);
      setSOSActive(true);
      setSent(true);
    } catch (err) {
      console.error('[SOS] failed:', err);
      setError("Couldn't reach the rescue server. Use 'Send Emergency SMS' below or call 112 now.");
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async () => {
    if (lastSos?.id) await EmergencyService.cancel(lastSos.id);
    setSOSActive(false);
    setCurrentEmergency(null);
    setSent(false);
  };

  // SMS fallback — opens the OS composer pre-filled. Works on cell signal even
  // when mobile data / wifi is down. This is the most reliable no-internet path.
  const sendSMSFallback = async (phone?: string) => {
    const target = phone || contacts[0]?.phone || '';
    if (!target) {
      showAlert(
        'No emergency contact',
        'Add an emergency contact in your profile to use the SMS fallback. You can still dial local emergency services directly.'
      );
      return;
    }
    const loc = location ? mapsLink(location.latitude, location.longitude) : '(location unavailable)';
    const body = `🆘 EMERGENCY: ${user?.displayName || 'I'} need help (${(selectedType || 'emergency').replace(/_/g, ' ')}). Location: ${loc}`;
    const url = AlertService.smsHref(target, body);
    // canOpenURL is unreliable for sms: on web and Android 11+ (package
    // visibility), so just try to open it and only warn if that throws.
    try {
      await Linking.openURL(url);
    } catch {
      showAlert('Cannot open Messages', 'Your device could not open the SMS composer.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#07080A' }}>
      <Screen scroll={true}>
        <OfflineBanner />
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={[styles.titleText, { color: titleColor }]}>Emergency SOS</Text>
          <View style={styles.subPill}>
            <Text style={styles.subPillText}>
              {type ? `${type.icon} ${type.label.toUpperCase()} SELECTED` : 'NO EMERGENCY TYPE SELECTED'}
            </Text>
          </View>
        </View>

        {!!error && (
          <View style={[styles.warn, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
            <Feather name="alert-triangle" size={14} color="#fbbf24" />
            <Text style={{ color: '#fbbf24', fontSize: 12, flex: 1 }}>{error}</Text>
          </View>
        )}

        {/* The big button */}
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <View style={styles.beaconOuterRing}>
            <View style={styles.beaconMiddleRing}>
              <Pressable
                onPress={handleSOS}
                disabled={sending || sent}
                style={[
                  styles.bigBtn,
                  {
                    backgroundColor: sent ? '#10B981' : sending ? '#F59E0B' : lvlInfo.color,
                    borderColor: sent ? 'rgba(63, 203, 140,0.3)' : sending ? 'rgba(240, 182, 92,0.3)' : 'rgba(255, 59, 48,0.3)',
                    shadowColor: sent ? '#10B981' : sending ? '#F59E0B' : lvlInfo.color,
                  },
                ]}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Feather name={sent ? 'check' : 'alert-octagon'} size={44} color="#fff" />
                )}
                <Text style={styles.bigBtnText}>
                  {sent ? 'SENT' : sending ? 'SENDING' : `SOS · L${level}`}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Level selector (hidden once sent) */}
        {!sent && !sending && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={[styles.label, { color: '#A6ACB6' }]}>Emergency severity level</Text>
            {[1, 2, 3].map((l) => {
              const info = SOS_LEVELS[l as EmergencyLevel];
              const active = level === l;
              return (
                <Pressable
                  key={l}
                  onPress={() => setLevel(l as EmergencyLevel)}
                  style={[
                    styles.levelRow,
                    {
                      borderColor: active ? info.color : '#181B20',
                      backgroundColor: active ? '#16181D' : '#101216'
                    },
                  ]}
                >
                  <View style={[styles.levelBadge, { backgroundColor: `${info.color}18` }]}>
                    <Text style={{ color: info.color, fontSize: 13, fontWeight: '800' }}>L{l}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: active ? '#FFFFFF' : '#A6ACB6', fontSize: 14, fontWeight: '700' }}>
                      {info.label}
                    </Text>
                    <Text style={{ color: '#767C87', fontSize: 11, marginTop: 2, fontWeight: '500' }}>{info.desc}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* After sent: status + cancel */}
        {sent && (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <View style={styles.sentBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="check-circle" size={16} color="#34d399" />
                <Text style={{ color: '#34d399', fontSize: 15, fontWeight: '800' }}>Help is on the way</Text>
              </View>
              <Text style={{ color: '#A6ACB6', fontSize: 12, marginTop: 6, lineHeight: 18, fontWeight: '600' }}>
                {contacts.length
                  ? `${contacts.length} emergency contact(s) notified with your coordinates.`
                  : 'Alert dispatched. Add contacts in your profile to auto-notify them.'}
              </Text>
            </View>
            <Pressable onPress={handleCancel} style={styles.cancelBtn}>
              <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '700' }}>Cancel SOS Alert</Text>
            </Pressable>
          </View>
        )}

        {/* Offline / no-internet fallback */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={[styles.label, { color: '#A6ACB6' }]}>No internet? Use SMS Fallback</Text>
          <Pressable onPress={() => sendSMSFallback()} style={styles.smsBtn}>
            <View style={styles.smsIconWrapper}>
              <Feather name="message-square" size={18} color="#F0F1F3" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Send Emergency SMS</Text>
              <Text style={{ color: '#767C87', fontSize: 11, marginTop: 2, fontWeight: '500', lineHeight: 15 }}>
                Opens pre-filled message with your live coordinates. Works on standard cell towers.
              </Text>
            </View>
          </Pressable>
        </View>

        {/* First aid for the selected type */}
        {firstAid && (
          <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
            <Text style={[styles.label, { color: '#A6ACB6' }]}>WHILE YOU WAIT — FIRST AID</Text>
            <View style={styles.aidBox}>
              {firstAid.map((step, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: i === firstAid.length - 1 ? 0 : 12, alignItems: 'flex-start' }}>
                  <View style={[styles.aidNumBadge, { backgroundColor: `${type?.color || '#ef4444'}15` }]}>
                    <Text style={{ color: type?.color || '#ef4444', fontSize: 12, fontWeight: '800' }}>{i + 1}</Text>
                  </View>
                  <Text style={{ color: '#A6ACB6', fontSize: 13, flex: 1, lineHeight: 18, fontWeight: '600' }}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
  subPill: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#181B20',
    borderWidth: 1,
    borderColor: '#22252B',
  },
  subPillText: {
    color: '#A6ACB6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  warn: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(240, 182, 92,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(240, 182, 92,0.25)',
  },
  beaconOuterRing: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaconMiddleRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 59, 48, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigBtn: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  bigBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.5, marginTop: 8 },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '800',
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  levelBadge: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sentBox: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(63, 203, 140,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(63, 203, 140,0.25)',
    marginBottom: 12,
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    alignItems: 'center',
  },
  smsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#101216',
    borderWidth: 1,
    borderColor: '#181B20',
  },
  smsIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aidBox: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#101216',
    borderColor: '#181B20',
    borderWidth: 1,
  },
  aidNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
