import React, { useState, useRef } from 'react';
import { XCircle, CheckCircle2, Sparkles, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';
import { usePerformanceTier } from '../../lib/tier';

export const BeforeAfterSlider: React.FC = () => {
  const tier = usePerformanceTier();
  const [sliderPos, setSliderPos] = useState(50); // Pourcentage 0 à 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) updatePosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) updatePosition(e.touches[0].clientX);
  };

  // Accessibilité au clavier : Flèche gauche / Flèche droite
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPos((prev) => Math.max(5, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPos((prev) => Math.min(95, prev + 5));
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 bg-surface-alt/40 border-y border-border">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comparaison interactive</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl leading-[0.95] font-bold text-foreground tracking-tight">
            Votre quotidien : avant vs après RDV Salon
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Glissez le curseur avec la souris, le doigt ou les flèches du clavier pour constater la différence.
          </p>
        </div>

        {/* CONTENEUR DU CURSEUR AVANT / APRÈS */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          tabIndex={0}
          role="slider"
          aria-label="Curseur de comparaison avant et après"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPos)}
          onKeyDown={handleKeyDown}
          className="relative rounded-[18px] overflow-hidden border-2 border-border shadow-hard-lg select-none min-h-[460px] cursor-ew-resize focus:outline-none focus:border-primary focus:shadow-hard-sm"
        >
          {/* 1. PANNEAU "APRÈS" (FOND COMPLET) */}
          <div className="absolute inset-0 bg-surface p-7 sm:p-12 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="px-4 py-1.5 rounded-full bg-success/15 border border-success/30 text-success text-xs sm:text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Après RDV Salon • Sérénité</span>
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">Organisation moderne</span>
            </div>

            <div className="space-y-4 my-6 max-w-md ml-auto text-right">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Un salon plein, zéro coup de fil inutile
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center justify-end gap-2.5">
                  <span>Clientes 100% autonomes depuis leur smartphone</span>
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                </li>
                <li className="flex items-center justify-end gap-2.5">
                  <span>Rappels WhatsApp automatiques : -80% d'absences</span>
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                </li>
                <li className="flex items-center justify-end gap-2.5">
                  <span>Planning propre sans aucun doublon</span>
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                </li>
                <li className="flex items-center justify-end gap-2.5">
                  <span>Chiffre d'affaires suivi en FCFA en temps réel</span>
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end text-xs text-success font-semibold">
              Gain de temps moyen : 2 heures par jour
            </div>
          </div>

          {/* 2. PANNEAU "AVANT" (MASQUÉ VIA CLIP-PATH OU LARGEUR) */}
          <div
            style={{ width: `${sliderPos}%` }}
            className="absolute inset-y-0 left-0 bg-ink text-paper p-7 sm:p-12 flex flex-col justify-between overflow-hidden z-10 border-r-2 border-primary"
          >
            <div className="w-full flex items-center justify-between">
              <span className="px-4 py-1.5 rounded-full bg-destructive/20 border border-destructive/40 text-[#FCA5A5] text-xs sm:text-sm font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Avant • Carnet & Stress</span>
              </span>
            </div>

            <div className="space-y-4 my-6 min-w-[280px] sm:min-w-[400px]">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Interrompue sans arrêt en plein travail
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-paper/80">
                <li className="flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  <span>Mains mouillées ou pleines de mèche au téléphone</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  <span>Double réservations et disputes le samedi</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  <span>Clientes qui oublient de venir sans prévenir</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  <span>Carnets papier froissés, comptes approximatifs</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-[#FCA5A5] font-medium min-w-[280px]">
              Stress permanent et pertes de chiffre d'affaires
            </div>
          </div>

          {/* 3. BARRE DE SÉPARATION & POIGNÉE TACTILE */}
          <div
            style={{ left: `${sliderPos}%` }}
            onMouseDown={handleMouseDown}
            className="absolute inset-y-0 -translate-x-1/2 z-20 flex flex-col items-center justify-center cursor-ew-resize pointer-events-none"
          >
            {/* Ligne lumineuse */}
            <div className="w-[4px] h-full bg-ink" />

            {/* Pastille poignée avec flèches */}
            <div className="absolute w-11 h-11 rounded-full bg-surface border-2 border-primary shadow-hard-lg flex items-center justify-center text-primary pointer-events-auto hover:scale-110 active:scale-95 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Légende d'aide */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>← Glisser pour comparer</span>
          <span>•</span>
          <span>Accessible au clavier (flèches ← →)</span>
        </div>
      </div>
    </section>
  );
};
