import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Scissors,
  UserCheck,
  Settings,
  ExternalLink,
  QrCode,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QRCodeModal } from './QRCodeModal';
import { Logo } from './brand/Logo';
import { InstallPwaButton } from './pwa/InstallPwaButton';

export const AppLayout: React.FC = () => {
  const { salon, user, signOut, isDemoMode } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const navigate = useNavigate();

  const publicUrl = salon
    ? `${window.location.origin}/s/${salon.slug}`
    : `${window.location.origin}/s/demo`;

  interface NavItem {
    to: string;
    label: string;
    icon: any;
    end?: boolean;
  }

  const mainNavItems: NavItem[] = [
    { to: '/app', label: 'Accueil', icon: LayoutDashboard, end: true },
    { to: '/app/agenda', label: 'Agenda', icon: Calendar },
    { to: '/app/clients', label: 'Clients', icon: Users },
    { to: '/app/equipe', label: 'Équipe', icon: UserCheck },
  ];

  const secondaryNavItems: NavItem[] = [
    { to: '/app/rendez-vous', label: 'Tous les RDV', icon: Clock },
    { to: '/app/services', label: 'Prestations & Prix', icon: Scissors },
    { to: '/app/parametres', label: 'Paramètres du salon', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/connexion');
  };

  return (
    <div className="w-full max-w-full min-h-[100dvh] bg-dots flex flex-col lg:flex-row text-foreground font-sans min-w-0 box-border">
      {/* 1) SIDEBAR DESKTOP REPLIABLE (visible dès 1024px) */}
      <aside
        className={`hidden lg:flex flex-col bg-surface border-r-2 border-ink transition-all duration-300 shrink-0 select-none relative z-20 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Salon Branding */}
        <div className="p-4 border-b-2 border-ink flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Logo variant="icon" size="md" />
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-sm text-foreground font-display truncate">
                  {salon?.nom || 'RDV Salon'}
                </h1>
                <p className="text-[11px] text-muted-foreground font-medium truncate">
                  {salon?.commune || 'Abidjan'} · FCFA
                </p>
              </div>
            )}
          </div>

          {/* Bouton Replier / Déplier la barre latérale */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-alt transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            title={collapsed ? 'Agrandir la barre latérale' : 'Replier la barre latérale'}
            aria-label={collapsed ? 'Agrandir' : 'Replier'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Lien Public Rapide */}
        {!collapsed && (
          <div className="px-4 py-3 border-b-2 border-ink flex items-center justify-between gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="press flex-1 min-w-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-lime border-2 border-ink shadow-hard-sm text-xs text-ink font-bold cursor-pointer"
              title="Ouvrir la page de réservation publique"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Page de réservation</span>
            </a>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="press w-10 h-10 min-h-[40px] shrink-0 flex items-center justify-center text-ink bg-surface border-2 border-ink rounded-full shadow-hard-sm cursor-pointer"
              title="Afficher le QR Code du salon"
              aria-label="Afficher le QR Code du salon"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation principale Desktop */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {[...mainNavItems, ...secondaryNavItems].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] border-2 text-sm font-bold transition-all duration-150 min-h-[44px] cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white border-ink shadow-hard-sm -rotate-1'
                    : 'border-transparent text-ink/70 hover:text-ink hover:bg-surface-alt hover:border-ink'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bouton d'installation PWA dans la barre latérale */}
        {!collapsed && (
          <div className="px-3 pb-2">
            <InstallPwaButton className="w-full justify-center" />
          </div>
        )}

        {/* Pied de sidebar / Profil & Déconnexion */}
        <div className="p-3 border-t-2 border-ink">
          {isDemoMode && !collapsed && (
            <div className="mb-2 px-2.5 py-1.5 bg-candy border-2 border-ink rounded-full text-[11px] font-bold text-ink flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Mode Démo Actif</span>
            </div>
          )}

          <div className={`flex items-center justify-between text-xs ${collapsed ? 'justify-center' : ''}`}>
            {!collapsed && (
              <div className="truncate mr-2">
                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Gérant(e)</span>
                <span className="truncate font-medium text-foreground">{user?.email || 'Propriétaire'}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Se déconnecter"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2) HEADER MOBILE SIMPLE */}
      <header className="lg:hidden w-full max-w-full bg-surface border-b-2 border-ink px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] flex items-center justify-between sticky top-0 z-30 box-border min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <Logo variant="icon" size="sm" />
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm text-foreground font-display truncate">
              {salon?.nom || 'RDV Salon'}
            </h2>
            <span className="text-[10px] text-muted-foreground font-medium block truncate">{salon?.commune || 'Abidjan'} · FCFA</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full cursor-pointer"
            title="QR Code"
          >
            <QrCode className="w-5 h-5" />
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-primary rounded-full cursor-pointer"
            title="Page publique"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* 3) CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col w-full max-w-full min-w-0 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8 box-border">
        <Outlet />
      </main>

      {/* 4) BARRE DE NAVIGATION EN BAS SUR MOBILE (5 ENTRÉES MAXIMUM : Accueil, Agenda, Clients, Équipe, Plus) */}
      <nav
        aria-label="Navigation mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t-2 border-ink px-2 pt-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around box-border w-full max-w-full"
      >
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-2 rounded-[14px] border-2 text-[10px] font-bold min-h-[48px] min-w-[56px] transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary text-white border-ink'
                  : 'border-transparent text-ink/60 hover:text-ink'
              }`
            }
          >
            <item.icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* 5e Entrée : PLUS */}
        <button
          type="button"
          onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-[14px] border-2 text-[10px] font-bold min-h-[48px] min-w-[56px] transition-colors cursor-pointer ${
            mobileMoreOpen ? 'bg-lime text-ink border-ink' : 'border-transparent text-ink/60'
          }`}
          aria-label="Plus d'options"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span>Plus</span>
        </button>
      </nav>

      {/* VOLET "PLUS" MOBILE */}
      {mobileMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-ink/50 flex flex-col justify-end">
          <div className="bg-surface rounded-t-[22px] p-6 space-y-4 border-t-2 border-ink animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-ink">
              <h3 className="font-bold text-base text-foreground font-display">
                Options et modules
              </h3>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {secondaryNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMoreOpen(false)}
                  className="press flex items-center gap-3 p-3.5 rounded-[16px] bg-surface text-ink font-bold text-sm border-2 border-ink shadow-hard-sm"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <button
                type="button"
                onClick={() => {
                  setMobileMoreOpen(false);
                  setShowQrModal(true);
                }}
                className="press w-full flex items-center gap-3 p-3.5 rounded-[16px] bg-lime text-ink font-bold text-sm border-2 border-ink shadow-hard-sm cursor-pointer text-left"
              >
                <QrCode className="w-5 h-5" />
                <span>Afficher le QR Code du salon</span>
              </button>

              <div className="pt-2">
                <InstallPwaButton className="w-full justify-center" />
              </div>
            </div>

            <div className="pt-3 border-t-2 border-ink">
              <button
                type="button"
                onClick={() => {
                  setMobileMoreOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-full bg-candy text-ink border-2 border-ink font-bold text-sm min-h-[44px] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QR CODE */}
      {salon && (
        <QRCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          publicUrl={publicUrl}
          salonNom={salon.nom}
        />
      )}
    </div>
  );
};
