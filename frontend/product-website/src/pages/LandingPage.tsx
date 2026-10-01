import { useState, useEffect } from 'react';
import { Preloader } from '../components/layout/Preloader';
import { Navbar } from '../components/layout/Navbar';
import { Hero } from '../components/hero/Hero';
import { TrustedBy } from '../components/features/TrustedBy';
import { ProblemStatement } from '../components/features/ProblemStatement';
import { FeaturesGrid } from '../components/features/FeaturesGrid';
import { EmergencyJourney } from '../components/simulation/EmergencyJourney';
import { LiveDemo } from '../components/showcase/LiveDemo';
import { Architecture } from '../components/architecture/Architecture';
import { TechStack } from '../components/tech/TechStack';
import { FAQ } from '../components/faq/FAQ';
import { Footer } from '../components/layout/Footer';
import { useAuthStore } from '@resqlink/admin-dashboard/store/authStore';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  // Reads the same store useAuth() (subscribed once, at the top-level App)
  // populates — not a separate onAuthStateChanged listener. This also means
  // the navbar's login state is staff-gated the same way the dashboard is:
  // a mobile-app citizen session won't show as "logged in" here, since
  // useAuth() signs non-staff profiles back out (see admin-dashboard's
  // hooks/useAuth.ts) — the web login is dashboard-staff only.
  const { user: currentUser } = useAuthStore();

  // Track scroll position to update active navbar links
  useEffect(() => {
    if (isLoading) return;

    const handleScroll = () => {
      const sections = ['hero', 'ecosystem', 'timeline', 'demo', 'architecture', 'tech', 'faq'];
      const scrollPos = window.scrollY + 200; // Offset for better highlight sync

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  if (isLoading) {
    return <Preloader onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="bg-brand-navy min-h-screen relative overflow-x-hidden text-brand-textPrimary font-sans">
      {/* Floating Header Navbar */}
      <Navbar currentUser={currentUser} activeSection={activeSection} />

      {/* Page Sections */}
      <main>
        {/* Cinematic Hero Network Simulation */}
        <Hero />

        {/* Brand partners */}
        <TrustedBy />

        {/* Problem Statement grid cards */}
        <ProblemStatement />

        {/* 11-card Features Grid */}
        <FeaturesGrid />

        {/* Journey of an Emergency Timeline simulator */}
        <EmergencyJourney />

        {/* Combined Live Demo Switcher (Mobile simulator + Dashboard Simulator + Watch Video) */}
        <LiveDemo />

        {/* SVG Node System Architecture flowchart */}
        <Architecture />

        {/* Stack grid & dynamic count gauges */}
        <TechStack />

        {/* Roadmap milestones & FAQs accordion */}
        <FAQ />
      </main>

      {/* Footer credits and social hubs */}
      <Footer />
    </div>
  );
}
