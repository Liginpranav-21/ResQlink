// HistoryScreen — past emergencies for this user.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, Card } from '../../components/common/UI';
import { useTheme } from '../../hooks/useTheme';
import { useEmergencyStore } from '../../store/emergencyStore';
import { EMERGENCY_TYPES, SOS_LEVELS } from '../../utils/constants';
import { timeAgo } from '../../utils/helpers';
import type { EmergencyLevel } from '../../types';

export default function HistoryScreen() {
  const { t } = useTheme();
  const titleColor = t.text;
  const history = useEmergencyStore((s) => s.history);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#EF4444';
      case 'resolved':
        return '#34D399';
      case 'cancelled':
        return '#A6ACB6';
      default:
        return '#F59E0B';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#07080A' }}>
      <Screen scroll={true}>
        <View style={{ padding: 20 }}>
          <Text style={[styles.titleText, { color: titleColor }]}>Emergency History</Text>
          <Text style={styles.subtitleText}>
            Your past emergency alerts and logs
          </Text>

          {history.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyIconWrapper}>
                <Feather name="archive" size={26} color="#767C87" />
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginTop: 12 }}>No alerts yet</Text>
              <Text style={{ color: '#767C87', fontSize: 13, marginTop: 6, textAlign: 'center', fontWeight: '600', lineHeight: 18 }}>
                When you trigger an SOS, your alert log history will appear here.
              </Text>
            </Card>
          ) : (
            history.map((h) => {
              const type = EMERGENCY_TYPES.find((e) => e.id === h.type);
              const lvl = SOS_LEVELS[h.level as EmergencyLevel] || SOS_LEVELS[1];
              const statusColor = getStatusColor(h.status || '');
              return (
                <Card key={h.id} style={styles.historyCard}>
                  <View style={[styles.iconWrapper, { backgroundColor: `${lvl.color}15` }]}>
                    <Text style={{ fontSize: 22 }}>{type?.icon || '⚠️'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                      {type?.label || (h.type || '').replace(/_/g, ' ')}
                    </Text>
                    <Text style={{ color: '#767C87', fontSize: 12, marginTop: 4, fontWeight: '600' }}>{timeAgo(h.createdAt)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={[styles.badge, { borderColor: `${lvl.color}35`, backgroundColor: `${lvl.color}12` }]}>
                      <Text style={{ color: lvl.color, fontSize: 10, fontWeight: '800' }}>{lvl.label}</Text>
                    </View>
                    <Text style={{ color: statusColor, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h.status}</Text>
                  </View>
                </Card>
              );
            })
          )}
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
    marginBottom: 20,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#101216',
    borderWidth: 1,
    borderColor: '#181B20',
    borderRadius: 24,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#181B20',
  },
  historyCard: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#101216',
    borderWidth: 1,
    borderColor: '#181B20',
    borderRadius: 20,
    padding: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
});
