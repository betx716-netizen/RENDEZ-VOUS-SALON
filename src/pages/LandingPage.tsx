import React, { Suspense } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  ScrollProgress,
  WordReveal,
  FadeUp,
  Marquee,
  FloatingShapes,
  HeroPrimaryButton,
  Hero3DPhone,
  CustomCursor,
} from '../components/motion';
import {
  Navbar,
  ProblemSolution,
  BentoFeatures,
  HowItWorks,
  ShareEverywhere,
  PricingSection,
  FaqSection,
  FinalCta,
  Footer,
  WhatsAppFloatingButton,
  Testimonials,
  IntroCurtain,
  ScrollStorytelling,
  BeforeAfterSlider,
} from '../components/landing';
import { usePerformanceTier } from '../lib/tier';

// Chargement dynamique de Three.js uniquement sur le palier immersive
const Three3DCanvasLazy = React.lazy(() =>
  import('../components/motion/Three3DCanvas').then((m) => ({ default: m.Three3DCanvas }))
);

export const LandingPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const tier = usePerformanceTier();

  return (
    <div className="relative min-h-[100dvh] bg-dots text-foreground font-sans overflow-x-hidden max-w-full">
      {/* 0. ÉCRAN D'OUVERTURE CINÉMATIQUE (1.2s max, mémorisé, standard+) */}
      <IntroCurtain />

      {/* CURSEUR PERSONNALISÉ AVEC MOT CONTEXTUEL (Palier immersive uniquement) */}
      <CustomCursor />

      {/* BARRE DE PROGRESSION DU SCROLL FINE EN HAUT */}
      <ScrollProgress />

      {/* FOND AURORA VIVANT + GRAIN SUBTIL */}
      <FloatingShapes />

      {/* a. EN-TÊTE COLLANT EN VERRE DÉPOLI */}
      <Navbar />

      <main>
        {/* b. HERO SECTION CINÉMATIQUE AVEC PERSPECTIVE 3D & PARALLAXE */}
        <section className="relative z-10 pt-12 pb-16 md:pt-20 md:pb-28 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* COLONNE GAUCHE : TEXTE & ACTIONS */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
                {/* Petit badge supérieur */}
                <FadeUp direction="down" delay={0.05}>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-candy border-2 border-ink text-ink text-xs sm:text-sm font-bold shadow-hard-sm -rotate-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Salons de coiffure & instituts de beauté en Côte d'Ivoire</span>
                  </div>
                </FadeUp>

                {/* H1 : Révélation mot par mot, clamp(3.2rem, 12vw, 8rem) */}
                <h1 className="text-[clamp(3rem,8vw,6rem)] font-bold font-display text-foreground leading-[1]">
                  <WordReveal
                    text="Remplissez votre salon, sans décrocher le téléphone."
                    highlightWords={['sans', 'décrocher']}
                    delayOffset={0.1}
                    className="justify-center lg:justify-start"
                  />
                </h1>

                {/* Sous-titre */}
                <FadeUp direction="up" delay={0.4} className="max-w-2xl mx-auto lg:mx-0">
                  <p className="text-lg sm:text-xl text-ink/80 leading-relaxed">
                    Vos clientes réservent en 30 secondes depuis leur téléphone. Vous gérez l'agenda, l'équipe et les rappels WhatsApp au même endroit, en FCFA.
                  </p>
                </FadeUp>

                {/* Boutons d'action */}
                <FadeUp direction="up" delay={0.55}>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    {/* Bouton principal : Créer mon salon gratuitement */}
                    <HeroPrimaryButton to="/inscription">
                      <span>Créer mon salon gratuitement</span>
                      <ArrowRight className="w-4 h-4" />
                    </HeroPrimaryButton>

                    {/* Bouton secondaire : Voir le récit pas à pas */}
                    <a
                      href="#recit"
                      className="press w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-surface text-ink font-bold text-base border-2 border-ink min-h-[56px] shadow-hard-md cursor-pointer"
                    >
                      <span>Voir comment ça marche</span>
                    </a>
                  </div>
                </FadeUp>

                {/* 3 petites puces sous les boutons */}
                <FadeUp direction="up" delay={0.7}>
                  <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-bold text-ink">
                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface border-2 border-ink rotate-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Réservation 24h/24</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-lime border-2 border-ink -rotate-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Rappels WhatsApp</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sun border-2 border-ink rotate-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zéro double réservation</span>
                    </span>
                  </div>
                </FadeUp>
              </div>

              {/* COLONNE DROITE : TÉLÉPHONE 3D PERSPECTIVE (±6°) AVEC 3 CARTES EN PARALLAXE */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                {/* Effet 3D Three.js en arrière-plan (chargé uniquement sur écran immersive) */}
                {tier === 'immersive' && (
                  <div className="absolute -inset-10 z-0 pointer-events-none opacity-40">
                    <Suspense fallback={null}>
                      <Three3DCanvasLazy />
                    </Suspense>
                  </div>
                )}

                <div className="relative z-10 w-full">
                  <Hero3DPhone />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* c. BANDEAU DÉFILANT DES PRESTATIONS */}
        <section className="relative z-10 my-4 sm:my-8" aria-label="Prestations proposées">
          <Marquee
            items={[
              'Coiffure',
              'Tresses Knotless',
              'Perruques & Tissage',
              'Manucure & Pédicure',
              'Maquillage Soirée',
              'Soins du visage',
              'Barbier',
            ]}
          />
        </section>

        {/* d. RÉCIT AU SCROLL (SCROLL STORYTELLING : Téléphone sticky qui avance au défilement) */}
        <div id="recit">
          <ScrollStorytelling />
        </div>

        {/* e. PROBLÈME → SOLUTION */}
        <ProblemSolution />

        {/* f. FONCTIONS EN GRILLE BENTO (Bordures dégradées + Spotlight + 3D Tilt) */}
        <BentoFeatures />

        {/* g. SECTION AVANT / APRÈS INTERACTIVE (Curseur glissant souris, doigt & touches clavier) */}
        <BeforeAfterSlider />

        {/* h. COMMENT ÇA MARCHE */}
        <HowItWorks />

        {/* i. VOTRE LIEN PARTOUT */}
        <ShareEverywhere />

        {/* j. OFFRE DE LANCEMENT (Carte unique avec bouton magnétique et reflet) */}
        <PricingSection />

        {/* k. FAQ EN ACCORDÉON */}
        <FaqSection />

        {/* l. APPEL À L'ACTION FINAL (SECTION SOMBRE UNIQUE) */}
        <FinalCta />

        {/* Témoignages réels prêts */}
        <Testimonials />
      </main>

      {/* PIED DE PAGE */}
      <Footer />

      {/* BOUTON FLOTTANT WHATSAPP */}
      <WhatsAppFloatingButton />
    </div>
  );
};
