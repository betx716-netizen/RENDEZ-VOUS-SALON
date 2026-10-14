import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll } from 'motion/react';
import { Sparkles, Share2, Calendar, TrendingUp, Scissors, CheckCircle, ArrowRight } from 'lucide-react';
import { usePerformanceTier } from '../../lib/tier';

const STEPS = [
  {
    id: 1,
    badge: 'Étape 1',
    title: 'Créez votre salon en 2 minutes',
    description: 'Ajoutez vos prestations (tresses, perruques, soins...), vos prix en FCFA et vos coiffeuses. Aucune compétence technique requise.',
    icon: Scissors,
    color: 'text-primary',
    screenData: {
      stepTitle: 'Configuration du salon',
      title: 'Salon Ébène & Or',
      subtitle: 'Riviera 3, Abidjan',
      badge: 'Prêt à publier',
      item1: 'Knotless Braids • 25 000 FCFA',
      item2: 'Perruque lace pose • 15 000 FCFA',
    },
  },
  {
    id: 2,
    badge: 'Étape 2',
    title: 'Partagez votre lien partout',
    description: 'Placez votre lien unique dans votre bio Instagram, sur votre statut WhatsApp et sur vos stories TikTok. Vos clientes cliquent et voient immédiatement vos disponibilités réelles.',
    icon: Share2,
    color: 'text-accent',
    screenData: {
      stepTitle: 'Lien de réservation',
      title: 'rdv-salon.ci/s/ebene-or',
      subtitle: 'Partagé sur Instagram & WhatsApp',
      badge: 'Lien en bio actif',
      item1: 'Vue directe des créneaux libres',
      item2: 'Pas besoin de créer un compte',
    },
  },
  {
    id: 3,
    badge: 'Étape 3',
    title: 'Recevez les réservations sans décrocher',
    description: 'Pendant que vous tressez ou coiffez, le planning se remplit tout seul 24h/24. Un rappel automatique WhatsApp est programmé pour éviter tout retard ou oubli.',
    icon: Calendar,
    color: 'text-success',
    screenData: {
      stepTitle: 'Notification instantanée',
      title: 'Aïcha a réservé pour 15h30',
      subtitle: 'Praticienne assignée : Sarah',
      badge: 'Rappel WhatsApp programmé',
      item1: 'Zéro double réservation',
      item2: 'Fiche client mise à jour',
    },
  },
  {
    id: 4,
    badge: 'Étape 4',
    title: "Voyez l'argent du mois en FCFA",
    description: 'Suivez le chiffre d’affaires réel, le nombre de clientes reçues et la performance de chaque membre de votre équipe sans calcul sur carnet papier.',
    icon: TrendingUp,
    color: 'text-gold',
    screenData: {
      stepTitle: 'Bilan du mois',
      title: '1 480 000 FCFA',
      subtitle: '+24% par rapport au mois dernier',
      badge: '58 rendez-vous terminés',
      item1: 'Revenus sécurisés',
      item2: 'Zéro trou dans l’agenda',
    },
  },
];

// 1. VERSION LITE : Cartes empilées directes sans sticky et SANS useScroll
const ScrollStorytellingLite: React.FC = () => {
  return (
    <section className="py-16 px-4 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-primary">Comment ça se passe</span>
        <h2 className="font-display text-3xl font-bold text-foreground">
          Le parcours en 4 étapes simples
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STEPS.map((step) => (
          <div key={step.id} className="p-6 rounded-[18px] bg-surface border-2 border-border shadow-hard-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center font-bold ${step.color}`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground">{step.badge}</span>
                <h3 className="font-display font-bold text-lg text-foreground">{step.title}</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// 2. VERSION ANIMÉE : Récit au scroll avec smartphone sticky
const ScrollStorytellingAnimated: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      if (latest < 0.25) setActiveStepIndex(0);
      else if (latest < 0.5) setActiveStepIndex(1);
      else if (latest < 0.75) setActiveStepIndex(2);
      else setActiveStepIndex(3);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const currentStep = STEPS[activeStepIndex];

  return (
    <section ref={sectionRef} className="relative py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Récit pas à pas</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl leading-[0.95] font-bold text-foreground tracking-tight">
            De la création au succès de votre salon
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Faites défiler pour voir concrètement comment RDV Salon transforme votre quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative">
          {/* Colonne gauche : Étapes textuelles qui défilent */}
          <div className="lg:col-span-6 space-y-28 py-12">
            {STEPS.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              return (
                <div
                  key={step.id}
                  className={`p-6 sm:p-8 rounded-[18px] transition-all duration-500 border ${
                    isActive
                      ? 'bg-surface border-primary/30 shadow-hard-lg scale-100'
                      : 'bg-surface/50 border-border opacity-50 scale-95'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                      {step.badge}
                    </span>
                    <div className={`p-2 rounded-full bg-surface-alt ${step.color}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Colonne droite : Smartphone collant (sticky) qui change d'écran */}
          <div className="hidden lg:block lg:col-span-6 sticky top-28 py-12">
            <div className="relative mx-auto max-w-[340px]">
              {/* Halo d'ambiance */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 bg-lime border-2 border-ink rounded-[44px] pointer-events-none" />

              {/* Châssis smartphone */}
              <div className="relative rounded-[40px] p-3 bg-dark-section border-[3px] border-border/50 shadow-hard-lg ring-1 ring-white/10">
                {/* Encoche */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black/70 rounded-full z-20 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                </div>

                {/* Écran qui commute en douceur */}
                <div className="relative overflow-hidden rounded-[18px] bg-surface text-foreground p-5 pt-9 border-2 border-border min-h-[460px] flex flex-col justify-between">
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {currentStep.screenData.stepTitle}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                        {currentStep.screenData.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display text-xl font-bold text-foreground">
                        {currentStep.screenData.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {currentStep.screenData.subtitle}
                      </p>
                    </div>

                    <div className="p-4 rounded-[20px] bg-surface-alt border-2 border-border space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <CheckCircle className="w-4 h-4 text-success shrink-0" />
                        <span>{currentStep.screenData.item1}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <CheckCircle className="w-4 h-4 text-success shrink-0" />
                        <span>{currentStep.screenData.item2}</span>
                      </div>
                    </div>

                    {/* Simulation d'interaction visuelle */}
                    <div className="pt-2">
                      <div className="p-3 rounded-[16px] bg-primary/5 border border-primary/20 text-center">
                        <p className="text-[11px] text-foreground font-semibold">
                          Étape active : {currentStep.badge}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Automatisation 100% adaptée à Abidjan
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progression</span>
                    <span className="font-bold text-primary tabular-nums">{activeStepIndex + 1} / 4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ScrollStorytelling: React.FC = () => {
  const tier = usePerformanceTier();
  if (tier === 'lite') {
    return <ScrollStorytellingLite />;
  }
  return <ScrollStorytellingAnimated />;
};
