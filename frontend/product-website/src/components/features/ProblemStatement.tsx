import React from 'react';
import { AlertTriangle, WifiOff, RefreshCw, Zap } from 'lucide-react';
import { Container } from '../ui/Container';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const ProblemStatement: React.FC = () => {
  const problems = [
    {
      icon: <Zap className="w-6 h-6 text-brand-red" />,
      title: 'Slow Manual Dispatch',
      stat: '+12 Mins',
      desc: 'Traditional SOS routing goes through manual operators and call centers, leading to crucial latency when seconds determine human survival.',
      badge: 'Latency'
    },
    {
      icon: <WifiOff className="w-6 h-6 text-brand-red" />,
      title: 'Infrastructure Collapses',
      stat: '0% Sync',
      desc: 'Cell towers, power grids, and internet backbones fail during landslides, floods, or earthquakes, disconnecting victims from emergency services.',
      badge: 'Offline Gap'
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-brand-red" />,
      title: 'Isolated Siloed Systems',
      stat: '75% Split',
      desc: 'Rescue agencies, police divisions, and neighborhood hospitals operate on separate legacy channels with no synchronized data stream.',
      badge: 'Siloed Channels'
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-brand-red" />,
      title: 'No AI Analytics',
      stat: 'Manual',
      desc: 'No automated analysis exists to classify trauma types (snake bite vs cardiac arrest) and dispatch custom first-aid instructions instantly.',
      badge: 'Legacy Engine'
    }
  ];

  return (
    <section id="ecosystem" className="py-24 lg:py-32 relative bg-brand-navy">
      {/* Visual Accent */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-red/5 blur-[120px] rounded-full pointer-events-none" />

      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <Badge variant="red" className="mb-4">SYSTEM AUDIT</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
            Legacy Dispatch Infrastructure Is Failing
          </h2>
          <p className="text-brand-textSecondary text-base sm:text-lg leading-relaxed">
            Emergency response systems have not adapted to modern computing scales. Disconnections, latency, and siloed channels put lives at risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((prob, idx) => (
            <Card key={idx} className="p-6 relative flex flex-col justify-between border-t-2 border-t-transparent hover:border-t-brand-red transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/25 flex items-center justify-center glow-red">
                    {prob.icon}
                  </div>
                  <Badge variant="red">{prob.badge}</Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{prob.title}</h3>
                <p className="text-brand-textSecondary text-sm leading-relaxed mb-6">{prob.desc}</p>
              </div>
              <div className="flex items-baseline gap-1 border-t border-brand-border/10 pt-4 font-mono">
                <span className="text-2xl font-bold text-brand-red">{prob.stat}</span>
                <span className="text-[10px] text-brand-textSecondary uppercase tracking-wider">Discrepancy</span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};
