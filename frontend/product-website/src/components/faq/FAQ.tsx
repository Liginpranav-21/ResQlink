import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Satellite, Cpu, Radio, Award } from 'lucide-react';
import { Container } from '../ui/Container';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs: FAQItem[] = [
    {
      question: 'How does ResQLink operate when cell networks and internet backbones fail?',
      answer: 'ResQLink uses BlueBeacon BLE (Bluetooth Low Energy) mesh protocols. When traditional networks collapse, the mobile app broadcasts distress payloads containing GPS coordinates and triage logs to nearby devices, creating a decentralized relay network that reaches active rescue terminals.'
    },
    {
      question: 'Is Firebase critical to the live dispatch loop?',
      answer: 'Firebase Realtime Database handles live, sub-second coordinate tracking and status synchronization for active dispatches. However, if database connection is lost, ResQLink enters an offline mesh mode where critical logs and diagnostic guides remain locally accessible.'
    },
    {
      question: 'How does ResQAI assistant calculate emergency severity and triage levels?',
      answer: 'The ResQAI engine processes user-inputted symptoms and matches them against pre-defined diagnostic models (like heart attack chest pains or snake bite swellings) to categorize triage severity levels (Critical, Medical, Minor). It then outputs instant first aid instructions while dispatching details to hospitals.'
    },
    {
      question: 'Can neighborhood clinics and rescue teams synchronize with the Command Center?',
      answer: 'Yes. The Vite React Admin Dashboard maps open facilities, available beds, and active rescue fleets using Leaflet Maps. Hospital administrators and responders log into synced client templates to receive immediate dispatch orders and victim profiles.'
    }
  ];

  const futureScope = [
    {
      icon: <Satellite className="w-6 h-6 text-brand-blue" />,
      title: 'Satellite L-Band Link',
      desc: 'Integrating direct satellite messaging protocols to sync coordinate logs when completely out of BLE mesh range.'
    },
    {
      icon: <Radio className="w-6 h-6 text-brand-red animate-pulse" />,
      title: 'Decentralized Mesh Networks',
      desc: 'Developing local peer-to-peer Wi-Fi Direct and LoRa grid routers to expand emergency ranges to up to 5 kilometers.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-brand-green" />,
      title: 'Wearable IoT Integration',
      desc: 'Connecting smartwatches and heart rate monitors to automatically trigger SOS panic pings upon high-impact shock detection.'
    },
    {
      icon: <Award className="w-6 h-6 text-brand-yellow" />,
      title: 'Predictive Disaster AI',
      desc: 'Utilizing atmospheric and geological telemetry records to automatically warn rescue fleets of landslide or flood hazards.'
    }
  ];

  return (
    <section id="faq" className="py-24 lg:py-32 relative bg-brand-navy border-t border-brand-border/10">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand-blue/5 blur-[120px] rounded-full pointer-events-none" />

      <Container>
        {/* Future Scope Section first */}
        <div className="mb-28">
          <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
            <Badge variant="blue" className="mb-4">ROADMAP</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
              Future Platform Scope
            </h2>
            <p className="text-brand-textSecondary text-base sm:text-lg leading-relaxed">
              We are scaling ResQLink to leverage upcoming satellite communication protocols and edge compute models to establish a completely bulletproof network safety grid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {futureScope.map((scope, idx) => (
              <Card key={idx} className="p-6 border-b-2 border-b-transparent hover:border-b-brand-blue transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand-navy border border-brand-border/15 flex items-center justify-center mb-6">
                  {scope.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{scope.title}</h3>
                <p className="text-brand-textSecondary text-xs leading-relaxed">{scope.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
            <Badge variant="slate" className="mb-4">SUPPORT</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-brand-textSecondary text-base sm:text-lg leading-relaxed">
              Find technical answers about ResQLink network redundancies, database synchronization, and AI triage loops.
            </p>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="glass-panel rounded-2xl border border-brand-border/20 overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(idx)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-5 text-left flex justify-between items-center text-white hover:bg-brand-surface/40 transition-colors duration-250 cursor-pointer focus:outline-none"
                  >
                    <span className="font-bold text-sm sm:text-base pr-4 flex items-center gap-2">
                      <HelpCircle className="w-4.5 h-4.5 text-brand-blue flex-shrink-0" />
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-brand-textSecondary"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 pt-2 text-brand-textSecondary text-xs sm:text-sm leading-relaxed border-t border-brand-border/10 bg-brand-surface/20">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};
