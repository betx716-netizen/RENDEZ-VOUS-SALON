import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, Clock, MessageCircle, Scissors, Sparkles, TrendingUp, Bell } from 'lucide-react';
import { usePerformanceTier } from '../../lib/tier';

export const Hero3DPhone: React.FC = () => {
  const tier = usePerformanceTier();
  const shouldReduce = useReducedMotion() || tier === 'lite';
  const containerRef = useRef<HTMLDivElement>(null);

  // Rotation angles for 3D perspective (±6°)
  const [rotation, setRotation] = useState({ rx: 0, ry: 0 });
  const [activeStep, setActiveStep] = useState(0);

  // Cycle automatique de la démonstration sur l'écran
  useEffect(() => {
    if (shouldReduce) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(interval);
  }, [shouldReduce]);

  // Suivi de la souris sur desktop (standard & immersive)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const ry = (x / (rect.width / 2)) * 6;  // ±6 deg
    const rx = -(y / (rect.height / 2)) * 6; // ±6 deg
    setRotation({ rx, ry });
  };

  const handleMouseLeave = () => {
    setRotation({ rx: 0, ry: 0 });
  };

  // Suivi du touch sur mobile (standard)
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (shouldReduce || !containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;

    const ry = Math.max(-6, Math.min(6, (x / (rect.width / 2)) * 6));
    const rx = Math.max(-6, Math.min(6, -(y / (rect.height / 2)) * 6));
    setRotation({ rx, ry });
  };

  const handleTouchEnd = () => {
    setRotation({ rx: 0, ry: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ perspective: 1200 }}
      className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] py-6 sm:py-8 select-none"
    >
      {/* 1) CARTE FLOTTANTE PARALLAXE 1 : HAUT GAUCHE (z: 50px) */}
      <motion.div
        animate={
          shouldReduce
            ? {}
            : {
                y: [0, -8, 0],
                rotateZ: [-1, 1, -1],
              }
        }
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          transform: `translate3d(0px, 10px, 50px) rotateX(${rotation.rx * 1.2}deg) rotateY(${rotation.ry * 1.2}deg)`,
        }}
        className="absolute -top-3 left-0 sm:-left-10 z-30 bg-surface p-2.5 sm:p-3.5 rounded-[18px] border-2 border-border shadow-hard-lg flex items-center gap-2.5 max-w-[190px] sm:max-w-[210px]"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
          <Bell className="w-4 h-4 text-primary" />
        </div>
        <div className="text-left leading-tight truncate">
          <p className="text-[10px] font-bold text-foreground">Nouveau RDV !</p>
          <p className="text-[9px] text-muted-foreground truncate">Aïcha • Knotless 25 000 F</p>
        </div>
      </motion.div>

      {/* 2) CARTE FLOTTANTE PARALLAXE 2 : HAUT DROITE (z: 75px) */}
      <motion.div
        animate={
          shouldReduce
            ? {}
            : {
                y: [0, 8, 0],
                rotateZ: [1, -1, 1],
              }
        }
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{
          transform: `translate3d(0px, 40px, 75px) rotateX(${rotation.rx * 1.4}deg) rotateY(${rotation.ry * 1.4}deg)`,
        }}
        className="absolute top-24 right-0 sm:-right-10 z-30 bg-surface p-2.5 sm:p-3.5 rounded-[18px] border border-success/30 shadow-hard-lg flex items-center gap-2.5 max-w-[200px] sm:max-w-[220px]"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
          <MessageCircle className="w-4 h-4" />
        </div>
        <div className="text-left leading-tight truncate">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-foreground">WhatsApp Auto</span>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          </div>
          <p className="text-[9px] text-muted-foreground truncate">Rappel 2h avant le RDV</p>
        </div>
      </motion.div>

      {/* 3) CARTE FLOTTANTE PARALLAXE 3 : BAS GAUCHE (z: 40px) */}
      <motion.div
        animate={
          shouldReduce
            ? {}
            : {
                y: [0, -6, 0],
                rotateZ: [0, -1.5, 0],
              }
        }
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          transform: `translate3d(0px, -20px, 40px) rotateX(${rotation.rx * 1.1}deg) rotateY(${rotation.ry * 1.1}deg)`,
        }}
        className="absolute -bottom-2 left-0 sm:-left-6 z-30 bg-surface p-2.5 sm:p-3 rounded-[20px] border-2 border-border shadow-hard-lg flex items-center gap-2.5"
      >
        <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
          <TrendingUp className="w-4 h-4 text-gold" />
        </div>
        <div className="text-left leading-tight">
          <p className="text-[9px] text-muted-foreground">Journée estimée</p>
          <p className="text-xs font-bold text-primary tabular-nums">+85 000 FCFA</p>
        </div>
      </motion.div>

      {/* TÉLÉPHONE PRINCIPAL EN 3D LÉGÈRE */}
      <motion.div
        animate={{
          rotateX: rotation.rx,
          rotateY: rotation.ry,
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative rounded-[42px] p-3 bg-dark-section border-[3px] border-border/50 shadow-hard-lg ring-1 ring-white/10"
      >
        {/* Dynamic Island / Encoche */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black/70 rounded-full z-20 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
        </div>

        {/* Écran du smartphone */}
        <div className="relative overflow-hidden rounded-[18px] bg-surface text-foreground p-4 pt-8 border-2 border-border min-h-[470px] flex flex-col justify-between shadow-inner">
          {/* Haut de l'application salon */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-hard-sm">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground font-display leading-tight">
                    Ébène & Or
                  </h4>
                  <p className="text-[10px] text-primary font-medium">Riviera 3 • Abidjan</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold border border-success/20">
                Ouvert
              </span>
            </div>

            {/* Prestation sélectionnée */}
            <div className="mt-3 p-3 rounded-[18px] bg-surface-alt border-2 border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Knotless Braids VIP</span>
                <span className="font-bold text-primary tabular-nums">25 000 FCFA</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3 text-primary" />
                <span>2h30 • Sarah K.</span>
              </div>
            </div>

            {/* Sélecteur de créneaux animés */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Aujourd'hui, 15:30</span>
                <span className="text-primary font-semibold">3 créneaux libres</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['14:00', '15:30', '17:00'].map((time, idx) => {
                  const isSelected = activeStep >= 1 && idx === 1;
                  return (
                    <div
                      key={time}
                      className={`py-2 text-center rounded-[14px] text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-hard-sm font-bold scale-105'
                          : 'bg-surface border-border text-foreground'
                      }`}
                    >
                      {time}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carte état actif */}
            <div className="mt-4">
              {activeStep === 0 && (
                <div className="p-3 rounded-[16px] bg-primary/5 border border-primary/20 text-center animate-fade-in">
                  <p className="text-[11px] text-foreground font-medium">
                    1. La cliente clique sur le lien du salon
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Sur Instagram, WhatsApp ou TikTok
                  </p>
                </div>
              )}

              {activeStep === 1 && (
                <div className="p-3 rounded-[16px] bg-accent/5 border border-accent/20 text-center animate-fade-in">
                  <p className="text-[11px] text-foreground font-medium">
                    2. Créneau de 15:30 réservé en 2 clics
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Aucune attente au téléphone
                  </p>
                </div>
              )}

              {activeStep === 2 && (
                <div className="p-3 rounded-[16px] bg-success/10 border border-success/30 text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-1 text-success font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>RDV Confirmé & Notifié !</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Rappel WhatsApp programmé
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bouton d'action bas */}
          <div className="pt-3 border-t border-border">
            <div
              className={`w-full py-2.5 rounded-full text-center text-xs font-semibold transition-all shadow-hard-sm ${
                activeStep === 2
                  ? 'bg-success text-white'
                  : 'bg-primary text-white'
              }`}
            >
              {activeStep === 2 ? 'Rendez-vous confirmé' : 'Confirmer la réservation'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
