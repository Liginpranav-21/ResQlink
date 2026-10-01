import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { sessionService, db, type SessionRecord } from '@resqlink/shared';
import { useAuthStore } from '../store/authStore';

function timeAgo(ts: number): string {
  if (!ts) return '—';
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Lists this account's active sessions (one per device/browser that has
 * logged in) and lets the user revoke others. See ARCHITECTURE.md for what
 * "revoke" actually guarantees here — it's a flag the target device checks,
 * not a server-side token kill (no backend in this repo to do the latter).
 */
export default function SessionsPanel() {
  const { user, sessionId } = useAuthStore();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = sessionService.subscribeSessions(db, user.uid, (list) =>
      setSessions(list.filter((s) => !s.revoked))
    );
    return unsubscribe;
  }, [user]);

  const handleRevoke = async (id: string) => {
    if (!user) return;
    setBusy(true);
    try {
      await sessionService.revokeSession(db, user.uid, id);
      toast.success('Session signed out');
    } catch {
      toast.error('Failed to revoke session');
    } finally {
      setBusy(false);
    }
  };

  const handleRevokeAll = async () => {
    if (!user || !sessionId) return;
    setBusy(true);
    try {
      await sessionService.revokeAllOtherSessions(db, user.uid, sessionId, sessions);
      toast.success('Signed out of all other devices');
    } catch {
      toast.error('Failed to sign out other devices');
    } finally {
      setBusy(false);
    }
  };

  const otherSessionsCount = sessions.filter((s) => s.id !== sessionId).length;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold text-sm">Active Sessions</h2>
          <p className="text-slate-400 text-xs mt-0.5">Devices currently signed in to this account.</p>
        </div>
        {otherSessionsCount > 0 && (
          <button
            onClick={handleRevokeAll}
            disabled={busy}
            className="px-3 py-2 bg-[#FF3B30]/8 hover:bg-[#FF3B30]/15 disabled:opacity-50 text-[#FF3B30] border border-[#FF3B30]/20 text-xs font-bold rounded-xl transition-all whitespace-nowrap"
          >
            Sign out other devices ({otherSessionsCount})
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <p className="text-slate-500 text-xs">No active session records yet.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const isCurrent = s.id === sessionId;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-850 border border-slate-800 transition-colors hover:border-slate-700"
              >
                <div>
                  <p className="text-white text-sm font-semibold">
                    {s.browser} · {s.device}
                    {isCurrent && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                        This device
                      </span>
                    )}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Signed in {timeAgo(s.loginAt)} · last active {timeAgo(s.lastSeenAt)}
                  </p>
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => handleRevoke(s.id)}
                    disabled={busy}
                    className="text-slate-500 hover:text-red-400 disabled:opacity-50 text-xs font-semibold transition-colors"
                  >
                    Sign out
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
