import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Layout, 
  Play, 
  Map, 
  Radio, 
  Navigation, 
  Server, 
  ShieldAlert, 
  Bot, 
  UserSquare2, 
  Hospital, 
  PlaneTakeoff,
  Github,
  BookOpen
} from 'lucide-react';
import { Container } from '../ui/Container';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  useDashboardMetrics,
  useEmergencyFeed,
  useHospitalStatus,
  useFleetStatus,
  commandCenterService,
  LiveMap,
  type MapMarker
} from '@resqlink/shared';

const MOBILE_URL = import.meta.env.VITE_MOBILE_URL || '/mobile';
const MOBILE_ORIGIN = import.meta.env.VITE_MOBILE_ORIGIN || window.location.origin;

export const LiveDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'dashboard' | 'highlights'>('mobile');
  const [activeMobileScreen, setActiveMobileScreen] = useState('sos');
  const [isAlertFlashing, setIsAlertFlashing] = useState(false);
  const [dbLogs, setDbLogs] = useState<string[]>([]);
  
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Consume Live RTDB data via shared hooks
  const metricsState = useDashboardMetrics();
  const emergenciesState = useEmergencyFeed();
  const hospitalsState = useHospitalStatus();
  const fleetState = useFleetStatus();

  // Subscribe to real-time system logs
  useEffect(() => {
    const unsub = commandCenterService.subscribeToActivity((list) => {
      const formatted = list.slice(0, 10).map((log) => {
        const time = new Date(log.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false 
        });
        return `[${time}] ${log.action.toUpperCase()}: ${log.detail}`;
      });
      setDbLogs(formatted.length > 0 ? formatted : [
        '[SYSTEM] Command Network initialized.',
        '[SYSTEM] Database connection established with Realtime Engine.'
      ]);
    });
    return unsub;
  }, []);

  // Post navigation message to embedded mobile preview iframe
  const handleMobileScreenChange = (screenId: string) => {
    setActiveMobileScreen(screenId);
    if (iframeRef.current) {
      console.log('[LiveDemo] Posting NAVIGATE message to mobile iframe:', screenId);
      iframeRef.current.contentWindow?.postMessage(
        { type: 'NAVIGATE', screen: screenId },
        MOBILE_ORIGIN
      );
    }
  };

  // Safe read-only local SOS simulation trigger
  const handleSimulateSOS = () => {
    if (isAlertFlashing) return;

    setIsAlertFlashing(true);
    setDbLogs(prev => [
      `[SIMULATION] Showcase local SOS alert triggered.`,
      `[SIMULATION] Note: The Product Website is read-only. To send a real RTDB alert, launch the Mobile App.`,
      ...prev
    ]);

    setTimeout(() => {
      setIsAlertFlashing(false);
    }, 4000);
  };

  // Derive live metrics from RTDB subscriptions
  const metrics = {
    active: metricsState.data.activeCount,
    resolved: metricsState.data.resolvedCount,
    drones: metricsState.data.droneCount,
    hospitals: metricsState.data.hospitalCount
  };

  // Filter latest emergencies
  const recentEmergencies = emergenciesState.data.slice(0, 4).map((e) => {
    const timeDiff = Math.max(0, Date.now() - e.createdAt);
    const mins = Math.floor(timeDiff / 60000);
    const timeLabel = mins === 0 ? 'Just now' : `${mins}m ago`;
    return {
      id: e.id,
      name: e.userName,
      type: e.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      status: e.status.replace(/\b\w/g, c => c.toUpperCase()),
      time: timeLabel
    };
  });

  // Construct map markers from all live nodes
  const mapMarkers: MapMarker[] = [];

  // Add emergencies
  emergenciesState.data.forEach((e) => {
    if ((e.status === 'active' || e.status === 'assigned') && e.location && typeof e.location.latitude === 'number' && typeof e.location.longitude === 'number') {
      mapMarkers.push({
        id: e.id,
        latitude: e.location.latitude,
        longitude: e.location.longitude,
        kind: 'sos',
        title: e.userName,
        popupHtml: `<div class="p-1">
          <strong class="text-white block font-sans">${e.userName}</strong>
          <span class="text-slate-400 text-xs font-mono font-bold uppercase">${e.type}</span>
          <span class="block text-[10px] text-red-400 mt-1 uppercase font-bold">${e.status}</span>
        </div>`,
        pulse: e.status === 'active'
      });
    }
  });

  // Add hospitals
  hospitalsState.data.forEach((h) => {
    if (h.location && typeof h.location.latitude === 'number' && typeof h.location.longitude === 'number') {
      mapMarkers.push({
        id: h.id,
        latitude: h.location.latitude,
        longitude: h.location.longitude,
        kind: 'hospital',
        title: h.name,
        popupHtml: `<div class="p-1">
          <strong class="text-white block font-sans">${h.name}</strong>
          <span class="text-slate-400 text-xs font-sans">${h.address}</span>
          <span class="block text-[10px] text-green-400 mt-1 uppercase font-bold">${h.isOpen ? 'OPEN' : 'CLOSED'}</span>
        </div>`
      });
    }
  });

  // Add rescue teams
  fleetState.data.rescueTeams.forEach((t) => {
    if (t.location && typeof t.location.latitude === 'number' && typeof t.location.longitude === 'number') {
      mapMarkers.push({
        id: t.id,
        latitude: t.location.latitude,
        longitude: t.location.longitude,
        kind: 'team',
        title: t.name,
        popupHtml: `<div class="p-1">
          <strong class="text-white block font-sans">${t.name}</strong>
          <span class="text-slate-400 text-xs font-sans">Rescue Squad</span>
          <span class="block text-[10px] text-amber-400 mt-1 uppercase font-bold">${t.status}</span>
        </div>`
      });
    }
  });

  // Add ambulances
  fleetState.data.ambulances.forEach((a) => {
    if (typeof a.latitude === 'number' && typeof a.longitude === 'number') {
      mapMarkers.push({
        id: a.id,
        latitude: a.latitude,
        longitude: a.longitude,
        kind: 'ambulance',
        title: a.name,
        popupHtml: `<div class="p-1">
          <strong class="text-white block font-sans">${a.name}</strong>
          <span class="text-slate-400 text-xs font-sans">Emergency Unit</span>
          <span class="block text-[10px] text-cyan-400 mt-1 uppercase font-bold">${a.status}</span>
        </div>`
      });
    }
  });

  // Add drones
  fleetState.data.drones.forEach((d) => {
    if (d.location && typeof d.location.latitude === 'number' && typeof d.location.longitude === 'number') {
      mapMarkers.push({
        id: d.id,
        latitude: d.location.latitude,
        longitude: d.location.longitude,
        kind: 'drone',
        title: d.name,
        popupHtml: `<div class="p-1">
          <strong class="text-white block font-sans">${d.name}</strong>
          <span class="text-slate-400 text-xs font-mono font-bold uppercase">Battery: ${d.battery}%</span>
          <span class="block text-[10px] text-emerald-400 mt-1 uppercase font-bold">${d.status}</span>
        </div>`
      });
    }
  });

  return (
    <section id="demo" className="py-24 lg:py-32 relative bg-brand-navy">
      {/* Decorative gradient overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/5 blur-[180px] rounded-full pointer-events-none" />

      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <Badge variant="blue" className="mb-4">INTERACTIVE PORTFOLIO</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
            Ecosystem Live Demonstration
          </h2>
          <p className="text-brand-textSecondary text-base sm:text-lg leading-relaxed">
            Test the ResQLink mobile application controls, trigger alert logs inside the Admin Dashboard simulation, or watch project highlights.
          </p>
        </div>

        {/* Showcase Switcher Tabs */}
        <div className="flex justify-center mb-12">
          <div className="glass-panel p-1 rounded-2xl border border-brand-border/20 flex gap-2">
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === 'mobile'
                  ? 'bg-brand-blue text-white shadow-lg glow-blue'
                  : 'text-brand-textSecondary hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" /> Mobile App Preview
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-brand-blue text-white shadow-lg glow-blue'
                  : 'text-brand-textSecondary hover:text-white'
              }`}
            >
              <Layout className="w-4 h-4" /> Command Dashboard
            </button>
            <button
              onClick={() => setActiveTab('highlights')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === 'highlights'
                  ? 'bg-brand-blue text-white shadow-lg glow-blue'
                  : 'text-brand-textSecondary hover:text-white'
              }`}
            >
              <Play className="w-4 h-4" /> Video & Specs
            </button>
          </div>
        </div>

        {/* Content Render Panel */}
        <div className="relative min-h-[600px] w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'mobile' && (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                {/* Screen selector buttons */}
                <div className="lg:col-span-5 flex flex-col gap-3.5">
                  <h3 className="text-xl font-bold text-white tracking-tight mb-4">
                    Explore Smartphone Views
                  </h3>
                  {[
                    { id: 'splash', label: 'Splash Screen', icon: <ShieldAlert className="w-4 h-4 text-brand-red" />, desc: 'Core boot-loader and authorization checks.' },
                    { id: 'home', label: 'Live GPS Tracker', icon: <Navigation className="w-4 h-4 text-brand-blue" />, desc: 'Identifies coordinates and broadcasts beacons.' },
                    { id: 'sos', label: 'Distressed SOS Panel', icon: <Radio className="w-4 h-4 text-brand-red" />, desc: 'Hold down SOS button to broadcast emergency pings.' },
                    { id: 'ai', label: 'ResQAI Intelligence', icon: <Bot className="w-4 h-4 text-brand-blue" />, desc: 'AI triage analyzer and custom medical instructions.' },
                    { id: 'profile', label: 'ICE Medical Card', icon: <UserSquare2 className="w-4 h-4 text-brand-green" />, desc: 'Stores blood type, allergies, and contacts locally.' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => handleMobileScreenChange(btn.id)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer ${
                        activeMobileScreen === btn.id
                          ? 'glass-card border-brand-blue/35 bg-brand-blue/5 shadow-[0_4px_20px_rgba(37,99,235,0.15)]'
                          : 'border-brand-border/10 bg-brand-surface/40 hover:bg-brand-surface/80'
                      }`}
                    >
                      <div className={`p-2 rounded-xl border ${
                        activeMobileScreen === btn.id ? 'bg-brand-blue/10 border-brand-blue/20' : 'bg-brand-navy border-brand-border/15'
                      }`}>
                        {btn.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm tracking-tight">{btn.label}</h4>
                        <p className="text-brand-textSecondary text-xs leading-normal mt-0.5">{btn.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* iPhone Simulator Graphic mockup */}
                <div className="lg:col-span-7 flex justify-center">
                  <div className="relative">
                    {/* Shadow */}
                    <div className="absolute inset-0 bg-black/60 rounded-[48px] blur-3xl scale-95 translate-y-6" />
                    
                    {/* Device Frame */}
                    <div className="w-[300px] h-[610px] rounded-[48px] border-4 border-slate-700/80 bg-slate-900 relative overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30" />
                      
                      {/* Dynamic Island */}
                      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-45 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ml-auto mr-4 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-blue-900/60" />
                        </div>
                      </div>

                      {/* Screen content container */}
                      <div className="w-full h-full pt-8 pb-3 px-3">
                        <div className="w-full h-full bg-slate-950 rounded-[38px] overflow-hidden border border-brand-border/10 relative">
                          <iframe
                            ref={iframeRef}
                            src={MOBILE_URL}
                            className="w-full h-full border-none"
                            title="ResQLink Mobile Preview"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Control Panel left */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="glass-panel border border-brand-border/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white tracking-tight mb-3">
                      Simulator Controls
                    </h3>
                    <p className="text-brand-textSecondary text-xs leading-relaxed mb-6">
                      Trigger mock emergency signals to test the live Command Dashboard data synchronization pipeline.
                    </p>

                    <Button
                      variant="emergency"
                      onClick={handleSimulateSOS}
                      disabled={isAlertFlashing}
                      className="w-full mb-4"
                      icon={<Radio className="w-4 h-4 animate-pulse" />}
                    >
                      {isAlertFlashing ? 'Transmitting Distress...' : 'Simulate SOS Alert'}
                    </Button>

                    <div className="border-t border-brand-border/10 pt-4 flex flex-col gap-2.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span>Active Emergencies:</span>
                        <span className="font-bold text-brand-red">{metrics.active}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span>Active Rescue Drones:</span>
                        <span className="font-bold text-brand-blue">{metrics.drones}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span>Total Incidents Resolved:</span>
                        <span className="font-bold text-brand-green">{metrics.resolved}</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro Terminal logs */}
                  <div className="glass-panel border border-brand-border/20 rounded-2xl p-4">
                    <span className="text-[10px] font-mono text-brand-blue tracking-wider block mb-2">CONSOLE EVENTS LOGS</span>
                    <div className="h-[150px] overflow-y-auto bg-slate-950/80 rounded-lg p-3 font-mono text-[9px] text-brand-textSecondary flex flex-col gap-1.5">
                      {dbLogs.map((log, idx) => (
                        <div key={idx} className="leading-tight border-l border-brand-blue/30 pl-1.5">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dashboard graphic wrapper right */}
                <div className="lg:col-span-8">
                  <div className="w-full rounded-2xl border border-brand-border/25 bg-slate-950 overflow-hidden shadow-2xl relative">
                    {/* Flashing SOS alert overlay banner */}
                    {isAlertFlashing && (
                      <div className="bg-brand-red text-center py-2 text-xs font-bold text-white animate-pulse absolute top-0 left-0 right-0 z-30 tracking-wider">
                        🚨 EMERGENCY RADIAL PIN DETECTED // DISPATCH SPEED = IMMEDIATE 🚨
                      </div>
                    )}

                    {/* Dashboard Header toolbar */}
                    <div className="bg-brand-surface border-b border-brand-border/20 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-brand-red/10 flex items-center justify-center text-brand-red">
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-white">RESQCOMMAND // Fleet Portal</span>
                      </div>
                      <Badge variant="blue">LIVE SYNCED</Badge>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950">
                      {/* Metric cards */}
                      <div className="md:col-span-4 bg-brand-surface border border-brand-border/15 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-red/15 text-brand-red flex items-center justify-center">
                          <ShieldAlert className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono text-brand-textSecondary uppercase">Active SOS</span>
                          <span className="text-base font-bold text-white font-mono">{metrics.active}</span>
                        </div>
                      </div>
                      
                      <div className="md:col-span-4 bg-brand-surface border border-brand-border/15 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-blue/15 text-brand-blue flex items-center justify-center">
                          <PlaneTakeoff className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono text-brand-textSecondary uppercase">Fleet Drones</span>
                          <span className="text-base font-bold text-white font-mono">{metrics.drones} Active</span>
                        </div>
                      </div>

                      <div className="md:col-span-4 bg-brand-surface border border-brand-border/15 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-green/15 text-brand-green flex items-center justify-center">
                          <Hospital className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono text-brand-textSecondary uppercase">Trauma Hubs</span>
                          <span className="text-base font-bold text-white font-mono">{metrics.hospitals} Open</span>
                        </div>
                      </div>

                      {/* Map preview integration (Real Leaflet Map) */}
                      <div className="md:col-span-8 bg-brand-surface border border-brand-border/15 rounded-xl h-[250px] relative overflow-hidden flex flex-col justify-between">
                        <LiveMap
                          markers={mapMarkers}
                          className="absolute inset-0 z-0 w-full h-full"
                          defaultZoom={11}
                        />
                        <div className="relative z-10 m-4 flex items-center justify-between text-[9px] font-mono bg-slate-950/70 px-2 py-1.5 rounded border border-brand-border/15 w-fit">
                          <Map className="w-3.5 h-3.5 text-brand-blue mr-1.5" /> Leaflet Core Maps // Region Chennai
                        </div>
                        <div className="relative z-10 m-4 text-[9px] font-mono text-brand-textSecondary self-end bg-slate-950/70 px-2 py-1 rounded border border-brand-border/15">
                          Active Telemetry: 13.0827° N, 80.2707° E
                        </div>
                      </div>

                      {/* Active list sidebar */}
                      <div className="md:col-span-4 bg-brand-surface border border-brand-border/15 rounded-xl p-4 h-[250px] flex flex-col">
                        <span className="text-[10px] font-mono font-bold text-white border-b border-brand-border/10 pb-2 block mb-3">
                          ACTIVE DISTRESS FEED
                        </span>
                        <div className="flex-1 overflow-y-auto flex flex-col gap-2 scrollbar-thin">
                          {recentEmergencies.length > 0 ? (
                            recentEmergencies.map((e) => (
                              <div key={e.id} className="p-2 rounded bg-brand-navy border border-brand-border/20 flex flex-col gap-1">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-bold text-white">{e.name}</span>
                                  <Badge variant={e.status === 'Active' || e.status === 'Assigned' ? 'red' : 'yellow'}>{e.status}</Badge>
                                </div>
                                <div className="flex justify-between text-[9px] font-mono">
                                  <span>{e.type}</span>
                                  <span className="text-brand-blue">{e.time}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex-1 flex items-center justify-center text-[10px] text-brand-textSecondary italic">
                              No active incidents in system.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'highlights' && (
              <motion.div
                key="highlights"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                {/* Left Column: highlights details */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Project Architectural Highlights
                  </h3>
                  <p className="text-brand-textSecondary text-sm leading-relaxed">
                    ResQLink is architected to balance live Firebase syncing with severe offline network constraints. Key details suitable for recruiters and FYP judges:
                  </p>

                  <div className="flex flex-col gap-4 text-xs font-medium">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red mt-0.5">
                        <Server className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-0.5">Dual Mode Redundancy</h4>
                        <p className="text-brand-textSecondary text-xs leading-normal">
                          Instantly switches between Firebase RTDB live mode and simulated Demo Mode, making testing and portfolio reviews frictionless.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-brand-blue mt-0.5">
                        <Map className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-0.5">OSM Overpass API Mapping</h4>
                        <p className="text-brand-textSecondary text-xs leading-normal">
                          Queries nearby emergency medical nodes directly from OpenStreetMap data, providing real-time triage guidance.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-brand-green/10 border border-brand-green/20 text-brand-green mt-0.5">
                        <Bot className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-0.5">AI-Powered First Aid Blueprint</h4>
                        <p className="text-brand-textSecondary text-xs leading-normal">
                          Feeds OpenAI GPT endpoints with ICE cards, emergency descriptors, and gps locations to generate diagnostic guides.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t border-brand-border/10 pt-6">
                    <a href="https://github.com" target="_blank" rel="noreferrer">
                      <Button variant="outline" icon={<Github className="w-4 h-4" />}>
                        GitHub Repository
                      </Button>
                    </a>
                    <a href="#architecture">
                      <Button variant="ghost" icon={<BookOpen className="w-4 h-4" />}>
                        Platform Documentation
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Right Column: simulated watch demo video frame */}
                <div className="lg:col-span-6 flex justify-center">
                  <Card className="w-full max-w-lg aspect-video relative overflow-hidden flex flex-col items-center justify-center border border-brand-border/25 group select-none">
                    {/* Simulated video thumbnail background */}
                    <div className="absolute inset-0 bg-cover bg-center filter brightness-50 group-hover:scale-105 transition-transform duration-700 bg-[url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1470&auto=format&fit=crop')]" />
                    
                    {/* Play Button micro interaction */}
                    <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center text-white glow-blue relative z-10 scale-100 group-hover:scale-110 transition-transform cursor-pointer border border-white/20">
                      <Play className="w-6 h-6 fill-current text-white" />
                    </div>

                    <span className="absolute bottom-4 left-4 z-20 font-mono text-[9px] tracking-widest text-brand-textSecondary uppercase bg-slate-950/70 border border-brand-border/15 px-2 py-1 rounded">
                      60s Interactive Preview // Watch Video
                    </span>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
};
