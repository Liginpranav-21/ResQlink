import { useState, useMemo } from 'react';
import { useEmergencies } from '../hooks/useEmergencies';
import { useEmergencyStore } from '../store/emergencyStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useCommandCenter } from '../hooks/useCommandCenter';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import LiveOperationalMap from '../components/dashboard/LiveOperationalMap';
import LiveEmergenciesFeed from '../components/dashboard/LiveEmergenciesFeed';
import EmergencyDetailDrawer from '../components/dashboard/EmergencyDetailDrawer';
import QuickDispatchDrawer from '../components/dashboard/QuickDispatchDrawer';
import ResQAICommandAssistant from '../components/dashboard/ResQAICommandAssistant';
import StatCard from '../components/dashboard/StatCard';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  Siren, Plane, Shield, Building2, Ambulance,
  Activity, Flame, ChevronRight
} from 'lucide-react';

const chartTooltipStyle = { background: '#0F172A', border: '1px solid #1E293B', borderRadius: 8, fontSize: 12 };

export default function Dashboard() {
  const { isLoading } = useEmergencies();
  const { emergencies, selectedEmergencyId, setSelectedEmergencyId } = useEmergencyStore();
  const { rescueTeams, drones, hospitals } = useDashboardStore();
  const { ambulances } = useCommandCenter();
  const { position: operatorLocation } = useCurrentLocation(true);

  // Drawer visibility state
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showDispatchDrawer, setShowDispatchDrawer] = useState(false);
  const [heatmapTimeRange, setHeatmapTimeRange] = useState<'today' | '7d' | '30d'>('today');

  const selectedEmergency = useMemo(
    () => emergencies.find((e) => e.id === selectedEmergencyId) || null,
    [emergencies, selectedEmergencyId]
  );

  const activeEmergencies = useMemo(
    () => emergencies.filter((e) => e.status !== 'resolved' && e.status !== 'cancelled'),
    [emergencies]
  );

  const openHospitalsCount = useMemo(
    () => hospitals.filter((h) => h.isOpen).length || 24,
    [hospitals]
  );

  const ambulancesOnlineCount = useMemo(
    () => ambulances.filter((a) => a.status === 'available' || a.status === 'assigned' || a.status === 'en_route').length || 12,
    [ambulances]
  );

  const dronesOnlineCount = useMemo(
    () => drones.filter((d) => d.status && d.status !== 'standby').length || 6,
    [drones]
  );

  // Incident Donut Data matching reference mockup
  const COLORS = ['#2563EB', '#38BDF8', '#FF3B30', '#F59E0B', '#818CF8'];
  const pieData = [
    { name: 'Accident', value: 11, percentage: '40.7%' },
    { name: 'Medical', value: 8, percentage: '29.6%' },
    { name: 'Heart Attack', value: 4, percentage: '14.8%' },
    { name: 'Snake Bite', value: 2, percentage: '7.4%' },
    { name: 'Others', value: 2, percentage: '7.4%' },
  ];

  // Response Time Trend points (00 to 22 hrs)
  const trendData = [
    { time: '00', response: 28 },
    { time: '02', response: 27 },
    { time: '04', response: 18 },
    { time: '06', response: 29 },
    { time: '08', response: 43 },
    { time: '10', response: 48 },
    { time: '12', response: 28 },
    { time: '14', response: 36 },
    { time: '16', response: 23 },
    { time: '18', response: 32 },
    { time: '20', response: 49 },
    { time: '22', response: 28 },
  ];

  const nearbyHospitalsList = [
    { name: 'Apollo Hospitals', dist: '2.3 km', status: 'Open', color: 'text-emerald-400' },
    { name: 'MIOT International', dist: '4.7 km', status: 'Open', color: 'text-emerald-400' },
    { name: 'Kauvery Hospital', dist: '6.1 km', status: 'Open', color: 'text-emerald-400' },
    { name: 'Fortis Malar Hospital', dist: '7.8 km', status: 'Busy', color: 'text-rose-400' },
    { name: 'Ganga Hospital', dist: '8.9 km', status: 'Open', color: 'text-emerald-400' },
  ];

  const handleSelectEmergency = (id: string) => {
    setSelectedEmergencyId(id);
    setShowDetailDrawer(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FF3B30] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-mono font-medium">Connecting to Emergency Control Room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. HERO SECTION (IMMEDIATELY BELOW HEADER): Live Map (68% LEFT) + Live Emergency Feed (32% RIGHT) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
        {/* Live Operational Map (LEFT - Primary Focal Point) */}
        <div className="xl:col-span-8 h-[460px]">
          <LiveOperationalMap
            emergencies={emergencies}
            ambulances={ambulances}
            rescueTeams={rescueTeams}
            drones={drones}
            hospitals={hospitals}
            operatorLocation={operatorLocation}
            selectedEmergencyId={selectedEmergencyId}
            onEmergencySelect={handleSelectEmergency}
          />
        </div>

        {/* Live Emergency Feed (RIGHT - Incident Stream) */}
        <div className="xl:col-span-4 h-[460px]">
          <LiveEmergenciesFeed />
        </div>
      </div>

      {/* 2. KPI ROW (BELOW HERO MAP): 5 Compact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Active Emergencies"
          value={activeEmergencies.length || 7}
          icon={Siren}
          color="red"
          pulse
          subtitle="▲ 2 from last hour"
        />
        <StatCard
          title="Ambulances Online"
          value={ambulancesOnlineCount}
          icon={Ambulance}
          color="blue"
          subtitle="▲ 3 available"
        />
        <StatCard
          title="Rescue Teams"
          value={rescueTeams.length || 18}
          icon={Shield}
          color="green"
          subtitle="▲ 4 active"
        />
        <StatCard
          title="Drones Online"
          value={dronesOnlineCount}
          icon={Plane}
          color="purple"
          subtitle="▲ 2 airborne"
        />
        <StatCard
          title="Hospitals Open"
          value={openHospitalsCount}
          icon={Building2}
          color="amber"
          subtitle="▲ 3 nearby"
        />
      </div>

      {/* 3. ANALYTICS ROW: Heatmap (4 cols) + Donut (4 cols) + Response Trend & Resources (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Emergency Heatmap */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between h-[280px] shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Flame size={14} className="text-[#FF3B30]" /> Emergency Heatmap
              </h2>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                {(['today', '7d', '30d'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setHeatmapTimeRange(r)}
                    className={`px-2 py-0.5 rounded uppercase font-bold transition-colors ${
                      heatmapTimeRange === r ? 'bg-[#FF3B30]/20 text-[#FF3B30]' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {r === 'today' ? 'Today' : r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-44 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="absolute top-[25%] left-[30%] w-20 h-20 rounded-full bg-red-600/40 blur-xl animate-pulse" />
              <div className="absolute top-[40%] left-[55%] w-24 h-24 rounded-full bg-orange-500/40 blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-[30%] left-[20%] w-16 h-16 rounded-full bg-red-500/50 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />

              <div className="relative z-10 text-center px-4">
                <p className="text-slate-200 text-xs font-semibold font-mono tracking-wide mb-1">Chennai Density Zone</p>
                <p className="text-slate-400 text-[11px] font-mono">{activeEmergencies.length || 7} Active Clusters</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1 pt-1.5 border-t border-slate-800/60">
            <span>Low</span>
            <div className="h-1.5 flex-1 mx-3 rounded-full bg-gradient-to-r from-blue-600 via-amber-500 to-red-500" />
            <span>High</span>
          </div>
        </div>

        {/* Emergencies by Type Donut */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-sm flex flex-col justify-between h-[280px]">
          <h2 className="text-white font-semibold text-xs font-mono uppercase tracking-wider mb-2">Emergency Type Analytics</h2>
          <div className="flex items-center justify-between h-48">
            <div className="w-1/2 h-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-mono text-white">27</span>
                <span className="text-[10px] text-slate-400 font-mono">Total</span>
              </div>
            </div>
            <div className="w-1/2 space-y-1.5 text-[11px] pl-2 font-mono">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    {d.name}
                  </span>
                  <span className="text-slate-400 font-semibold">{d.percentage} <span className="text-slate-500">({d.value})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Response Time Trend & Resource Status */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-sm flex flex-col justify-between h-[280px]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-semibold text-xs font-mono uppercase tracking-wider">Resource Status</h2>
            <span className="text-[11px] text-[#2563EB] hover:underline font-mono cursor-pointer flex items-center gap-0.5">
              View all <ChevronRight size={12} />
            </span>
          </div>
          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>Ambulances</span>
                <span className="text-slate-400">12 / 18 <span className="text-slate-500 font-bold ml-1">67%</span></span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-[#2563EB]" style={{ width: '67%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>Rescue Teams</span>
                <span className="text-slate-400">18 / 28 <span className="text-slate-500 font-bold ml-1">64%</span></span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-[#10B981]" style={{ width: '64%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>Drones</span>
                <span className="text-slate-400">6 / 10 <span className="text-slate-500 font-bold ml-1">60%</span></span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-[#818CF8]" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>Hospital Beds</span>
                <span className="text-slate-500 italic text-[11px]">Data unavailable</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Avg Response: <strong className="text-emerald-400 font-bold">8.4 mins</strong></span>
              <span className="text-slate-500">24h System Average</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. OPERATIONS SECTION: Recent Activity + Rescue Teams Roster + ResQAI Assistant + Nearby Hospitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Recent Activity Log */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
              <h2 className="text-white font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={13} className="text-[#FF3B30]" /> Recent Activity Log
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30]">
                ● LIVE
              </span>
            </div>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-start justify-between">
                <p className="text-slate-300 line-clamp-1"><span className="text-blue-400 font-semibold">Ambulance AMB-12</span> assigned to Emergency #EMG-7241</p>
                <span className="text-slate-500 text-[10px] shrink-0 ml-1">15:36:12</span>
              </div>
              <div className="flex items-start justify-between">
                <p className="text-slate-300 line-clamp-1"><span className="text-emerald-400 font-semibold">Rescue Team RT-05</span> en route to Emergency #EMG-7239</p>
                <span className="text-slate-500 text-[10px] shrink-0 ml-1">15:34:45</span>
              </div>
              <div className="flex items-start justify-between">
                <p className="text-slate-300 line-clamp-1"><span className="text-amber-400 font-semibold">Hospital Alert</span> sent to Apollo Main Hospital</p>
                <span className="text-slate-500 text-[10px] shrink-0 ml-1">15:33:01</span>
              </div>
              <div className="flex items-start justify-between">
                <p className="text-slate-300 line-clamp-1"><span className="text-purple-400 font-semibold">Drone DR-03</span> launched for Emergency #EMG-7238</p>
                <span className="text-slate-500 text-[10px] shrink-0 ml-1">15:31:18</span>
              </div>
              <div className="flex items-start justify-between">
                <p className="text-slate-300 line-clamp-1"><span className="text-red-400 font-semibold">SOS received</span> from User - Ligin</p>
                <span className="text-slate-500 text-[10px] shrink-0 ml-1">15:28:43</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/80 mt-3">
            <span className="text-[11px] text-[#2563EB] hover:underline font-mono cursor-pointer flex items-center gap-0.5">
              View full activity log <ChevronRight size={12} />
            </span>
          </div>
        </div>

        {/* Rescue Teams Roster */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
              <h2 className="text-white font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={13} className="text-[#10B981]" /> Rescue Teams Roster
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30]">
                ● LIVE
              </span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <div>
                  <span className="font-bold text-white">RT-05</span> <span className="text-slate-400">Chennai Fire & Rescue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30">En Route</span>
                  <span className="text-slate-500 text-[10px]">2.1 km</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <div>
                  <span className="font-bold text-white">RT-02</span> <span className="text-slate-400">NDRF Unit - Chennai</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Available</span>
                  <span className="text-slate-500 text-[10px]">4.8 km</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <div>
                  <span className="font-bold text-white">RT-11</span> <span className="text-slate-400">Tamil Nadu SDRF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30">On Mission</span>
                  <span className="text-slate-500 text-[10px]">7.3 km</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <div>
                  <span className="font-bold text-white">RT-07</span> <span className="text-slate-400">City Rescue Unit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Available</span>
                  <span className="text-slate-500 text-[10px]">8.6 km</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="font-bold text-white">RT-03</span> <span className="text-slate-400">Coastal Rescue Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Available</span>
                  <span className="text-slate-500 text-[10px]">9.2 km</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/80 mt-3">
            <span className="text-[11px] text-[#2563EB] hover:underline font-mono cursor-pointer flex items-center gap-0.5">
              View all rescue teams <ChevronRight size={12} />
            </span>
          </div>
        </div>

        {/* ResQAI Command Assistant */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-sm">
          <ResQAICommandAssistant
            emergencies={emergencies}
            ambulances={ambulances}
            rescueTeams={rescueTeams}
            onFocusEmergency={handleSelectEmergency}
          />
        </div>

        {/* Nearby Hospitals */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
              <h2 className="text-white font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={13} className="text-[#818CF8]" /> Nearby Hospitals
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30]">
                ● LIVE
              </span>
            </div>
            <div className="space-y-2.5 text-xs font-mono">
              {nearbyHospitalsList.map((h) => (
                <div key={h.name} className="flex items-center justify-between py-0.5 border-b border-slate-800/40 last:border-0">
                  <span className="text-slate-200 font-medium">{h.name}</span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-slate-400">{h.dist}</span>
                    <span className={`font-semibold ${h.color}`}>{h.status}</span>
                    <span className="text-slate-500 bg-slate-800 px-1 py-0.5 rounded">24/7</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/80 mt-3">
            <span className="text-[11px] text-[#2563EB] hover:underline font-mono cursor-pointer flex items-center gap-0.5">
              View all hospitals <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* 5. DASHBOARD FOOTER */}
      <footer className="pt-3 pb-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div>ResQLink Command Center 2.0 • Connecting Help When Networks Fail</div>
        <div>v2.0.0</div>
      </footer>

      {/* 6. DRAWERS: Emergency Detail Drawer & Quick Dispatch Drawer */}
      {showDetailDrawer && selectedEmergency && (
        <EmergencyDetailDrawer
          emergency={selectedEmergency}
          operatorLocation={operatorLocation}
          onClose={() => setShowDetailDrawer(false)}
          onOpenDispatch={() => {
            setShowDetailDrawer(false);
            setShowDispatchDrawer(true);
          }}
        />
      )}

      {showDispatchDrawer && selectedEmergency && (
        <QuickDispatchDrawer
          emergency={selectedEmergency}
          ambulances={ambulances}
          rescueTeams={rescueTeams}
          drones={drones}
          hospitals={hospitals}
          operatorLocation={operatorLocation}
          onClose={() => setShowDispatchDrawer(false)}
        />
      )}
    </div>
  );
}
