import React from 'react';
import { ShieldAlert, Github, Twitter, Linkedin, ArrowUp } from 'lucide-react';
import { Container } from '../ui/Container';

export const Footer: React.FC = () => {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-brand-border/10 bg-brand-surface py-16 lg:py-24 overflow-hidden">
      {/* Decorative Blur Accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 mb-16">
          {/* Logo & description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center glow-red">
                <ShieldAlert className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                RESQ<span className="text-brand-red">LINK</span>
              </span>
            </div>
            <p className="text-brand-textSecondary text-sm max-w-sm leading-relaxed mb-6">
              An AI-powered emergency rescue ecosystem designed to establish critical coordinate logs, mesh networks, and dispatch channels when traditional networks collapse.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-xl glass-panel border border-brand-border/20 flex items-center justify-center text-brand-textSecondary hover:text-white hover:border-brand-blue/30 transition-all duration-300">
                <Github className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl glass-panel border border-brand-border/20 flex items-center justify-center text-brand-textSecondary hover:text-white hover:border-brand-blue/30 transition-all duration-300">
                <Twitter className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl glass-panel border border-brand-border/20 flex items-center justify-center text-brand-textSecondary hover:text-white hover:border-brand-blue/30 transition-all duration-300">
                <Linkedin className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Ecosystem info */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6 font-mono">
              Ecosystem
            </h4>
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li>
                <a href="#ecosystem" className="text-brand-textSecondary hover:text-white transition-colors duration-250">
                  Feature Grid
                </a>
              </li>
              <li>
                <a href="#timeline" className="text-brand-textSecondary hover:text-white transition-colors duration-250">
                  SOS Journey
                </a>
              </li>
              <li>
                <a href="#demo" className="text-brand-textSecondary hover:text-white transition-colors duration-250">
                  Live Preview
                </a>
              </li>
              <li>
                <a href="#architecture" className="text-brand-textSecondary hover:text-white transition-colors duration-250">
                  Node Engine
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Dev docs / contact */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6 font-mono">
              Project Hub
            </h4>
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li>
                <a href="#tech" className="text-brand-textSecondary hover:text-white transition-colors duration-250">
                  Technology Stack
                </a>
              </li>
              <li>
                <a href="#faq" className="text-brand-textSecondary hover:text-white transition-colors duration-250">
                  FAQ
                </a>
              </li>
              <li>
                <a href="mailto:info@resqlink.io" className="text-brand-textSecondary hover:text-white transition-colors duration-250">
                  Contact Developer
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-textSecondary hover:text-white transition-colors duration-250">
                  Documentation API
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Base */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-brand-border/10">
          <p className="text-xs text-brand-textSecondary/60 text-center sm:text-left mb-4 sm:mb-0 font-mono">
            &copy; {new Date().getFullYear()} RESQLINK. DESIGNED FOR PORTFOLIO AND ACADEMIC SHOWCASE.
          </p>
          <button
            onClick={handleScrollTop}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel border border-brand-border/20 text-xs font-semibold text-brand-textSecondary hover:text-white hover:border-brand-blue/30 transition-all duration-300 cursor-pointer"
          >
            Scroll to Top <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </Container>
    </footer>
  );
};
