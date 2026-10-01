// HomeScreen — dashboard with greeting, GPS status, and the emergency-type grid.
import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, Card } from '../../components/common/UI';
import { OfflineBanner } from '../../components/common/UI';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { SIGNAL } from '../../utils/theme';
import { useEmergencyStore } from '../../store/emergencyStore';
import type { GpsStatus } from '../../hooks/useLocation';
import type { GPSCoordinates } from '../../types';

interface Props {
  location: GPSCoordinates | null;
  gpsStatus: GpsStatus;
  onPickType: (typeId: string) => void;
  onOpenSOS: () => void;
  onOpenNearby: () => void;
}

export default function HomeScreen({ location, gpsStatus, onPickType, onOpenSOS, onOpenNearby }: Props) {
  const { t, resolved } = useTheme();
  const titleColor = t.text;
  const user = useAuthStore((s) => s.user);

  const gpsColor = gpsStatus === 'granted' ? '#34d399' : gpsStatus === 'denied' ? '#fbbf24' : t.muted;

  const handleCallEmergency = () => {
    Linking.openURL('tel:112').catch(err => console.error('Failed to dial 112', err));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#07080A' }}>
      <Screen scroll={true}>
        <OfflineBanner />
        <View style={{ padding: 20 }}>
          
          {/* Header Greeting */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {(user?.displayName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingSub}>Good Morning 👋, {user?.displayName?.split(' ')[0] || 'User'}</Text>
              <Text style={[styles.greetingTitle, { color: titleColor }]}>Stay Safe. Every Second Counts.</Text>
            </View>
            <Pressable style={styles.bellButton}>
              <Feather name="bell" size={17} color="#A6ACB6" />
              <View style={styles.bellBadge} />
            </Pressable>
          </View>

          {/* Indicators row */}
          <View style={styles.indicatorsRow}>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: gpsColor }]} />
              <Text style={styles.indicatorText}>GPS</Text>
            </View>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: '#34d399' }]} />
              <Text style={styles.indicatorText}>INTERNET</Text>
            </View>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: '#34d399' }]} />
              <Text style={styles.indicatorText}>ADMIN</Text>
            </View>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: '#34d399' }]} />
              <Text style={styles.indicatorText}>FIREBASE</Text>
            </View>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: '#a78bfa' }]} />
              <Text style={styles.indicatorText}>SAT/SMS</Text>
            </View>
          </View>

          {/* Map & SOS Beacon section */}
          <View style={styles.mapBeaconContainer}>
            {/* Grid/Radar sweep lines background simulation */}
            <View style={styles.mapLine1} />
            <View style={styles.mapLine2} />
            <View style={styles.mapLine3} />
            <View style={styles.radarRing1} />
            <View style={styles.radarRing2} />
            <View style={styles.radarRing3} />
            
            {/* Central SOS Button */}
            <Pressable onPress={onOpenSOS} style={({ pressed }) => [
              styles.sosBeaconOuter,
              { opacity: pressed ? 0.9 : 1 }
            ]}>
              <View style={styles.sosBeaconMiddle}>
                <View style={styles.sosBeaconInner}>
                  <Text style={styles.sosSymbol}>*</Text>
                  <Text style={styles.sosText}>sos</Text>
                </View>
              </View>
            </Pressable>

            {/* Press & hold instruction */}
            <View style={styles.pressBeaconPill}>
              <Text style={styles.pressBeaconText}>PRESS & HOLD BEACON</Text>
            </View>
          </View>

          {/* Weather & Flood Alert row */}
          <View style={styles.alertRow}>
            <Card style={styles.alertCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.alertIconBg, { backgroundColor: 'rgba(124, 180, 255, 0.15)' }]}>
                  <Feather name="cloud-rain" size={18} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.alertValue}>31°C</Text>
                  <Text style={styles.alertLabel}>Heavy Rain</Text>
                </View>
              </View>
            </Card>

            <Card style={styles.alertCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.alertIconBg, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                  <Feather name="alert-triangle" size={18} color="#FF3B30" />
                </View>
                <View>
                  <Text style={[styles.alertValue, { color: '#EF4444' }]}>HIGH RISK</Text>
                  <Text style={styles.alertLabel}>Flood Alert</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* ResQAI Assistant Card */}
          <Card style={styles.aiCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <View style={styles.aiAvatarBg}>
                <Feather name="cpu" size={18} color="#A78BFA" />
              </View>
              <View>
                <Text style={styles.aiCardTitle}>ResQAI Assistant</Text>
                <Text style={styles.aiCardSubtitle}>Instant emergency guidance</Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: '#181B20', marginVertical: 12 }} />

            <View style={{ position: 'relative' }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.aiChipsScrollContainer}
              >
                {[
                  { id: 'heart_attack',     label: 'Heart Attack',     icon: '🫀' },
                  { id: 'fracture',         label: 'Fracture',         icon: '🦴' },
                  { id: 'snake_bite',       label: 'Snake Bite',       icon: '🐍' },
                  { id: 'animal_attack',    label: 'Animal Attack',    icon: '🐕' },
                  { id: 'fire',             label: 'Fire',             icon: '🔥' },
                  { id: 'accident',         label: 'Road Accident',    icon: '🚗' },
                  { id: 'breathing_problem',label: 'Electric Shock',   icon: '⚡' },
                  { id: 'heavy_bleeding',   label: 'Severe Bleeding',  icon: '🩸' },
                  { id: 'flood',            label: 'Flood',            icon: '🌊' },
                  { id: 'landslide',        label: 'Landslide',        icon: '⛰️' },
                  { id: 'earthquake',       label: 'Cyclone',          icon: '🌪️' },
                  { id: 'lost_in_forest',   label: 'Poisoning',        icon: '☠️' },
                ].map(cat => (
                  <Pressable
                    key={cat.id}
                    onPress={() => onPickType(cat.id)}
                    style={({ pressed }) => [
                      styles.aiCategoryChip,
                      { opacity: pressed ? 0.75 : 1 }
                    ]}
                  >
                    <Text style={styles.aiCategoryIcon}>{cat.icon}</Text>
                    <Text style={styles.aiCategoryLabel}>{cat.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Fake gradient fade at the right edge to indicate scrollability */}
              <View style={styles.rightFadeOverlay}>
                <View style={[styles.fadeSegment, { opacity: 0.95 }]} />
                <View style={[styles.fadeSegment, { opacity: 0.7 }]} />
                <View style={[styles.fadeSegment, { opacity: 0.4 }]} />
                <View style={[styles.fadeSegment, { opacity: 0.15 }]} />
              </View>
            </View>

            <View style={styles.viewAllWrapper}>
              <Pressable
                onPress={onOpenSOS}
                style={({ pressed }) => [
                  styles.viewAllBtn,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Feather name="arrow-right" size={12} color={SIGNAL} style={{ marginLeft: 4 }} />
              </Pressable>
            </View>
          </Card>

          {/* Nearby Services Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Services</Text>
            <Pressable onPress={onOpenNearby}>
              <Text style={styles.viewMapText}>View Map</Text>
            </Pressable>
          </View>

          {/* Nearby Services Grid */}
          <View style={styles.servicesGrid}>
            {[
              { label: 'AMBULANCE', icon: 'truck' as const, color: '#2563EB', action: onOpenNearby },
              { label: 'HOSPITAL', icon: 'plus-square' as const, color: '#10B981', action: onOpenNearby },
              { label: 'POLICE', icon: 'shield' as const, color: '#818CF8', action: onOpenNearby },
              { label: 'FIRE', icon: 'zap' as const, color: '#F97316', action: () => onPickType('fire') },
              { label: 'BLOOD BANK', icon: 'droplet' as const, color: '#FF3B30', action: () => onPickType('heavy_bleeding') },
              { label: 'SHELTER', icon: 'home' as const, color: '#A78BFA', action: () => onPickType('lost_in_forest') },
            ].map((service, idx) => (
              <Pressable
                key={idx}
                onPress={service.action}
                style={({ pressed }) => [
                  styles.serviceCard,
                  { borderColor: service.color, opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <View style={[styles.serviceIconWrapper, { backgroundColor: `${service.color}15` }]}>
                  <Feather name={service.icon} size={20} color={service.color} />
                </View>
                <Text style={styles.serviceLabel}>{service.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Emergency Tip */}
          <Card style={styles.tipCard}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={styles.tipIconWrapper}>
                <Feather name="zap" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipHeader}>EMERGENCY TIP</Text>
                <Text style={styles.tipText}>Earthquake? Stay away from windows and find cover.</Text>
              </View>
            </View>
          </Card>

        </View>
      </Screen>

      {/* Floating 112 Phone Button */}
      <Pressable onPress={handleCallEmergency} style={styles.floatingButton}>
        <Feather name="phone-call" size={18} color="#07080A" />
        <Text style={styles.floatingButtonText}>112</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    marginTop: 10,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#181B20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#22252B',
  },
  avatarText: {
    color: '#F0F1F3',
    fontSize: 18,
    fontWeight: '800',
  },
  greetingSub: {
    color: '#A6ACB6',
    fontSize: 12,
    fontWeight: '600',
  },
  greetingTitle: {
    color: '#F0F1F3',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#101216',
    borderWidth: 1,
    borderColor: '#181B20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  indicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indicatorText: {
    color: '#A6ACB6',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  mapBeaconContainer: {
    height: 310,
    borderRadius: 24,
    backgroundColor: '#050607',
    borderWidth: 1,
    borderColor: '#181B20',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapLine1: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    top: '30%',
  },
  mapLine2: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    top: '65%',
  },
  mapLine3: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    left: '45%',
  },
  radarRing1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.05)',
  },
  radarRing2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.03)',
  },
  radarRing3: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.01)',
  },
  sosBeaconOuter: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sosBeaconMiddle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 59, 48, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosBeaconInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  sosSymbol: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '300',
    lineHeight: 54,
    marginTop: 8,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: -8,
  },
  pressBeaconPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  pressBeaconText: {
    color: '#A6ACB6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  alertRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  alertCard: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#101216',
    borderWidth: 1,
    borderColor: '#181B20',
  },
  alertIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertValue: {
    color: '#F0F1F3',
    fontSize: 15,
    fontWeight: '800',
  },
  alertLabel: {
    color: '#767C87',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  aiCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#101216',
    borderColor: '#181B20',
    borderWidth: 1,
    marginBottom: 20,
  },
  aiAvatarBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCardTitle: {
    color: '#F0F1F3',
    fontSize: 14,
    fontWeight: '800',
  },
  aiCardSubtitle: {
    color: '#767C87',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  aiChipsScrollContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  aiCategoryChip: {
    width: 140,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#181B20',
    borderWidth: 1,
    borderColor: '#22252B',
    gap: 8,
  },
  aiCategoryIcon: {
    fontSize: 16,
  },
  aiCategoryLabel: {
    color: '#A6ACB6',
    fontSize: 12,
    fontWeight: '700',
  },
  rightFadeOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    flexDirection: 'row-reverse',
  },
  fadeSegment: {
    width: 6,
    height: '100%',
    backgroundColor: '#101216',
  },
  viewAllWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  viewAllText: {
    color: SIGNAL,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F0F1F3',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  viewMapText: {
    color: SIGNAL,
    fontSize: 12,
    fontWeight: '700',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  serviceCard: {
    width: '31.3%',
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.045)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  serviceIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceLabel: {
    color: '#A6ACB6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  tipCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#101216',
    borderColor: '#D97706',
    borderWidth: 1,
    marginBottom: 20,
  },
  tipIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipHeader: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tipText: {
    color: '#A6ACB6',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 99,
  },
  floatingButtonText: {
    color: '#07080A',
    fontSize: 10,
    fontWeight: '800',
    marginTop: -2,
  },
});
