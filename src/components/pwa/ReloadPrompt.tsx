import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

export const ReloadPrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Vérification périodique d'une mise à jour (toutes les heures)
      if (r) {
        setInterval(() => {
          r.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(err) {
      console.error('Erreur enregistrement SW PWA:', err);
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-bounce-subtle"
    >
      <div className="bg-surface border-2 border-primary/40 shadow-hard-lg rounded-[18px] p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold text-foreground">Nouvelle version disponible</p>
            <p className="text-[11px] text-muted-foreground">Mettez à jour pour profiter des nouveautés</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-white text-xs font-semibold shadow-hard-sm hover:bg-primary-hover active:scale-95 transition-all cursor-pointer min-h-[36px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mettre à jour</span>
          </button>

          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            className="p-1 text-muted-foreground hover:text-foreground rounded-full min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
