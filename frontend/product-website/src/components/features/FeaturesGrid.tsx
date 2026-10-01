import React from 'react';
import { 
  Zap, 
  Bot, 
  MapPin, 
  WifiOff, 
  Bluetooth, 
  UserSquare2, 
  Users, 
  PlaneTakeoff, 
  LayoutDashboard, 
  BarChart4 
} from 'lucide-react';
import { Container } from '../ui/Container';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-brand-red" />,
      title: 'One-Tap SOS Dispatch',
      desc: 'Activate a 3-level severity alert with a single long-press. Automatically formats GPS payloads and seeds response nodes.',
      size: 'lg:col-span-4',
      badge: 'Critical'
    },
    {
      icon: <Bot className="w-5 h-5 text-brand-blue" />,
      title: 'ResQAI Intelligence',
      desc: 'OpenAI API integrated assistant that processes trauma descriptions, determines urgency, and relays first-aid directions.',
      size: 'lg:col-span-4',
      badge: 'AI Engine'
    },
    {
      icon: <Bluetooth className="w-5 h-5 text-brand-blue" />,
      title: 'BlueBeacon BLE',
      desc: 'Broadcase emergency signals offline via Bluetooth Low Energy. Reaches rescue squads even when cellular grids fail.',
      size: 'lg:col-span-4',
      badge: 'Mesh'
    },
    {
      icon: <WifiOff className="w-5 h-5 text-brand-yellow" />,
      title: '100% Offline Support',
      desc: 'Access local first aid blueprints, diagnostic criteria, and beacon broadcast facilities completely offline.',
      size: 'lg:col-span-6',
      badge: 'Reliability'
    },
    {
      icon: <MapPin className="w-5 h-5 text-brand-green" />,
      title: 'Live GPS Triggers',
      desc: 'Track user locations, route emergency paths, and identify altitude/velocity data to transmit coordinates to responders.',
      size: 'lg:col-span-6',
      badge: 'Tracking'
    },
    {
      icon: <PlaneTakeoff className="w-5 h-5 text-brand-blue" />,
      title: 'ResQDrone-X Fleet',
      desc: 'Trigger automatic drone launch simulations to deliver emergency payloads (antivenom, AEDs) to remote grid positions.',
      size: 'lg:col-span-4',
      badge: 'Fleet'
    },
    {
      icon: <UserSquare2 className="w-5 h-5 text-brand-green" />,
      title: 'ICE Medical Profile',
      desc: 'Store emergency blood groups, medical allergies, prescriptions, and contacts locally to feed response teams.',
      size: 'lg:col-span-4',
      badge: 'ICE Card'
    },
    {
      icon: <Users className="w-5 h-5 text-brand-blue" />,
      title: 'Contact Fan-out',
      desc: 'Send automated alert links, GPS coordinates, and severity logs to predefined emergency contacts via SMS/Email.',
      size: 'lg:col-span-4',
      badge: 'Fan-out'
    },
    {
      icon: <LayoutDashboard className="w-5 h-5 text-brand-green" />,
      title: 'Command Center',
      desc: 'Admin dashboard built with Leaflet Maps, active heatmap overlays, live metrics, and real-time fleet trackers.',
      size: 'lg:col-span-6',
      badge: 'Admin Panel'
    },
    {
      icon: <BarChart4 className="w-5 h-5 text-brand-blue" />,
      title: 'Predictive Analytics',
      desc: 'Monitor incident reports, ambulance response times, active hospital beds, and system uptimes in real time.',
      size: 'lg:col-span-6',
      badge: 'Metrics'
    }
  ];

  return (
    <section id="features" className="py-24 lg:py-32 relative bg-brand-navy border-t border-brand-border/10">
      {/* Decorative Gradient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-blue/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-green/5 blur-[150px] rounded-full pointer-events-none" />

      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <Badge variant="blue" className="mb-4">CORE CAPABILITIES</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
            Engineered For Extreme Scenarios
          </h2>
          <p className="text-brand-textSecondary text-base sm:text-lg leading-relaxed">
            From single-tap mobile distress protocols to drone dispatch fleets and Command Center live maps, ResQLink connects help when networks fail.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {features.map((feat, idx) => (
            <Card 
              key={idx} 
              className={`p-8 flex flex-col justify-between hover:border-brand-blue/40 ${feat.size}`}
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-10 h-10 rounded-xl bg-brand-navy border border-brand-border/20 flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <Badge variant="slate">{feat.badge}</Badge>
                </div>
                <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{feat.title}</h3>
                <p className="text-brand-textSecondary text-sm leading-relaxed mb-6">{feat.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};
