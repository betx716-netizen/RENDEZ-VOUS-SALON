import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowBackOnline(true);
      const timer = setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowBackOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showBackOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-[calc(0.75rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none animate-fade-in"
    >
      {isOffline ? (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ink text-paper border border-destructive/40 shadow-hard-lg text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <WifiOff className="w-3.5 h-3.5 text-destructive" />
          <span>Hors connexion</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-success text-white shadow-hard-lg text-xs font-semibold">
          <Wifi className="w-3.5 h-3.5" />
          <span>Connexion rétablie</span>
        </div>
      )}
    </div>
  );
};
