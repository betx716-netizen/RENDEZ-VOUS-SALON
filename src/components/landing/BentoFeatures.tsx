import React from 'react';
import {
  Smartphone,
  Calendar,
  MessageCircle,
  Users,
  Coins,
  TrendingUp,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { BentoCard } from './BentoCard';

export const BentoFeatures: React.FC = () => {
  return (
    <section id="fonctions" className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* EN-TÊTE DE SECTION */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime border-2 border-ink text-ink text-xs font-bold -rotate-2 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tout ce dont votre salon a besoin</span>
          </div>
          <h2 className="text-4xl sm:text-6xl leading-[0.95] font-bold text-foreground font-display tracking-tight">
            Une organisation sans faille, du premier clic au paiement
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Conçu sur-mesure pour les réalités d'Abidjan : gestion WhatsApp, monnaie FCFA et planning d'équipe synchronisé.
          </p>
        </div>

        {/* GRILLE BENTO (6 CARTES AVEC PROJECTEUR, BORDURE DÉGRADÉE & INCLINAISON 3D) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* CARTE 1: GRANDE CARTE (7 COL) - Page de réservation en ligne */}
          <BentoCard className="md:col-span-7" delay={0.05}>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:rotate-12 duration-300">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                  Page de réservation en ligne
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
                  Vos clientes choisissent leur prestation, leur coiffeuse et leur heure exacte en toute liberté, jour et nuit, sans créer de compte.
                </p>
              </div>
            </div>

            {/* Micro-interface interactive en HTML/CSS pur */}
            <div className="mt-8 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-foreground">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-alt font-mono text-[11px] text-primary font-medium border-2 border-border">
                rdv-salon.ci/s/votre-salon
              </span>
              <span className="flex items-center gap-1 text-success font-semibold text-xs">
                <CheckCircle className="w-4 h-4" />
                Accessible sur smartphone en 3G/4G
              </span>
            </div>
          </BentoCard>

          {/* CARTE 2: GRANDE CARTE (5 COL) - Agenda d'équipe */}
          <BentoCard className="md:col-span-5" delay={0.15}>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/15 text-accent flex items-center justify-center transition-transform group-hover:rotate-12 duration-300">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                  Agenda d'équipe
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
                  Visualisez en un coup d'œil le planning de chacune de vos coiffeuses, évitez les chevauchements et calibrez les temps de pause.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex items-center gap-2 text-xs font-semibold text-foreground">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Planning synchronisé en direct sur tous vos appareils</span>
            </div>
          </BentoCard>

          {/* CARTE 3: CARTE MOYENNE (4 COL) - Rappels WhatsApp */}
          <BentoCard className="md:col-span-4" delay={0.25}>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center transition-transform group-hover:rotate-12 duration-300">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-foreground">
                  Rappels WhatsApp
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Réduisez drastiquement les retards et oublis grâce à un message pré-rempli envoyé directement au numéro ivoirien de la cliente.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-border text-[11px] font-mono text-success flex items-center gap-1.5">
              <span>+225 07 •••• •••• prêt</span>
            </div>
          </BentoCard>

          {/* CARTE 4: CARTE MOYENNE (4 COL) - Fichier clients et historique */}
          <BentoCard className="md:col-span-4" delay={0.35}>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 text-gold flex items-center justify-center transition-transform group-hover:rotate-12 duration-300">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-foreground">
                  Fichier clients & historique
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Conservez les coordonnées, l'historique des coiffures préférées et le volume de visites de chacune de vos clientes fidèles.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-border text-[11px] text-muted-foreground">
              Fiches clientes sauvegardées
            </div>
          </BentoCard>

          {/* CARTE 5: CARTE MOYENNE (4 COL) - Services et prix en FCFA */}
          <BentoCard className="md:col-span-4" delay={0.45}>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:rotate-12 duration-300">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-foreground">
                  Services & prix en FCFA
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Fixez votre catalogue avec durées précises et tarifs clairs en Francs CFA pour que vos clientes sachent exactement à quoi s'attendre.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-border text-[11px] text-primary font-mono font-semibold">
              Devise officielle : FCFA
            </div>
          </BentoCard>

          {/* CARTE 6: STATISTIQUES DU SALON (12 COL) */}
          <BentoCard className="md:col-span-12" delay={0.55}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-hard-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-foreground">
                    Statistiques & suivi du salon
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Suivez le volume de rendez-vous confirmés, les prestations les plus demandées et l'activité globale de votre établissement.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="px-5 py-2.5 rounded-full bg-foreground text-surface text-xs font-semibold shadow-hard-sm">
                  Tableau de bord gérant inclus
                </span>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
};
