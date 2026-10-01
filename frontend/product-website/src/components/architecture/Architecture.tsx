import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, ShieldAlert, Cpu, Wifi, Database, Info } from 'lucide-react';
import { Container } from '../ui/Container';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface Node {
  id: string;
  label: string;
  desc: string;
  x: number;
  y: number;
  icon: React.ReactNode;
}

export const Architecture: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes: Node[] = [
    { id: 'mobile', label: 'Mobile Application', desc: 'React Native Expo client that initializes SOS distress payloads, broadcasts offline BLE beacons, and queries local first aid blueprints.', x: 120, y: 150, icon: <Wifi className="w-5 h-5" /> },
    { id: 'auth', label: 'Firebase Auth', desc: 'Provides safe registration protocols for emergency credentials and profile synchronization authorization.', x: 380, y: 70, icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'rtdb', label: 'Realtime Database (RTDB)', desc: 'The live synchronization backbone. Stores user locations, active emergencies, team statuses, and coordinate telemetry.', x: 380, y: 230, icon: <Database className="w-5 h-5" /> },
    { id: 'engine', label: 'Emergency Engine', desc: 'A core node that filters coordinates, calculates distances to responders, and manages automated fleet allocations.', x: 640, y: 150, icon: <Cpu className="w-5 h-5" /> },
    { id: 'ai', label: 'ResQAI Assistant', desc: 'Integrates OpenAI GPT endpoints with ICE profiles and trauma parameters to output tailored diagnostics.', x: 640, y: 280, icon: <Server className="w-5 h-5" /> },
    { id: 'hospitals', label: 'Hospital Gateways', desc: 'Direct APIs querying open bed availabilities and dispatching alert payloads to neighboring trauma centers.', x: 900, y: 70, icon: <Database className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Admin Command Center', desc: 'Vite React dashboard containing Leaflet Live Maps, active heatmaps, and simulated rescue team controls.', x: 900, y: 230, icon: <Server className="w-5 h-5" /> }
  ];

  const connections = [
    { from: 'mobile', to: 'auth', path: 'M 180 130 C 250 80, 300 80, 340 80' },
    { from: 'mobile', to: 'rtdb', path: 'M 180 170 C 250 220, 300 220, 340 220' },
    { from: 'auth', to: 'rtdb', path: 'M 380 95 L 380 205' },
    { from: 'rtdb', to: 'engine', path: 'M 420 230 C 500 230, 550 180, 600 170' },
    { from: 'engine', to: 'ai', path: 'M 640 175 L 640 255' },
    { from: 'engine', to: 'hospitals', path: 'M 680 130 C 750 80, 800 80, 860 80' },
    { from: 'rtdb', to: 'dashboard', path: 'M 420 240 C 580 280, 780 280, 860 250' },
    { from: 'engine', to: 'dashboard', path: 'M 680 160 C 750 180, 800 210, 860 220' }
  ];

  return (
    <section id="architecture" className="py-24 lg:py-32 relative bg-brand-surface border-t border-brand-border/10">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <Badge variant="blue" className="mb-4">ENGINE SYSTEM</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
            Ecosystem Platform Architecture
          </h2>
          <p className="text-brand-textSecondary text-base sm:text-lg leading-relaxed">
            Hover over the system nodes to analyze how emergency data payloads stream from the mobile client to Firebase RTDB databases, AI engines, and responder terminals.
          </p>
        </div>

        {/* Node diagram viewport */}
        <div className="w-full overflow-x-auto select-none pb-8 scrollbar-thin">
          <div className="min-w-[1000px] h-[400px] relative mx-auto bg-brand-navy rounded-3xl border border-brand-border/20 p-6 overflow-hidden">
            {/* SVG Connection Paths */}
            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Static Background Connection lines */}
              {connections.map((conn, idx) => {
                const isHighlighted = activeNode === conn.from || activeNode === conn.to;
                return (
                  <path
                    key={`static-${idx}`}
                    d={conn.path}
                    fill="none"
                    stroke={isHighlighted ? '#2563EB' : '#1F2937'}
                    strokeWidth={isHighlighted ? 2 : 1.5}
                    style={{ transition: 'stroke 0.3s ease' }}
                    className="transition-colors duration-300"
                  />
                );
              })}

              {/* Glowing animated connection paths */}
              {connections.map((conn, idx) => {
                const isHighlighted = activeNode === conn.from || activeNode === conn.to;
                return (
                  <path
                    key={`dynamic-${idx}`}
                    d={conn.path}
                    fill="none"
                    stroke={isHighlighted ? '#FF3B30' : '#2563EB'}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    strokeDasharray="8 15"
                    style={{
                      animation: 'dash-flow 6s linear infinite',
                      opacity: isHighlighted ? 1 : 0.45
                    }}
                  />
                );
              })}
            </svg>

            {/* Glowing nodes overlay wrapper */}
            {nodes.map((node) => {
              const isActive = activeNode === node.id;
              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                  className="absolute z-10 cursor-pointer"
                  style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`w-44 p-3 rounded-2xl border text-center transition-all duration-350 ${
                      isActive
                        ? 'glass-card border-brand-blue/60 bg-brand-blue/10 shadow-[0_0_30px_rgba(37,99,235,0.25)]'
                        : 'glass-panel border-brand-border/20 bg-brand-surface/75'
                    }`}
                  >
                    <div className={`mx-auto w-9 h-9 rounded-xl border flex items-center justify-center mb-2.5 ${
                      isActive ? 'bg-brand-blue/15 border-brand-blue/30 text-brand-blue' : 'bg-brand-navy border-brand-border/15 text-brand-textSecondary'
                    }`}>
                      {node.icon}
                    </div>
                    <span className="block text-xs font-bold text-white tracking-tight">{node.label}</span>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node detail display panel */}
        <div className="mt-8 max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {activeNode ? (
              <motion.div
                key={activeNode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="p-6 border border-brand-blue/35 shadow-[0_5px_20px_rgba(37,99,235,0.15)] bg-brand-navy border-l-brand-blue border-l-2">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">
                        {nodes.find((n) => n.id === activeNode)?.label}
                      </h4>
                      <p className="text-brand-textSecondary text-xs leading-relaxed">
                        {nodes.find((n) => n.id === activeNode)?.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="text-center text-xs font-mono text-brand-textSecondary/50 bg-brand-surface/30 border border-brand-border/10 py-5 rounded-2xl">
                HOVER OVER ARCHITECTURE NODES FOR INTEGRATION EXPLANATIONS
              </div>
            )}
          </AnimatePresence>
        </div>
      </Container>

      {/* Global CSS Inject keyframes for SVG dash offset flow */}
      <style>{`
        @keyframes dash-flow {
          to {
            stroke-dashoffset: -120;
          }
        }
      `}</style>
    </section>
  );
};
