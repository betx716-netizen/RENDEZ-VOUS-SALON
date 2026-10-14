import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MagneticButton } from '../motion/MagneticButton';

export const PricingSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const includedFeatures = [
    'Page de réservation en ligne personnalisée (URL exclusive)',
    'Réservations clientes illimitées 24h/24',
    'Rappels WhatsApp en 1 clic vers les numéros ivoiriens',
    'Agenda d’équipe multi-coiffeuses & gestion des pauses',
    'Catalogue complet des prestations avec tarifs en FCFA',
    'Fichier clients avec historique des rendez-vous',
    'QR code à imprimer pour la vitrine ou le comptoir',
    'Zéro commission prélevée sur vos prestations',
    'Assistance et accompagnement dédié à Abidjan',
  ];

  return (
    <section id="tarifs" className="py-24 px-4 sm:px-6 bg-surface-alt/70 border-y border-border">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* EN-TÊTE */}
        <div className="text-center space-y-3">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-ink bg-candy border-2 border-ink rounded-full px-3 py-1 -rotate-2">
            Tarification transparente
          </span>
          <h2 className="text-4xl sm:text-6xl leading-[0.95] font-bold font-display text-foreground tracking-tight">
            Tarifs simples, sans mauvaise surprise
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Nous accompagnons la digitalisation des salons ivoiriens avec une offre claire et sans engagement.
          </p>
        </div>

        {/* CARTE UNIQUE DE LANCEMENT */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="bg-surface rounded-[18px] p-8 sm:p-12 border-2 border-primary/40 shadow-hard-lg relative overflow-hidden"
        >
          {/* Badge haut */}
          <div className="absolute top-0 right-0 bg-primary text-white font-semibold text-xs px-5 py-1.5 rounded-bl-[18px] flex items-center gap-1.5 shadow-hard-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Offre Spéciale Côte d'Ivoire</span>
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                Lancement exclusif
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
                Gratuit pendant le lancement
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Profitez de toutes les fonctionnalités premium sans carte bancaire, sans engagement et sans frais cachés.
              </p>
            </div>

            <div className="flex items-baseline gap-2 py-4 border-y border-border">
              <span className="text-4xl sm:text-5xl font-bold font-display text-foreground">
                0 FCFA
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                / pour toujours sur votre compte de lancement
              </span>
            </div>

            {/* LISTE DE CE QUI EST INCLUS */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Ce qui est inclus dès aujourd'hui :
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {includedFeatures.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                    <div className="w-5 h-5 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* BOUTON D'ACTION MAGNÉTIQUE */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <MagneticButton className="w-full sm:w-auto">
                <Link
                  to="/inscription"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full press bg-primary text-white border-2 border-ink font-semibold text-sm sm:text-base shadow-hard-md transition-colors min-h-[48px] cursor-pointer"
                >
                  <span>Créer mon salon gratuitement</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Aucune coordonnée bancaire demandée</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
