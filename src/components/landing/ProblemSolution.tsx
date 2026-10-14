import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { XCircle, CheckCircle2, PhoneOff, CalendarX, AlertTriangle, UserX, Sparkles, Smartphone, Calendar, MessageCircle, Clock } from 'lucide-react';

export const ProblemSolution: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const avantItems = [
    { icon: CalendarX, text: 'Cahier papier raturé, illisible et facile à égarer' },
    { icon: PhoneOff, text: 'Appels manqués pendant que vous coiffez une cliente' },
    { icon: AlertTriangle, text: 'Doubles réservations catastrophiques les samedis' },
    { icon: UserX, text: 'Clientes qui oublient leur rendez-vous sans prévenir' },
  ];

  const apresItems = [
    { icon: Smartphone, text: 'Lien de réservation en ligne disponible 24h/24 en 30s' },
    { icon: Calendar, text: 'Agenda clair synchronisé en direct sur votre téléphone' },
    { icon: Clock, text: 'Créneaux verrouillés : zéro double réservation possible' },
    { icon: MessageCircle, text: 'Rappels WhatsApp en 1 clic pour diviser les retards par 4' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 bg-surface-alt/60">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* EN-TÊTE */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime border-2 border-ink text-ink text-xs font-bold -rotate-2 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>La fin des prises de tête</span>
          </div>
          <h2 className="text-4xl sm:text-6xl leading-[0.95] font-bold font-display text-foreground tracking-tight">
            Pourquoi abandonner le cahier papier ?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Passez du stress des appels téléphoniques incessants à la sérénité d'un salon connecté et organisé.
          </p>
        </div>

        {/* 2 CARTES CONTRASTÉES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* CARTE AVANT */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-[18px] p-7 sm:p-9 bg-surface border-2 border-ink border-dashed space-y-6 flex flex-col justify-between rotate-1"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-candy border-2 border-ink text-ink flex items-center justify-center font-bold">
                  <XCircle className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-destructive">
                    La routine épuisante
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                    Avant RDV Salon
                  </h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Perte de temps, clientes déçues et interruption permanente pendant les prestations.
              </p>

              <ul className="space-y-3.5 pt-2">
                {avantItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-foreground line-through decoration-candy decoration-2">
                    <div className="w-6 h-6 rounded-full bg-candy border-2 border-ink text-ink flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t-2 border-dashed border-ink text-sm font-bold text-destructive">
              Résultat : stress quotidien et chiffre d'affaires perdu.
            </div>
          </motion.div>

          {/* CARTE APRÈS */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-[18px] p-7 sm:p-9 bg-lime border-2 border-ink shadow-hard-xl space-y-6 flex flex-col justify-between relative overflow-hidden -rotate-1"
          >
            {/* Autocollant */}
            <div className="absolute top-3 right-3 bg-ink text-lime text-[11px] font-bold px-3 py-1 rounded-full rotate-3">
              Recommandé à Abidjan
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-surface border-2 border-ink text-ink flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink">
                    La nouvelle méthode
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                    Avec RDV Salon
                  </h3>
                </div>
              </div>

              <p className="text-sm text-ink/75">
                Vos clientes s'auto-enregistrent, l'équipe sait quoi faire et vous vous concentrez sur la coiffure.
              </p>

              <ul className="space-y-3.5 pt-2">
                {apresItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-ink">
                    <div className="w-6 h-6 rounded-full bg-surface border-2 border-ink text-ink flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t-2 border-ink text-sm font-bold text-ink flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Votre salon tourne en pilote automatique 24h/24.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
