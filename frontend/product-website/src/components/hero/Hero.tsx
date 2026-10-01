import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Navigation, Terminal, Activity } from 'lucide-react';
import { Button } from '../ui/Button';
import { useEmergencyFeed } from '@resqlink/shared';

export const Hero: React.FC = () => {
  const { data: emergencies } = useEmergencyFeed();
  const latestActive = emergencies?.find(e => e.status === 'active' || e.status === 'assigned');
  const displayCoords = latestActive 
    ? `${latestActive.location.latitude.toFixed(4)}° N, ${latestActive.location.longitude.toFixed(4)}° E` 
    : '11.0168° N, 76.9558° E';
  const displayDispatch = latestActive 
    ? `${latestActive.level === 3 ? 'Critical Red' : latestActive.level === 2 ? 'Medical Orange' : 'Minor Yellow'} Alert #${latestActive.id.slice(0, 6)}` 
    : 'No Active Incidents';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [deviceRotation, setDeviceRotation] = useState({ x: 10, y: -15 });
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);

  // Phone Screen rotation animation cycle
  useEffect(() => {
    const screenInterval = setInterval(() => {
      setActiveScreenIndex((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(screenInterval);
  }, []);

  // Track mouse coordinates for interactive background canvas and 3D device tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Background canvas tracker
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // 3D device rotation calculation based on viewport centers
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      setDeviceRotation({
        x: 10 - dy * 12,
        y: -15 + dx * 15,
      });
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
      setDeviceRotation({ x: 10, y: -15 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Mesh Network Particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes properties
    const numParticles = Math.min(width < 768 ? 35 : 75, 100);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.5,
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Render grid background accent
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 64;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render connection lines
      ctx.lineWidth = 1;
      for (let i = 0; i < numParticles; i++) {
        const p1 = particles[i];
        
        // Move particle
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce on borders
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Draw particle node
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nodes to neighboring nodes
        for (let j = i + 1; j < numParticles; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.12;
            ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connect node to mouse cursor if close
        const mouseDist = Math.hypot(p1.x - mouseRef.current.x, p1.y - mouseRef.current.y);
        if (mouseDist < 200) {
          const alpha = (1 - mouseDist / 200) * 0.25;
          // Gradient connection color (blue close, red closer)
          ctx.strokeStyle = mouseDist < 100 
            ? `rgba(255, 59, 48, ${alpha})` 
            : `rgba(37, 99, 235, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.stroke();
        }
      }

      // Draw mouse cursor highlight pulse
      if (mouseRef.current.x > 0) {
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 40, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          40
        );
        grad.addColorStop(0, 'rgba(37, 99, 235, 0.05)');
        grad.addColorStop(1, 'rgba(37, 99, 235, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulatedScreens = [
    {
      title: 'Splash Screen',
      content: (
        <div className="h-full bg-brand-navy flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-12 h-12 rounded-2xl bg-brand-red flex items-center justify-center glow-red animate-pulse mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">RESQ<span className="text-brand-red">LINK</span></h2>
          <span className="text-[9px] font-mono text-brand-blue tracking-[0.2em] mt-1 uppercase">Emergency Ecosystem</span>
        </div>
      ),
    },
    {
      title: 'Home / Live GPS Tracker',
      content: (
        <div className="h-full bg-brand-navy flex flex-col p-5 select-none justify-between">
          <div className="flex items-center justify-between border-b border-brand-border/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-green animate-ping" />
              <span className="text-xs font-semibold text-white">System: Secure</span>
            </div>
            <span className="text-[9px] font-mono text-brand-textSecondary bg-brand-surface px-2 py-0.5 rounded border border-brand-border/20">GPS LOCK</span>
          </div>

          <div className="my-auto flex flex-col items-center justify-center py-4 relative">
            {/* Pulsating emergency circles */}
            <div className="absolute w-32 h-32 rounded-full border border-brand-blue/20 flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full border border-brand-blue/30 flex items-center justify-center animate-pulse">
                <div className="absolute w-16 h-16 rounded-full bg-brand-blue/10 animate-ping" />
              </div>
            </div>
            <Navigation className="w-8 h-8 text-brand-blue rotate-45 relative z-10 animate-bounce" />
            <span className="text-[10px] font-mono text-brand-textSecondary mt-6">Lat: 11.0168° N</span>
            <span className="text-[10px] font-mono text-brand-textSecondary">Lng: 76.9558° E</span>
          </div>

          <div className="border-t border-brand-border/10 pt-3">
            <div className="w-full py-2 bg-brand-red text-center text-xs font-semibold text-white rounded-xl glow-red">
              LONG PRESS SOS
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'AI Smart Response',
      content: (
        <div className="h-full bg-brand-navy flex flex-col p-4 select-none justify-between">
          <div className="flex items-center justify-between border-b border-brand-border/10 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-red animate-pulse" /> ResQAI Assistant
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5 justify-end">
            <div className="bg-brand-surface border border-brand-border/25 rounded-2xl p-2.5 max-w-[85%] self-start">
              <p className="text-[10px] text-brand-textSecondary leading-normal">
                I detected a high impact shock. Are you injured?
              </p>
            </div>
            <div className="bg-brand-blue/15 border border-brand-blue/30 rounded-2xl p-2.5 max-w-[80%] self-end">
              <p className="text-[10px] text-white leading-normal">
                Yes, severe heavy bleeding on arm. Send help.
              </p>
            </div>
            <div className="bg-brand-surface border border-brand-border/25 rounded-2xl p-2.5 max-w-[85%] self-start glow-green border-brand-green/20">
              <p className="text-[10px] text-brand-green font-semibold mb-1">ResQAI Engine:</p>
              <p className="text-[10px] text-brand-textSecondary leading-normal">
                First Aid: Apply firm direct pressure. Rescue dispatch ID #E228 initialized.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 border-t border-brand-border/10 pt-2 text-[10px] text-brand-textSecondary font-mono bg-brand-surface px-2.5 py-1.5 rounded-lg border border-brand-border/20">
            Establishing mesh connection...
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-brand-navy overflow-hidden pt-28"
    >
      {/* Background Interactive Mesh Nodes Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Floating radial auroras */}
      <div className="aurora-bg" />

      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Side: Copywriting Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Animated Tech Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-brand-border/20 text-xs font-semibold tracking-wider font-mono text-brand-blue/90"
          >
            <Terminal className="w-3.5 h-3.5" /> RESQLINK PLATFORM V1.0
          </motion.div>

          {/* Large Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6"
          >
            AI Powered <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-blue via-brand-green to-brand-red bg-clip-text text-transparent">
              Emergency Rescue
            </span> <br />
            Ecosystem
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-brand-textSecondary max-w-lg mb-10 leading-relaxed"
          >
            Connecting Help When Networks Fail. A decentralized protocol engineered to route SOS payloads, sync rescue fleets, and deliver offline medical assistance.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 sm:flex items-center gap-4 w-full sm:w-auto"
          >
            <Button
              variant="emergency"
              onClick={() => handleScrollTo('ecosystem')}
              className="w-full sm:w-auto"
            >
              🚀 Explore Ecosystem
            </Button>
            <Button
              variant="outline"
              onClick={() => handleScrollTo('architecture')}
              className="w-full sm:w-auto"
            >
              📖 View Architecture
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleScrollTo('demo')}
              className="w-full sm:w-auto text-brand-blue"
            >
              🎬 Watch Demo
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleScrollTo('demo')}
              className="w-full sm:w-auto"
            >
              📱 Product Showcase
            </Button>
          </motion.div>
        </div>

        {/* Right Side: 3D-Like Smartphone Preview & Floating stats */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[500px]">
          {/* Drifting Coordinates / Stats Panel 1 */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 left-0 sm:-left-6 z-25 glass-panel rounded-2xl p-4 border border-brand-border/25 flex items-center gap-3 shadow-[0_10px_35px_rgba(0,0,0,0.5)] border-l-brand-blue border-l-2"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue glow-blue">
              <Navigation className="w-5 h-5 rotate-45" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-brand-textSecondary tracking-wider uppercase">GPS Tracking</span>
              <span className="text-xs font-bold text-white font-mono">{displayCoords}</span>
            </div>
          </motion.div>

          {/* Drifting Coordinates / Stats Panel 2 */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-8 right-0 sm:-right-6 z-25 glass-panel rounded-2xl p-4 border border-brand-border/25 flex items-center gap-3 shadow-[0_10px_35px_rgba(0,0,0,0.5)] border-l-brand-red border-l-2"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red glow-red">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-brand-textSecondary tracking-wider uppercase">Active Dispatch</span>
              <span className="text-xs font-bold text-white font-mono">{displayDispatch}</span>
            </div>
          </motion.div>

          {/* 3D Glass Device Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotate: 5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
            style={{ perspective: 1200 }}
          >
            {/* Phone Shadow Element */}
            <div className="absolute inset-0 bg-black/60 rounded-[48px] blur-3xl scale-95 translate-y-6" />

            {/* Rotating Phone Wrapper */}
            <div
              className="w-[280px] h-[580px] rounded-[48px] border-4 border-slate-700/80 bg-slate-900/90 relative overflow-hidden transition-all duration-300 ease-out"
              style={{
                transform: `rotateX(${deviceRotation.x}deg) rotateY(${deviceRotation.y}deg)`,
                transformStyle: 'preserve-3d',
                boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.08)',
              }}
            >
              {/* Gloss Glass Reflection Sheet overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30" />

              {/* Dynamic Island Screen notch */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-45 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ml-auto mr-4 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-900/60" />
                </div>
              </div>

              {/* Active Phone Screen content switcher */}
              <div className="w-full h-full pt-8 pb-3 px-3">
                <div className="w-full h-full bg-slate-950 rounded-[38px] overflow-hidden border border-brand-border/10 relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeScreenIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="w-full h-full"
                    >
                      {simulatedScreens[activeScreenIndex].content}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
