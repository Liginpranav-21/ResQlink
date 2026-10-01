import { hasSectionAccess, type DashboardSection } from '@resqlink/shared';
import { useAuthStore } from '../store/authStore';

/**
 * Wrap a page element with this to restrict it by role, e.g.:
 *   <Route path="drone-control" element={<RequireSection section="drone-control"><DroneControl /></RequireSection>} />
 *
 * Renders an inline "not authorized" panel rather than redirecting — the
 * user is still logged in and still inside the dashboard shell (sidebar,
 * top nav), they just can't see this one section's content.
 */
export function RequireSection({ section, children }: { section: DashboardSection; children: React.ReactNode }) {
  const { user } = useAuthStore();

  if (!user || !hasSectionAccess(user.role, section)) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-xl mx-auto mb-4">
            🔒
          </div>
          <p className="text-white font-semibold text-sm mb-1">Not available for your role</p>
          <p className="text-slate-400 text-xs">
            Your account ({user?.role ?? 'unknown role'}) doesn't have access to this section.
            Contact an administrator if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
