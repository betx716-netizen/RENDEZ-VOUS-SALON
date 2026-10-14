import React from 'react';
import { WifiOff, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/brand/Logo';

export const OfflinePage: React.FC = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-surface p-8 sm:p-10 rounded-[18px] border-2 border-border shadow-hard-lg space-y-6">
        <div className="flex justify-center">
          <Logo variant="icon" size="lg" />
        </div>

        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-hard-sm">
          <WifiOff className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Pas de connexion
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vos rendez-vous s'afficheront dès que le réseau revient.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full press bg-primary text-white border-2 border-ink font-semibold text-sm shadow-hard-md active:scale-95 transition-all cursor-pointer min-h-[48px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>

          <Link
            to="/app"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-surface-alt hover:bg-lime text-foreground font-medium text-xs border-2 border-border transition-all min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à l'espace salon</span>
          </Link>
        </div>

        <div className="pt-2 text-[11px] text-muted-foreground">
          RDV Salon • Mode hors-ligne sécurisé
        </div>
      </div>
    </div>
  );
};
