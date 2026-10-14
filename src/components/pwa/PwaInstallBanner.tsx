import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Check } from 'lucide-react';
import { IosInstallModal } from './IosInstallModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // 1. Vérification si déjà installé en standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // 2. Détection iOS
    const iosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(iosDevice);

    // 3. Gestionnaire Android beforeinstallprompt
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);

    // 4. Calcul du nombre de visites (doit être >= 2 pour ne pas agresser à la première seconde)
    try {
      const dismissed = localStorage.getItem('rdv_pwa_dismissed') === 'true';
      if (dismissed) return;

      const visits = parseInt(localStorage.getItem('rdv_visit_count') || '0', 10) + 1;
      localStorage.setItem('rdv_visit_count', visits.toString());

      if (visits >= 2) {
        // Affichage après un léger délai de confort (1.5s)
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignorer
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Navigateur sans prompt direct
      setShowIosModal(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch {
      // Ignorer
    }
  };

  const handleDismissForever = () => {
    setShowBanner(false);
    try {
      localStorage.setItem('rdv_pwa_dismissed', 'true');
    } catch {
      // Ignorer
    }
  };

  const handleDismissTemporary = () => {
    setShowBanner(false);
  };

  if (isStandalone || !showBanner) {
    return <IosInstallModal isOpen={showIosModal} onClose={() => setShowIosModal(false)} />;
  }

  return (
    <>
      <div className="mb-6 p-4 rounded-[18px] bg-sun border-2 border-ink shadow-hard-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in select-none w-full max-w-full min-w-0 box-border">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-hard-sm">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-sm text-foreground break-words">
              Installer l'application RDV Salon
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 break-words">
              Accédez directement à votre agenda depuis votre écran d'accueil, même avec une connexion lente.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 min-w-0">
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full press bg-primary text-white border-2 border-ink font-semibold text-xs shadow-hard-md min-h-[44px] cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="truncate">Installer l'app</span>
          </button>

          <button
            type="button"
            onClick={handleDismissForever}
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-full min-h-[44px] flex items-center justify-center cursor-pointer shrink-0"
            title="Ne plus afficher cette proposition"
          >
            Ne plus montrer
          </button>

          <button
            type="button"
            onClick={handleDismissTemporary}
            className="p-1 text-muted-foreground hover:text-foreground rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer sm:hidden ml-auto"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <IosInstallModal isOpen={showIosModal} onClose={() => setShowIosModal(false)} />
    </>
  );
};
