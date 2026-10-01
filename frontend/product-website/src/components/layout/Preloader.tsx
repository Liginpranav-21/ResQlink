import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ShieldAlert, Cpu, Wifi } from 'lucide-react';

interface PreloaderProps {
  onComplete: () => void;
}

const steps = [
  { text: 'Booting ResQLink core intelligence...', icon: Cpu },
  { text: 'Mapping offline Bluetooth mesh beacons...', icon: Wifi },
  { text: 'Syncing emergency dispatch routers...', icon: ShieldAlert },
  { text: 'Establishing secure hospital gateway layers...', icon: Activity },
];

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Increment progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.25;
      });
    }, 25);

    // Swap description text steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 800); // Allow fadeout animation to complete
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  const StepIcon = steps[currentStep].icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(20px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 bg-brand-navy z-[99999] flex flex-col items-center justify-center select-none"
        >
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0%,transparent_65%)]" />
          
          <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center">
            {/* Pulsating Logo Mark */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mb-8 relative"
            >
              <div className="w-16 h-16 rounded-3xl bg-brand-red flex items-center justify-center glow-red relative overflow-hidden">
                {/* Visual pulse line */}
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-3xl bg-brand-red border border-white/20"
                />
                <ShieldAlert className="w-8 h-8 text-white relative z-10 animate-pulse" />
              </div>
            </motion.div>

            {/* Brand Title */}
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 text-center">
              RESQ<span className="text-brand-red">LINK</span>
            </h1>
            <p className="text-xs font-mono text-brand-blue tracking-[0.2em] uppercase mb-12 text-center">
              Emergency Network Core
            </p>

            {/* Progress Bar Container */}
            <div className="w-full h-1 bg-brand-surface rounded-full overflow-hidden mb-6 relative border border-brand-border/10">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-blue to-brand-red"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Status logs */}
            <div className="h-6 flex items-center justify-center gap-2.5">
              <StepIcon className="w-4 h-4 text-brand-blue animate-pulse" />
              <motion.span
                key={currentStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                className="text-xs font-mono text-brand-textSecondary text-center"
              >
                {steps[currentStep].text}
              </motion.span>
            </div>
            
            <div className="mt-4 text-[10px] font-mono text-brand-blue/60">
              {Math.round(progress)}% CONNECTED
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
