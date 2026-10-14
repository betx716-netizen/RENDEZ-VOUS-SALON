import React, { useState, useEffect } from 'react';
import { Download, Check } from 'lucide-react';
import { IosInstallModal } from './IosInstallModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPwaButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Vérifier si l'application est déjà lancée en mode autonome PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const iosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(iosDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setJustInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos || !deferredPrompt) {
      setShowIosModal(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setJustInstalled(true);
      }
      setDeferredPrompt(null);
    } catch {
      setShowIosModal(true);
    }
  };

  if (isInstalled && !justInstalled) {
    return null; // Déjà installée
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full press bg-lime text-ink border-2 border-ink font-bold text-xs shadow-hard-sm cursor-pointer select-none min-h-[40px] ${className}`}
        title="Installer RDV Salon sur votre téléphone ou ordinateur"
      >
        {justInstalled ? (
          <>
            <Check className="w-3.5 h-3.5 text-white" />
            <span>Application installée !</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-white animate-bounce" />
            <span>Installer l'application</span>
          </>
        )}
      </button>

      <IosInstallModal isOpen={showIosModal} onClose={() => setShowIosModal(false)} />
    </>
  );
};
