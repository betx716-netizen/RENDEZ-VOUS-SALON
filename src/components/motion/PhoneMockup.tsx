import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CheckCircle2, Clock, Calendar, MessageCircle, Scissors } from 'lucide-react';

export const PhoneMockup: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  // State step: 0 = choosing slot, 1 = slot selected, 2 = confirmed
  const [step, setStep] = useState<number>(shouldReduceMotion ? 2 : 0);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 2400);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  return (
    <div className="relative mx-auto w-full max-w-[310px] sm:max-w-[330px]">
      {/* Halo d'ambiance Soft UI derrière le smartphone */}
      <div className="absolute inset-0 translate-x-4 translate-y-4 bg-candy border-2 border-ink rounded-[44px] pointer-events-none" />

      {/* Châssis smartphone en HTML/CSS pur */}
      <div className="relative rounded-[38px] p-3 bg-dark-section border-[3px] border-border/40 shadow-hard-lg ring-1 ring-white/10">
        {/* Dynamic Island / Encoche */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/60 rounded-full z-20 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
        </div>

        {/* Écran */}
        <div className="relative overflow-hidden rounded-[18px] bg-surface text-foreground p-4 pt-7 border-2 border-border min-h-[460px] flex flex-col justify-between">
          {/* Header Salon */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white shadow-hard-sm">
                  <Scissors className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground font-display leading-tight">Ébène & Or</h4>
                  <p className="text-[10px] text-primary font-medium">Riviera 3 • Abidjan</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold border border-success/20">
                Ouvert
              </span>
            </div>

            {/* Service choisi */}
            <div className="mt-3 p-2.5 rounded-[18px] bg-surface-alt border-2 border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Knotless Braids VIP</span>
                <span className="font-bold text-primary tabular-nums">25 000 F</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3 text-primary" />
                <span>2h30 • Sarah K.</span>
              </div>
            </div>

            {/* Date du jour */}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Aujourd'hui, 15:00</span>
            </div>

            {/* Grille des créneaux */}
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {[
                { time: '10:00', available: true },
                { time: '11:30', available: false },
                { time: '14:00', available: true, target: true },
                { time: '16:30', available: true },
              ].map((slot) => {
                const isSelected = slot.target && step >= 1;
                return (
                  <motion.div
                    key={slot.time}
                    animate={
                      isSelected
                        ? { scale: [1, 1.05, 1] }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                    className={`p-2 rounded-[14px] text-center text-xs tabular-nums font-semibold transition-all duration-300 min-h-[38px] flex items-center justify-center ${
                      !slot.available
                        ? 'bg-surface-alt text-muted-foreground/50 line-through'
                        : isSelected
                        ? 'bg-primary text-white shadow-hard-sm ring-2 ring-accent'
                        : 'bg-surface text-foreground border-2 border-border'
                    }`}
                  >
                    {slot.time}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Zone du bas animée : Bouton vs Confirmation */}
          <div className="mt-3 pt-2">
            <AnimatePresence mode="wait">
              {step < 2 ? (
                <motion.div
                  key="action"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-2"
                >
                  <motion.div
                    animate={step === 1 ? { scale: [1, 0.96, 1] } : {}}
                    className={`w-full py-2.5 rounded-full font-bold text-xs text-center transition-colors shadow-hard-sm ${
                      step === 1
                        ? 'bg-accent text-white'
                        : 'bg-primary text-white'
                    }`}
                  >
                    {step === 1 ? 'Confirmation...' : 'Choisir 14:00'}
                  </motion.div>
                  <p className="text-[10px] text-center text-muted-foreground">
                    Sans acompte • Annulation libre
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="p-3.5 rounded-[20px] bg-success/10 border border-success/30 text-center space-y-2 shadow-hard-sm"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                    className="w-9 h-9 rounded-full bg-success text-white flex items-center justify-center mx-auto shadow-hard-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </motion.div>
                  <div>
                    <h5 className="font-bold text-xs text-foreground font-display">Rendez-vous confirmé !</h5>
                    <p className="text-[10px] text-muted-foreground">Aujourd'hui à 14:00</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface text-success text-[10px] font-semibold border border-success/20">
                    <MessageCircle className="w-3 h-3 text-success" />
                    <span>Rappel WhatsApp envoyé</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Barre de navigation home en bas de l'iPhone */}
        <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-2" />
      </div>
    </div>
  );
};
