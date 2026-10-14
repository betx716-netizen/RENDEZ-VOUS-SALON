import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { MagneticButton } from '../motion/MagneticButton';

export const FinalCta: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-24 px-4 sm:px-6 bg-primary text-white border-y-2 border-ink relative overflow-hidden">
      {/* Formes décoratives */}
      <div aria-hidden="true" className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-candy border-2 border-ink" />
      <div aria-hidden="true" className="absolute -bottom-10 right-[8%] w-32 h-32 rounded-[22px] bg-lime border-2 border-ink rotate-12" />
      <div aria-hidden="true" className="absolute top-12 right-[14%] w-12 h-12 rounded-full bg-sun border-2 border-ink hidden sm:block" />

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block"
        >
          <Logo variant="icon" size="xl" />
        </motion.div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-7xl font-bold font-display text-white leading-[0.95]">
            Votre agenda mérite mieux qu'un <span className="marker text-ink rounded-[8px] inline-block -rotate-2">cahier.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed">
            Rejoignez dès aujourd'hui les propriétaires de salons et instituts à Abidjan qui libèrent leur temps et professionnalisent leur accueil.
          </p>
        </div>

        {/* BOUTON PRINCIPAL MAGNÉTIQUE */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <MagneticButton className="w-full sm:w-auto">
            <Link
              to="/inscription"
              className="press w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-9 rounded-full bg-lime text-ink border-2 border-ink font-bold text-lg shadow-hard-md min-h-[56px] cursor-pointer"
            >
              <span>Créer mon salon gratuitement</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </MagneticButton>
        </div>

        {/* Puces de réassurance */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-white/90">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-lime" />
            <span>Gratuit pendant le lancement</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-lime" />
            <span>Sans engagement ni carte bancaire</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-lime" />
            <span>Prêt en 2 minutes</span>
          </span>
        </div>
      </div>
    </section>
  );
};
