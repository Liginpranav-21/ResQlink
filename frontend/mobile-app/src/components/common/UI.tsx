// Shared UI primitives for ResQLink, themed via useTheme().
//
// "Aurora Glass" system — same visual language as the admin dashboard's
// redesign, adapted to what React Native can actually render without a
// native blur module: translucent layered fills (real alpha blending reads
// as glass when what's behind is a flat colour, which is all we ever have
// here — no detail to blur out in the first place), soft ambient shadows,
// and a lighter top border to fake the "light catching the edge of glass"
// highlight the web version gets from backdrop-filter.
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useOnline } from '../../hooks/useOnline';
import { WARNING } from '../../utils/theme';

// A themed full-bleed screen background.
export function Screen({
  children,
  style,
  scroll = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scroll?: boolean;
}) {
  const { t } = useTheme();
  if (scroll) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: t.bg }}
        contentContainerStyle={[{ paddingBottom: 32 }, style]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }
  return <View style={[{ flex: 1, backgroundColor: t.bg }, style]}>{children}</View>;
}

// A themed glass-panel card: translucent fill, soft ambient shadow, and a
// lighter top border that reads as light catching the top edge of frosted
// glass — the one recurring signature detail this redesign is built around.
export function Card({
  children,
  style,
  raised = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Use for panels that should sit visually above other cards (e.g. an active/selected state). */
  raised?: boolean;
}) {
  const { t } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: raised ? t.glassRaised : t.glass,
          borderColor: t.border,
          borderTopColor: t.glassHighlight,
          borderWidth: 1,
          borderRadius: 22,
          padding: 18,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.22,
          shadowRadius: 20,
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// A small status pill.
export function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: `${color}40`, borderWidth: 1 }]}>
      <Text style={{ color, fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

// A banner shown when the device is offline.
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <View style={styles.offline}>
      <Feather name="wifi-off" size={13} color={WARNING} style={{ marginRight: 6 }} />
      <Text style={[styles.offlineText, { color: WARNING }]}>
        Device is offline — emergency alerts will queue and sync when connection restores.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  offline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${WARNING}1F`,
    borderBottomWidth: 1,
    borderBottomColor: `${WARNING}4D`,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineText: { fontSize: 12, textAlign: 'center', fontWeight: '600', flexShrink: 1 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
});
