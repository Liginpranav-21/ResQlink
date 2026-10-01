import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { authService, type AuthUser } from '@resqlink/shared';

interface NavbarProps {
  currentUser: AuthUser | null;
  activeSection: string;
}

const MOBILE_URL = import.meta.env.VITE_MOBILE_URL || '/mobile';

export const Navbar: React.FC<NavbarProps> = ({ currentUser, activeSection }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Ecosystem', href: '#ecosystem' },
    { label: 'Timeline', href: '#timeline' },
    { label: 'Live Demo', href: '#demo' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Tech Stack', href: '#tech' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 lg:px-12`}
      >
        <div
          className={`mx-auto max-w-[1440px] rounded-2xl border transition-all duration-500 ${
            isScrolled
              ? 'glass-panel py-3 px-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border-brand-border/20 backdrop-blur-md'
              : 'border-transparent bg-transparent py-4 px-2'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo brand */}
            <a href="#hero" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center glow-red group-hover:scale-105 transition-transform duration-300">
                <ShieldAlert className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                RESQ<span className="text-brand-red">LINK</span>
              </span>
            </a>

            {/* Desktop Navigation links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.slice(1);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-xl hover:text-white ${
                      isActive ? 'text-white bg-brand-border/10' : 'text-brand-textSecondary'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-1 left-4 right-4 h-0.5 bg-brand-red rounded-full shadow-[0_0_8px_rgba(255,59,48,0.5)]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Right side CTA */}
            <div className="hidden md:flex items-center gap-4">
              {currentUser ? (
                <>
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-sm font-semibold text-brand-blue hover:text-brand-blue/90 flex items-center gap-1 transition-colors duration-300 cursor-pointer bg-transparent border-none"
                  >
                    Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await authService.logout();
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/admin/login')}
                    className="text-sm font-semibold text-brand-blue hover:text-brand-blue/90 flex items-center gap-1 transition-colors duration-300 cursor-pointer bg-transparent border-none"
                  >
                    Login <ArrowRight className="w-4 h-4" />
                  </button>
                  <Button
                    variant="emergency"
                    size="sm"
                    onClick={() => {
                      window.open(MOBILE_URL, '_blank');
                    }}
                  >
                    Launch App
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu Toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 rounded-xl glass-panel border border-brand-border/20 flex items-center justify-center text-brand-textPrimary cursor-pointer focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 top-[76px] z-40 bg-brand-navy/95 backdrop-blur-xl md:hidden px-6 pt-6 pb-20 flex flex-col justify-between border-t border-brand-border/10"
          >
            <div className="flex flex-col gap-3">
              {navItems.map((item, idx) => (
                <motion.a
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-2xl glass-card border-brand-border/5 text-lg font-medium text-brand-textPrimary hover:bg-brand-border/15"
                >
                  {item.label}
                </motion.a>
              ))}
              {currentUser ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full text-left px-4 py-3 rounded-2xl glass-card border-brand-border/5 text-lg font-medium text-brand-blue hover:bg-brand-border/15 cursor-pointer bg-transparent"
                  >
                    Admin Dashboard
                  </button>
                  <a
                    href="#"
                    onClick={async (e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      await authService.logout();
                    }}
                    className="px-4 py-3 rounded-2xl glass-card border-brand-border/5 text-lg font-medium text-brand-red hover:bg-brand-border/15"
                  >
                    Logout
                  </a>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/admin/login');
                    }}
                    className="w-full text-left px-4 py-3 rounded-2xl glass-card border-brand-border/5 text-lg font-medium text-brand-blue hover:bg-brand-border/15 cursor-pointer bg-transparent"
                  >
                    Login
                  </button>
                </>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-4"
            >
              <Button
                variant="emergency"
                size="lg"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.open(MOBILE_URL, '_blank');
                }}
              >
                Launch App
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
