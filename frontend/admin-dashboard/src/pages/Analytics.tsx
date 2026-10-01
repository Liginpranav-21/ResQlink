import { useEmergencies } from '../hooks/useEmergencies';
import { useDashboardStore } from '../store/dashboardStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Analytics() {
  useEmergencies();
  const { analytics } = useDashboardStore();

  const tooltipStyle = {
    contentStyle: { background: '#14171B', border: '1px solid #262B32', borderRadius: 6, fontSize: 12 },
    labelStyle: { color: '#767C87' }, itemStyle: { color: '#F0F1F3' },
  };

  const typeData = analytics
    ? Object.entries(analytics.emergenciesByType)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ type: k.replace(/_/g, ' '), count: v }))
        .sort((a, b) => b.count - a.count)
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Emergencies', value: analytics?.totalEmergencies ?? 0, color: 'text-white' },
          { label: 'Resolved Today', value: analytics?.resolvedToday ?? 0, color: 'text-[#10B981]' },
          { label: 'Success Rate', value: `${analytics?.successRate ?? 0}%`, color: 'text-[#2563EB]' },
          { label: 'Avg Response', value: `${analytics?.avgResponseTime ?? 0}m`, color: 'text-[#F59E0B]' },
        ].map((s) => (
          <div key={s.label} className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <p className="label-tactical text-slate-400 mb-2">{s.label}</p>
            <p className={`text-3xl font-mono font-bold tracking-tight ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Monthly Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics?.emergenciesByMonth || []} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1E23" />
              <XAxis dataKey="month" tick={{ fill: '#767C87', fontSize: 11 }} />
              <YAxis tick={{ fill: '#767C87', fontSize: 11 }} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#FF3B30" strokeWidth={2} dot={{ fill: '#FF3B30', r: 3 }} name="Emergencies" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="hud-frame hud-frame--muted bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Emergencies by Type</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={typeData} layout="vertical" margin={{ left: 60, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1E23" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#767C87', fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="type" tick={{ fill: '#A6ACB6', fontSize: 10 }} width={80} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="#2563EB" radius={[0, 2, 2, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
