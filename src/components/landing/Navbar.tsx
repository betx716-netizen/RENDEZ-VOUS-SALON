import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '../brand/Logo';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Fonctions', href: '#fonctions' },
    { label: 'Parcours', href: '#recit' },
    { label: 'Tarifs', href: '#tarifs' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper border-b-2 border-ink pt-[env(safe-area-inset-top,0px)] w-full max-w-full min-w-0 box-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between min-w-0 w-full">
        {/* LOGO DE MARQUE */}
        <Link to="/" className="flex items-center gap-2 group">
          <Logo variant="full" size="md" />
        </Link>

        {/* LIENS DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-ink" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="py-1 cursor-pointer underline-offset-[6px] decoration-[3px] decoration-primary hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ACTIONS DESKTOP */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/connexion"
            className="px-4 py-2 text-sm font-bold text-ink hover:underline underline-offset-[6px] decoration-[3px] min-h-[44px] flex items-center cursor-pointer"
          >
            Se connecter
          </Link>
          <Link
            to="/inscription"
            className="press px-6 py-2.5 rounded-full bg-primary text-white border-2 border-ink font-bold text-sm shadow-hard-md min-h-[44px] flex items-center cursor-pointer"
          >
            Créer mon salon
          </Link>
        </div>

        {/* BOUTON MENU MOBILE */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/inscription"
            className="press px-4 py-2 rounded-full bg-primary text-white border-2 border-ink font-bold text-xs min-h-[44px] flex items-center shadow-hard-sm cursor-pointer"
          >
            Créer
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink rounded-full bg-surface border-2 border-ink min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MENU HAMBURGER PLEIN ÉCRAN ANIMÉ SUR MOBILE */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed inset-0 top-20 bg-dots z-50 p-6 flex flex-col justify-between overflow-y-auto border-t-2 border-ink"
          >
            <nav className="flex flex-col space-y-4 pt-4">
              {navLinks.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`press py-4 px-5 rounded-[18px] bg-surface text-2xl font-display font-bold text-ink border-2 border-ink shadow-hard-md flex items-center justify-between ${
                    i % 2 === 0 ? '-rotate-1' : 'rotate-1'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
              ))}
            </nav>

            <div className="pt-6 flex flex-col gap-3 pb-8">
              <Link
                to="/connexion"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3.5 rounded-full bg-surface text-ink font-bold text-base border-2 border-ink min-h-[52px] flex items-center justify-center cursor-pointer"
              >
                Se connecter
              </Link>
              <Link
                to="/inscription"
                onClick={() => setMobileMenuOpen(false)}
                className="press w-full text-center py-3.5 rounded-full bg-lime text-ink border-2 border-ink font-bold text-base min-h-[52px] flex items-center justify-center shadow-hard-md cursor-pointer"
              >
                Créer mon salon gratuitement
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
