import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'motion/react';
import { Store, Share2, CalendarCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorks: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
  });

  const steps = [
    {
      number: '1',
      title: 'Créez votre salon (2 minutes)',
      description: 'Entrez le nom de votre salon, vos prestations phares avec leurs prix en FCFA et les membres de votre équipe.',
      icon: Store,
      badge: 'Configuration simple',
    },
    {
      number: '2',
      title: 'Partagez votre lien de réservation',
      description: 'Placez votre lien dans votre biographie Instagram, sur votre statut WhatsApp et sur le QR code posé à l’accueil.',
      icon: Share2,
      badge: 'Diffusion instantanée',
    },
    {
      number: '3',
      title: 'Recevez vos rendez-vous et gérez tout depuis l’agenda',
      description: 'Les créneaux se bloquent sans double réservation. Vous confirmez et prévenez les clientes sur WhatsApp en 1 clic.',
      icon: CalendarCheck,
      badge: 'Gain de temps immédiat',
    },
  ];

  return (
    <section id="comment-ca-marche" className="py-24 px-4 sm:px-6 bg-surface-alt/70 border-y border-border" ref={containerRef}>
      <div className="max-w-7xl mx-auto space-y-16">
        {/* EN-TÊTE */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-ink bg-candy border-2 border-ink rounded-full px-3 py-1 -rotate-2">
            Mise en route express
          </span>
          <h2 className="text-4xl sm:text-6xl leading-[0.95] font-bold font-display text-foreground tracking-tight">
            Comment ça marche ?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Trois étapes limpides pour passer d’un cahier papier à une gestion numérique professionnelle.
          </p>
        </div>

        {/* CONTENEUR AVEC LIGNE QUI SE DESSINE AU SCROLL */}
        <div className="relative">
          {/* Ligne de connexion sur desktop */}
          {!shouldReduceMotion && (
            <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-1 bg-border rounded-full z-0 overflow-hidden">
              <motion.div
                style={{ scaleX }}
                className="h-full w-full bg-primary origin-left"
              />
            </div>
          )}

          {/* LES 3 ÉTAPES NUMÉROTÉES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.15,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                  className="bg-surface rounded-[18px] p-8 border-2 border-border shadow-hard-sm hover:shadow-hard-lg transition-all duration-300 relative flex flex-col justify-between"
                >
                  {/* Numéro et icône */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="w-12 h-12 rounded-full bg-primary text-white font-display font-bold text-xl flex items-center justify-center shadow-hard-md">
                        {step.number}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <span className="inline-block text-[11px] font-semibold text-accent uppercase tracking-wider mb-2">
                      {step.badge}
                    </span>
                    <h3 className="text-xl font-bold font-display text-foreground leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border flex items-center gap-2 text-xs font-semibold text-primary">
                    <span>Étape {step.number} sur 3</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA RAPIDE */}
        <div className="text-center pt-2">
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full press bg-primary text-white border-2 border-ink font-semibold text-sm shadow-hard-md transition-colors min-h-[48px] cursor-pointer"
          >
            <span>Créer mon salon maintenant</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
