import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Radio, 
  MapPin, 
  Bot, 
  Hospital, 
  Truck, 
  PlaneTakeoff, 
  Database, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { Container } from '../ui/Container';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useEmergencyFeed } from '@resqlink/shared';

interface TimelineStep {
  time: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  log: string;
}

export const EmergencyJourney: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Listen to live emergencies
  const { data: emergencies } = useEmergencyFeed();
  const latestEmergency = emergencies?.[0];

  // Derive steps dynamically from the latest emergency in the database
  const steps: TimelineStep[] = latestEmergency ? [
    {
      time: '0.0s',
      title: 'SOS distress triggered',
      desc: `User "${latestEmergency.userName}" holds the panic button. ResQLink locks down application thread and compiles beacon payload.`,
      icon: <Radio className="w-5 h-5 text-brand-red animate-pulse" />,
      log: `[0.0s] SOS distress packet compiled for victim "${latestEmergency.userName}". Initializing BlueBeacon mesh network.`
    },
    {
      time: '2.0s',
      title: 'GPS coordinate lock',
      desc: `High precision GPS query matches satellite positions to identify exact user coordinates.`,
      icon: <MapPin className="w-5 h-5 text-brand-blue" />,
      log: `[2.0s] GPS telemetry locked: ${latestEmergency.location.latitude.toFixed(4)}° N, ${latestEmergency.location.longitude.toFixed(4)}° E.`
    },
    {
      time: '5.0s',
      title: 'AI identifies trauma type',
      desc: `ResQAI processes user descriptions, identifies high-impact shock parameters, and determines triage level.`,
      icon: <Bot className="w-5 h-5 text-brand-yellow" />,
      log: `[5.0s] AI triage analyzer complete: trauma type identified as ${latestEmergency.type.toUpperCase().replace('_', ' ')}. Severity: Level ${latestEmergency.level}.`
    },
    {
      time: '7.0s',
      title: 'Nearest medical facility queried',
      desc: 'System queries nearby OpenStreetMap nodes to identify closest open trauma centers.',
      icon: <Hospital className="w-5 h-5 text-brand-green" />,
      log: `[7.0s] OSM facility query matched nearby trauma hubs relative to ${latestEmergency.location.latitude.toFixed(4)}, ${latestEmergency.location.longitude.toFixed(4)}.`
    },
    {
      time: '8.0s',
      title: latestEmergency.assignedTeamName ? 'Rescue team assigned' : 'Awaiting team assignment',
      desc: latestEmergency.assignedTeamName 
        ? `Rescue squad "${latestEmergency.assignedTeamName}" is dispatched to the coordinate drop point.` 
        : 'Rescue squad dispatch queued in Admin Command Center.',
      icon: <Truck className="w-5 h-5 text-brand-blue" />,
      log: latestEmergency.assignedTeamName 
        ? `[8.0s] Rescue team assignment dispatched: Team "${latestEmergency.assignedTeamName}" (ID: ${latestEmergency.assignedTeamId}) marked EN_ROUTE.` 
        : `[8.0s] Dispatch queue: Awaiting team assignment by administrator.`
    },
    {
      time: '10.0s',
      title: latestEmergency.droneId ? 'ResQDrone payload launch' : 'Drone dispatch skipped',
      desc: latestEmergency.droneId 
        ? `Drone "${latestEmergency.droneId}" departs with emergency payload (first-aid kit, antivenom).` 
        : 'Incident status does not require automated drone dispatch.',
      icon: <PlaneTakeoff className="w-5 h-5 text-brand-blue" />,
      log: latestEmergency.droneId 
        ? `[10.0s] Drone "${latestEmergency.droneId}" launched. Payload: Trauma Hemostat Pack. ETA: 4.5 minutes.` 
        : `[10.0s] Drone dispatch skipped.`
    },
    {
      time: '15.0s',
      title: 'Hospital database alert sync',
      desc: 'Firebase RTDB synchronization is complete. Hospital dashboard syncs active status logs.',
      icon: <Database className="w-5 h-5 text-brand-green" />,
      log: '[15.0s] Emergency synchronization: Hospital alert synced. Database write status: SUCCESS.'
    },
    {
      time: latestEmergency.status === 'resolved' ? 'Resolved' : 'Active',
      title: latestEmergency.status === 'resolved' ? 'Emergency resolved' : 'Rescue mission active',
      desc: latestEmergency.status === 'resolved' 
        ? 'Rescue team arrived at coordinates, applied first aid, and secured the victim.' 
        : 'Rescue operations are currently active at distress coordinates.',
      icon: <HeartHandshake className="w-5 h-5 text-brand-green" />,
      log: latestEmergency.status === 'resolved' 
        ? '[Resolved] Victim secured and stable. Incident marked RESOLVED. Mission log closed.' 
        : `[Active] Rescue mission active. Status: ${latestEmergency.status.toUpperCase()}.`
    }
  ] : [
    {
      time: '0.0s',
      title: 'SOS distress triggered',
      desc: 'User holds the panic button. ResQLink locks down application thread and prepares beacon payload.',
      icon: <Radio className="w-5 h-5 text-brand-red animate-pulse" />,
      log: '[0.0s] SOS distress packet compiled. Initializing BlueBeacon mesh network.'
    },
    {
      time: '2.0s',
      title: 'GPS coordinate lock',
      desc: 'High precision GPS query matches satellite positions to identify exact user coordinates.',
      icon: <MapPin className="w-5 h-5 text-brand-blue" />,
      log: '[2.0s] GPS telemetry locked: 11.0168° N, 76.9558° E. Altitude: 412m. Accuracy: ±3m.'
    },
    {
      time: '5.0s',
      title: 'AI identifies trauma type',
      desc: 'ResQAI processes user descriptions, identifies high-impact shock parameters, and determines triage level.',
      icon: <Bot className="w-5 h-5 text-brand-yellow" />,
      log: '[5.0s] AI triage analyzer complete: trauma type identified as HEAVY_BLEEDING. Severity: Level 3 (CRITICAL).'
    },
    {
      time: '7.0s',
      title: 'Nearest medical facility queried',
      desc: 'System queries nearby OpenStreetMap nodes to identify closest open trauma centers.',
      icon: <Hospital className="w-5 h-5 text-brand-green" />,
      log: '[7.0s] OSM facility query matches PSG Hospital (1.2km away). Active trauma beds verified: 12 available.'
    },
    {
      time: '8.0s',
      title: 'Rescue team dispatch seed',
      desc: 'Admin dashboard triggers automated mission card. Alpha Rescue team is assigned to the victim.',
      icon: <Truck className="w-5 h-5 text-brand-blue" />,
      log: '[8.0s] Rescue team assignment dispatched: Team "Alpha Rescue" (ID: T001) marked EN_ROUTE.'
    },
    {
      time: '10.0s',
      title: 'ResQDrone-X payload launch',
      desc: 'Simulated drone launch coordinates matched. Drone departs with emergency payload (antivenom, gauze).',
      icon: <PlaneTakeoff className="w-5 h-5 text-brand-blue" />,
      log: '[10.0s] Drone "ResQDrone-X1" (ID: D001) launched. Payload: Trauma Hemostat Pack. ETA: 4.5 minutes.'
    },
    {
      time: '15.0s',
      title: 'Hospital database alert sync',
      desc: 'Firebase RTDB synchronization is complete. Hospital dashboard syncs active status logs.',
      icon: <Database className="w-5 h-5 text-brand-green" />,
      log: '[15.0s] Emergency synchronization: Hospital alert synced. Database write status: SUCCESS.'
    },
    {
      time: 'Victim Rescued',
      title: 'Emergency resolved',
      desc: 'Rescue team arrives at locked coordinates, applies hemostat, and transports victim to hospital.',
      icon: <HeartHandshake className="w-5 h-5 text-brand-green" />,
      log: '[Resolved] Victim secured and stable. Incident marked RESOLVED. Mission log closed.'
    }
  ];

  // Automatic timeline progression
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false); // Stop at end
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  // Sync log output with current step progression
  useEffect(() => {
    const activeLogs = steps.slice(0, currentStep + 1).map((s) => s.log);
    setLogs(activeLogs);
  }, [currentStep, steps]);

  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  return (
    <section id="timeline" className="py-24 lg:py-32 relative bg-brand-surface border-t border-brand-border/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,59,48,0.04)_0%,transparent_60%)]" />

      <Container className="relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <Badge variant="red" className="mb-4">REAL-TIME SIMULATOR</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
            Journey of an Emergency
          </h2>
          <p className="text-brand-textSecondary text-base sm:text-lg leading-relaxed">
            Witness how the ResQLink ecosystem reacts when a distress beacon is triggered. Automated tracking, AI triage diagnostics, and swift vehicle dispatches in action.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Timeline Steps list */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Player Controls */}
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant={isPlaying ? 'outline' : 'primary'}
                onClick={() => setIsPlaying(!isPlaying)}
                icon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              >
                {isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
              </Button>
              <Button variant="outline" onClick={handleRestart} icon={<RotateCcw className="w-4 h-4" />}>
                Reset
              </Button>
            </div>

            {/* Timeline Wrapper */}
            <div className="relative border-l border-brand-border/25 ml-4 pl-8 py-2 flex flex-col gap-8">
              {steps.map((step, idx) => {
                const isActive = currentStep === idx;
                const isCompleted = currentStep > idx;

                return (
                  <div key={idx} className="relative group">
                    {/* Glowing Timeline Marker */}
                    <div
                      className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 z-10 ${
                        isActive
                          ? 'bg-brand-blue border-brand-blue scale-110 glow-blue text-white'
                          : isCompleted
                          ? 'bg-brand-green border-brand-green text-white'
                          : 'bg-brand-navy border-brand-border text-brand-textSecondary'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-[9px] font-mono font-bold">{idx}</span>}
                    </div>

                    {/* Step Content Card */}
                    <Card
                      className={`p-6 transition-all duration-300 ${
                        isActive
                          ? 'bg-brand-navy border-brand-blue/30 scale-[1.01] shadow-[0_10px_30px_-10px_rgba(37,99,235,0.25)]'
                          : 'opacity-50 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl border ${
                          isActive 
                            ? 'bg-brand-blue/10 border-brand-blue/25' 
                            : 'bg-brand-surface/40 border-brand-border/10'
                        }`}>
                          {step.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-white text-base tracking-tight">{step.title}</h3>
                            <Badge variant={step.time.includes('s') ? 'blue' : 'green'}>{step.time}</Badge>
                          </div>
                          <p className="text-brand-textSecondary text-xs leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Virtual Simulator Console logs */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="glass-panel border border-brand-border/25 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-brand-border/15 pb-4 mb-4">
                <span className="text-xs font-bold font-mono tracking-wider text-brand-red flex items-center gap-2">
                  <Radio className="w-4 h-4 text-brand-red animate-pulse" /> NETWORK MISSION LOGS
                </span>
                <span className="text-[10px] font-mono text-brand-textSecondary bg-brand-navy px-2 py-0.5 rounded border border-brand-border/25">
                  LIVE STREAM
                </span>
              </div>

              {/* Console log list window */}
              <div className="h-[400px] overflow-y-auto bg-slate-950/80 rounded-xl p-4 font-mono text-[10px] sm:text-xs text-brand-textSecondary flex flex-col gap-3 scrollbar-thin">
                <AnimatePresence>
                  {logs.map((log, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`leading-relaxed border-l-2 pl-2.5 ${
                        idx === logs.length - 1
                          ? log.includes('Resolved')
                            ? 'text-brand-green border-brand-green bg-brand-green/5 py-1 rounded'
                            : 'text-brand-blue border-brand-blue bg-brand-blue/5 py-1 rounded'
                          : 'border-brand-border/30 opacity-70'
                      }`}
                    >
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isPlaying && (
                  <div className="flex items-center gap-2 text-brand-blue/60 mt-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping" />
                    <span>Listening for next emergency ping...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
