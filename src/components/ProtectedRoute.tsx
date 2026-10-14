import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, salon, salonError, loading, refreshSalon } = useAuth();
  const [retrying, setRetrying] = useState(false);

  if (loading || retrying) {
    return (
      <div className="min-h-[100dvh] bg-dots flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-ink border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  // Le salon n'a pas pu être lu (réseau, base) : on ne redirige surtout pas vers l'inscription
  if (salonError) {
    return (
      <div className="min-h-[100dvh] bg-dots flex items-center justify-center p-4">
        <div role="alert" className="max-w-md w-full bg-surface p-8 rounded-[18px] border-2 border-ink shadow-hard-lg text-center space-y-4">
          <div className="w-14 h-14 rounded-[14px] bg-candy border-2 border-ink flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-ink" />
          </div>
          <h1 className="text-2xl font-bold font-display text-ink">Impossible d'ouvrir votre salon</h1>
          <p className="text-sm text-muted-foreground">{salonError}</p>
          <button
            type="button"
            onClick={async () => {
              setRetrying(true);
              await refreshSalon();
              setRetrying(false);
            }}
            className="press inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white border-2 border-ink font-bold text-sm shadow-hard-md min-h-[48px] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  // Compte connecté mais aucun salon (ancienne inscription incomplète) : on le fait créer
  if (!salon) {
    return <Navigate to="/inscription" replace />;
  }

  return <>{children}</>;
};
