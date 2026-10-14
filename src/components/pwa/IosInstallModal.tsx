import React from 'react';
import { X, Share, PlusSquare } from 'lucide-react';
import { Logo } from '../brand/Logo';

interface IosInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IosInstallModal: React.FC<IosInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-modal-title"
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface rounded-t-[18px] sm:rounded-[18px] p-6 sm:p-8 border-2 border-border shadow-hard-lg space-y-6 text-foreground select-none"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <Logo variant="icon" size="sm" />
            <h3 id="ios-modal-title" className="font-display font-bold text-lg text-foreground">
              Installer sur iPhone & iPad
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Ajoutez RDV Salon à votre écran d'accueil pour y accéder en 1 clic comme une application native.
        </p>

        {/* Schéma d'instructions étape par étape */}
        <div className="space-y-4">
          {/* Étape 1 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-[20px] bg-surface-alt border-2 border-border">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                Touchez l'icône Partager
                <Share className="w-4 h-4 text-primary inline" />
              </span>
              <p className="text-muted-foreground">
                Située dans la barre de navigation Safari (en bas sur iPhone, en haut sur iPad).
              </p>
            </div>
          </div>

          {/* Étape 2 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-[20px] bg-surface-alt border-2 border-border">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                Choisissez « Sur l'écran d'accueil »
                <PlusSquare className="w-4 h-4 text-primary inline" />
              </span>
              <p className="text-muted-foreground">
                Faites défiler le menu vers le bas puis confirmez en touchant « Ajouter ».
              </p>
            </div>
          </div>
        </div>

        {/* Bouton de confirmation */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-full press bg-primary text-white border-2 border-ink font-semibold text-sm shadow-hard-md min-h-[48px] cursor-pointer"
        >
          C'est compris
        </button>
      </div>
    </div>
  );
};
