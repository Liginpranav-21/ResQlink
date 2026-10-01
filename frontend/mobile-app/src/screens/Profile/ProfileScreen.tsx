// ProfileScreen — medical profile, emergency contacts, theme, and sign out.
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Screen, Card } from '../../components/common/UI';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { ProfileService, AuthService } from '../../services';
import { sessionService, type SessionRecord } from '../../services/sessionService';
import { BLOOD_GROUPS } from '../../utils/constants';
import type { EmergencyContact } from '../../types';
import { SIGNAL } from '../../utils/theme';
import { Feather } from '@expo/vector-icons';
import { showAlert } from '../../utils/alert';

export default function ProfileScreen() {
  const { t, pref, setPref } = useTheme();
  const titleColor = t.text;
  const user = useAuthStore((s) => s.user);
  const sessionId = useAuthStore((s) => s.sessionId);
  const logout = useAuthStore((s) => s.logout);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = sessionService.subscribeSessions(user.uid, (list) => setSessions(list.filter((s) => !s.revoked)));
    return unsub;
  }, [user]);

  const timeAgo = (ts: number): string => {
    if (!ts) return '—';
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const revokeOtherSessions = async () => {
    if (!user || !sessionId) return;
    try {
      await sessionService.revokeAllOtherSessions(user.uid, sessionId, sessions);
      showAlert('Done', 'Signed out of all other devices.');
    } catch {
      showAlert('Failed', 'Could not sign out other devices. Try again.');
    }
  };

  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [saving, setSaving] = useState(false);

  const addContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    setContacts((c) => [...c, { name: contactName.trim(), relation: 'Contact', phone: contactPhone.trim() }]);
    setContactName('');
    setContactPhone('');
  };

  const removeContact = (i: number) => setContacts((c) => c.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await ProfileService.update(user.uid, { bloodGroup, emergencyContacts: contacts });
      showAlert('Saved', 'Your profile has been updated.');
    } catch (err) {
      showAlert('Could not save', AuthService.cleanError(err));
    } finally {
      setSaving(false);
    }
  };

  const doLogout = async () => {
    await AuthService.logout();
    logout();
  };

  const input = {
    backgroundColor: '#050607',
    borderColor: '#181B20',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: '#07080A' }}>
      <Screen scroll={true}>
        <View style={{ padding: 20, paddingBottom: 60 }}>
          <Text style={[styles.titleText, { color: titleColor }]}>Profile</Text>
          <Text style={styles.subtitleText}>Update emergency medical info and contacts</Text>

          {/* Identity */}
          <Card style={styles.identityCard}>
            <View style={styles.avatar}>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>
                {(user?.displayName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>{user?.displayName || 'User'}</Text>
              <Text style={{ color: '#767C87', fontSize: 13, marginTop: 4, fontWeight: '600' }}>{user?.email}</Text>
              {!!user?.phone && <Text style={{ color: '#4C525B', fontSize: 12, marginTop: 2, fontWeight: '500' }}>{user.phone}</Text>}
            </View>
          </Card>

          {/* Blood group */}
          <Text style={styles.label}>Blood group</Text>
          <View style={styles.chips}>
            {BLOOD_GROUPS.map((bg) => {
              const active = bloodGroup === bg;
              return (
                <Pressable
                  key={bg}
                  onPress={() => setBloodGroup(bg)}
                  style={[styles.chip, { borderColor: active ? SIGNAL : '#181B20', backgroundColor: active ? '#2A1416' : '#101216' }]}
                >
                  <Text style={{ color: active ? '#FFFFFF' : '#A6ACB6', fontSize: 13, fontWeight: '800' }}>{bg}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Emergency contacts */}
          <Text style={styles.label}>Emergency contacts</Text>
          {contacts.map((c, i) => (
            <Card key={i} style={styles.contactCard}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>{c.name}</Text>
                <Text style={{ color: '#767C87', fontSize: 12, marginTop: 2, fontWeight: '600' }}>{c.phone}</Text>
              </View>
              <Pressable onPress={() => removeContact(i)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="trash-2" size={13} color="#EF4444" />
                <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '700' }}>Remove</Text>
              </Pressable>
            </Card>
          ))}
          <View style={{ gap: 8 }}>
            <TextInput value={contactName} onChangeText={setContactName} placeholder="Contact name" placeholderTextColor="#767C87" style={input} />
            <TextInput value={contactPhone} onChangeText={setContactPhone} placeholder="Phone number" placeholderTextColor="#767C87" keyboardType="phone-pad" style={input} />
            <Pressable onPress={addContact} style={[styles.addBtn, { flexDirection: 'row', gap: 6 }]}>
              <Feather name="user-plus" size={14} color="#A6ACB6" />
              <Text style={{ color: '#A6ACB6', fontSize: 13, fontWeight: '800' }}>Add emergency contact</Text>
            </Pressable>
          </View>

          {/* Theme */}
          <Text style={styles.label}>Appearance</Text>
          <View style={styles.chips}>
            {(['system', 'light', 'dark'] as const).map((p) => {
              const active = pref === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPref(p)}
                  style={[styles.chip, { borderColor: active ? SIGNAL : '#181B20', backgroundColor: active ? '#2A1416' : '#101216' }]}
                >
                  <Text style={{ color: active ? '#FFFFFF' : '#A6ACB6', fontSize: 13, fontWeight: '800', textTransform: 'capitalize' }}>{p}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Active Sessions */}
          <Text style={styles.label}>Active Sessions</Text>
          <View style={{ gap: 8, marginBottom: 8 }}>
            {sessions.length === 0 ? (
              <Text style={{ color: '#767C87', fontSize: 12.5 }}>No session records yet.</Text>
            ) : (
              sessions.map((s) => {
                const isCurrent = s.id === sessionId;
                return (
                  <View
                    key={s.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#101216',
                      borderColor: '#181B20',
                      borderWidth: 1,
                      borderRadius: 14,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                    }}
                  >
                    <View>
                      <Text style={{ color: '#F0F1F3', fontSize: 13, fontWeight: '700' }}>
                        {s.browser} · {s.device}{isCurrent ? '  •  this device' : ''}
                      </Text>
                      <Text style={{ color: '#767C87', fontSize: 11, marginTop: 2 }}>
                        Signed in {timeAgo(s.loginAt)} · last active {timeAgo(s.lastSeenAt)}
                      </Text>
                    </View>
                    {!isCurrent && (
                      <Pressable onPress={() => sessionService.revokeSession(user!.uid, s.id)}>
                        <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>Sign out</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })
            )}
          </View>
          {sessions.filter((s) => s.id !== sessionId).length > 0 && (
            <Pressable onPress={revokeOtherSessions} style={{ paddingVertical: 8, marginBottom: 8 }}>
              <Text style={{ color: SIGNAL, fontSize: 12.5, fontWeight: '800' }}>Sign out all other devices</Text>
            </Pressable>
          )}

          {/* Save + logout */}
          <Pressable onPress={save} disabled={saving} style={({ pressed }) => [styles.saveBtn, { opacity: saving ? 0.7 : pressed ? 0.9 : 1 }]}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>{saving ? 'Saving…' : 'Save profile'}</Text>
          </Pressable>
          <Pressable onPress={doLogout} style={({ pressed }) => [styles.logoutBtn, { flexDirection: 'row', gap: 6, opacity: pressed ? 0.85 : 1 }]}>
            <Feather name="log-out" size={14} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '800' }}>Sign out</Text>
          </Pressable>
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
  identityCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#101216',
    borderWidth: 1,
    borderColor: '#181B20',
    borderRadius: 24,
    padding: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '800', marginTop: 24, marginBottom: 12, color: '#A6ACB6' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  contactCard: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#101216',
    borderWidth: 1,
    borderColor: '#181B20',
    borderRadius: 20,
    padding: 14,
  },
  addBtn: {
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#181B20',
    backgroundColor: '#101216',
    alignItems: 'center',
  },
  saveBtn: {
    marginTop: 28,
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  logoutBtn: {
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    alignItems: 'center',
  },
});
