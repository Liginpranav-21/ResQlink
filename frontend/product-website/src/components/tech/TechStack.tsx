import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Database, Code2, Globe } from 'lucide-react';
import { Container } from '../ui/Container';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface TechItem {
  name: string;
  category: string;
  icon: React.ReactNode;
  desc: string;
}

export const TechStack: React.FC = () => {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animated counters state
  const [emergenciesCount, setEmergenciesCount] = useState(0);
  const [syncCount, setSyncCount] = useState(0);
  const [uptimeCount, setUptimeCount] = useState(0);

  // Intersection observer to trigger animated stats count-up
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Count up animation logic
  useEffect(() => {
    if (!inView) return;

    // Count up 12+ Emergencies
    const count1 = setInterval(() => {
      setEmergenciesCount((prev) => {
        if (prev >= 12) {
          clearInterval(count1);
          return 12;
        }
        return prev + 1;
      });
    }, 80);

    // Count up 100% Sync
    const count2 = setInterval(() => {
      setSyncCount((prev) => {
        if (prev >= 100) {
          clearInterval(count2);
          return 100;
        }
        return prev + 4;
      });
    }, 40);

    // Count up 24/7 (we will use 24)
    const count3 = setInterval(() => {
      setUptimeCount((prev) => {
        if (prev >= 24) {
          clearInterval(count3);
          return 24;
        }
        return prev + 1;
      });
    }, 40);

    return () => {
      clearInterval(count1);
      clearInterval(count2);
      clearInterval(count3);
    };
  }, [inView]);

  const technologies: TechItem[] = [
    { name: 'React', category: 'Frontend framework', icon: <Code2 className="w-5 h-5 text-[#61DAFB]" />, desc: 'Powering the responsive, modular Command Center dashboard.' },
    { name: 'React Native', category: 'Mobile core', icon: <Code2 className="w-5 h-5 text-[#61DAFB]" />, desc: 'Expo compilation template backing the smartphone SOS app.' },
    { name: 'TypeScript', category: 'Type safety', icon: <Terminal className="w-5 h-5 text-[#3178C6]" />, desc: 'Strict compiler verification mapping types across apps.' },
    { name: 'Tailwind CSS', category: 'Styling engine', icon: <Globe className="w-5 h-5 text-[#38BDF8]" />, desc: 'Modern styling system enabling premium glassmorphism layouts.' },
    { name: 'Firebase RTDB', category: 'Realtime database', icon: <Database className="w-5 h-5 text-[#FFCA28]" />, desc: 'Live synchronization channel routing distress signals instantly.' },
    { name: 'Leaflet Maps', category: 'Cartography', icon: <Globe className="w-5 h-5 text-[#10B981]" />, desc: 'Interactive canvas maps pinning victims, hospitals, and drone fleets.' },
    { name: 'OpenStreetMap', category: 'Node database', icon: <Globe className="w-5 h-5 text-[#7E9680]" />, desc: 'Overpass queries retrieving neighboring facility parameters.' },
    { name: 'OpenAI API', category: 'Triage AI', icon: <Terminal className="w-5 h-5 text-[#74A57F]" />, desc: 'GPT models generating first aid guides for trauma classifications.' }
  ];

  return (
    <section id="tech" ref={containerRef} className="py-24 lg:py-32 relative bg-brand-navy border-t border-brand-border/10">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-brand-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <Container>
        {/* Statistics count-up counters row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 lg:mb-32">
          <Card className="p-8 text-center bg-brand-surface/40 hover:border-brand-red/30">
            <span className="block text-[10px] font-mono text-brand-red tracking-wider uppercase mb-2">Trauma Coverage</span>
            <span className="text-5xl font-bold text-white font-mono">{emergenciesCount}+</span>
            <p className="text-brand-textSecondary text-xs leading-normal mt-3">
              Standardized emergency classifications (snake bites, heart attacks, floods) categorized with triage severity scales.
            </p>
          </Card>
          
          <Card className="p-8 text-center bg-brand-surface/40 hover:border-brand-blue/30">
            <span className="block text-[10px] font-mono text-brand-blue tracking-wider uppercase mb-2">Telemetry Synced</span>
            <span className="text-5xl font-bold text-white font-mono">{syncCount}%</span>
            <p className="text-brand-textSecondary text-xs leading-normal mt-3">
              Distress coordinates, user ICE files, and drone tracker status streams synchronized at sub-second scales.
            </p>
          </Card>

          <Card className="p-8 text-center bg-brand-surface/40 hover:border-brand-green/30">
            <span className="block text-[10px] font-mono text-brand-green tracking-wider uppercase mb-2">Availability</span>
            <span className="text-5xl font-bold text-white font-mono">{uptimeCount}/7</span>
            <p className="text-brand-textSecondary text-xs leading-normal mt-3">
              BLE offline beacon broadcasting maintains critical signal fan-out capabilities even when cellular infrastructure collapses.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left info column */}
          <div className="lg:col-span-5 text-left">
            <Badge variant="blue" className="mb-4">ENGINEERING STACK</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
              Production Grade Integration
            </h2>
            <p className="text-brand-textSecondary text-base sm:text-lg leading-relaxed mb-8">
              ResQLink integrates modern web technologies, real-time databases, mapping protocols, and large language models to construct a resilient rescue network.
            </p>
            <div className="font-mono text-xs text-brand-blue/70 flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 animate-pulse" /> COMPILER STATUS: PASSING (TS 6.0)
            </div>
          </div>

          {/* Right grid cards column */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {technologies.map((tech, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl border border-brand-border/10 bg-brand-surface/30 hover:bg-brand-surface/70 hover:border-brand-blue/20 transition-all duration-300 flex items-start gap-4"
              >
                <div className="p-2 bg-brand-navy rounded-xl border border-brand-border/15 flex items-center justify-center">
                  {tech.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm tracking-tight leading-none mb-1">{tech.name}</h4>
                  <span className="text-[9px] font-mono text-brand-textSecondary">{tech.category}</span>
                  <p className="text-brand-textSecondary text-[11px] leading-relaxed mt-2">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
