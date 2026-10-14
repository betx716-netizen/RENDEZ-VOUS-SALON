import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Logo } from '../brand/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-alt border-t border-border text-foreground py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-border">
          {/* LOGO & DESCRIPTION */}
          <div className="space-y-3 max-w-sm">
            <Link to="/" className="inline-block">
              <Logo variant="full" size="md" />
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              La plateforme de prise de rendez-vous et de gestion pensée pour les salons de coiffure et instituts de beauté en Côte d'Ivoire.
            </p>
          </div>

          {/* LIENS RAPIDES */}
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#fonctions" className="hover:text-primary transition-colors cursor-pointer">
              Fonctions
            </a>
            <a href="#comment-ca-marche" className="hover:text-primary transition-colors cursor-pointer">
              Comment ça marche
            </a>
            <a href="#faq" className="hover:text-primary transition-colors cursor-pointer">
              FAQ
            </a>
            <Link to="/connexion" className="hover:text-primary transition-colors cursor-pointer">
              Se connecter
            </Link>
            <Link to="/inscription" className="hover:text-primary font-bold transition-colors cursor-pointer">
              Créer mon salon
            </Link>
          </div>

          {/* BOUTON ÉCRIRE SUR WHATSAPP */}
          <div>
            <a
              href="https://wa.me/2250759358662?text=Bonjour%2C%20je%20veux%20cr%C3%A9er%20mon%20salon%20sur%20RDV%20Salon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-success hover:opacity-90 text-white text-xs sm:text-sm font-semibold shadow-hard-sm transition-colors min-h-[44px] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Écrire sur WhatsApp</span>
            </a>
          </div>
        </div>

        {/* MENTIONS BAS DE PAGE */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} RDV Salon. Tous droits réservés.</p>
          <p className="flex items-center gap-1 font-medium text-foreground">
            <span>Fait à Abidjan</span>
            <span>🇨🇮</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
