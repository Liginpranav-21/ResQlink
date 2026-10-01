import React from 'react';
import { Container } from '../ui/Container';

export const TrustedBy: React.FC = () => {
  const brands = [
    { name: 'Emergency Services', logo: '🚨 EMS Network' },
    { name: 'Healthcare Providers', logo: '🏥 Health Allied' },
    { name: 'Technology', logo: '⚡ Intellect AI' },
    { name: 'Innovation Lab', logo: '🧬 Node System' },
    { name: 'AI Research', logo: '🧠 OpenAI Demo' },
    { name: 'Academic Research', logo: '🎓 FYP ResQ' }
  ];

  return (
    <section className="py-12 border-y border-brand-border/10 bg-brand-surface/40 select-none relative z-10">
      <Container>
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-brand-textSecondary/50 uppercase mb-8 font-mono">
          Engineered for Trust & Compliance With
        </p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-items-center">
          {brands.map((brand, idx) => (
            <div
              key={idx}
              className="text-brand-textSecondary/40 text-sm font-semibold tracking-wider font-mono hover:text-brand-blue/60 transition-colors duration-300 flex items-center justify-center gap-1.5"
            >
              {brand.logo}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
