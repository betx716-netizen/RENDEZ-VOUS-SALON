import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  UserCheck,
  Scissors,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Plus,
  Users,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { repository } from '../lib/repository';
import { RendezVous, Service, Employe } from '../types/database';
import { formatFCFA, formatDateHuman, formatHeure } from '../lib/utils';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { QRCodeModal } from '../components/QRCodeModal';
import { AppointmentModal } from '../components/AppointmentModal';
import { Counter } from '../components/motion/Counter';
import { useToast } from '../context/ToastContext';
import { isSameMonth, isSameWeek } from 'date-fns';
import { isSameSalonDay, salonCalendarDay, salonToday } from '../lib/timezone';
import { Link } from 'react-router-dom';
import { PwaInstallBanner } from '../components/pwa/PwaInstallBanner';

export const DashboardPage: React.FC = () => {
  const { salon } = useAuth();
  const { success, error } = useToast();
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showNewRdvModal, setShowNewRdvModal] = useState(false);

  const loadData = async (silent = false) => {
    if (!salon) return;
    if (!silent) setLoading(true);
    try {
      const [rdvs, srvs, emps] = await Promise.all([
        repository.getRendezVous(salon.id),
        repository.getServices(salon.id),
        repository.getEmployes(salon.id),
      ]);
      setRendezVous(rdvs);
      setServices(srvs);
      setEmployes(emps);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      if (!silent) error(err instanceof Error ? err.message : 'Impossible de charger le tableau de bord');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!salon) return;
    loadData();

    const handleSync = () => loadData(true);
    window.addEventListener('rdv_updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    const interval = setInterval(() => handleSync(), 10000);

    return () => {
      window.removeEventListener('rdv_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(interval);
    };
  }, [salon]);

  if (!salon) return null;

  const publicUrl = `${window.location.origin}/s/${salon.slug}`;

  // Calculs statistiques (jours et mois du salon)
  const aujourdhui = salonToday();
  const maintenant = Date.now();
  const actif = (r: RendezVous) => r.statut !== 'annule';
  const todayRdvs = rendezVous.filter((r) => actif(r) && isSameSalonDay(r.debut, aujourdhui));
  const weekRdvs = rendezVous.filter(
    (r) => actif(r) && isSameWeek(salonCalendarDay(r.debut), aujourdhui, { weekStartsOn: 1 })
  );
  // Chiffre d'affaires du mois en cours, sur les prestations réellement terminées
  const caMois = rendezVous
    .filter((r) => r.statut === 'termine' && isSameMonth(salonCalendarDay(r.debut), aujourdhui))
    .reduce((sum, r) => sum + (r.prix_fcfa || 0), 0);

  // Prochains rendez-vous : à venir ou en cours, les plus proches d'abord
  const prochainsClients = rendezVous
    .filter((r) => (r.statut === 'confirme' || r.statut === 'en_attente') && new Date(r.fin).getTime() > maintenant)
    .sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime())
    .slice(0, 6);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    success('Lien public copié dans le presse-papiers');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 mx-auto box-border min-w-0">
      {/* INVITATION À INSTALLER L'APPLICATION PWA (après 2e visite, fermable) */}
      <PwaInstallBanner />

      {/* BANNIÈRE SUPÉRIEURE AVEC BOUTON D'ACTION "NOUVEAU RENDEZ-VOUS" TOUJOURS VISIBLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-[18px] p-5 sm:p-6 border-2 border-border shadow-hard-sm w-full max-w-full min-w-0 box-border">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-candy border-2 border-ink text-ink text-xs font-bold -rotate-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tableau de bord gérant</span>
          </div>
          <h1 className="pt-1 text-2xl sm:text-4xl font-bold font-display text-foreground leading-tight break-words [overflow-wrap:anywhere] [text-wrap:balance]">
            Bienvenue chez <span className="marker">{salon.nom}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">
            Gérez vos rendez-vous, prévenez vos clientes sur WhatsApp et suivez votre activité.
          </p>
        </div>

        {/* BOUTON D'ACTION PERMANENT */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowNewRdvModal(true)}
            className="press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white border-2 border-ink font-bold text-sm shadow-hard-md min-h-[48px] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouveau rendez-vous</span>
          </button>
        </div>
      </div>

      {/* CARTES DE CHIFFRES AVEC COMPTEURS ANIMÉS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 w-full max-w-full min-w-0">
        {/* Rendez-vous du jour */}
        <div className="bg-lime rounded-[18px] p-5 sm:p-6 border-2 border-ink shadow-hard-md space-y-2 min-w-0 w-full box-border -rotate-1">
          <div className="flex items-center justify-between text-ink">
            <span className="text-xs font-bold uppercase tracking-wider">Aujourd'hui</span>
            <div className="w-9 h-9 rounded-full bg-surface border-2 border-ink flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-5xl font-bold font-display text-ink tabular-nums leading-none">
            <Counter to={todayRdvs.length} />
          </div>
          <p className="text-sm text-ink/75 break-words">
            Rendez-vous prévus pour la journée
          </p>
        </div>

        {/* Rendez-vous de la semaine */}
        <div className="bg-candy rounded-[18px] p-5 sm:p-6 border-2 border-ink shadow-hard-md space-y-2 min-w-0 w-full box-border rotate-1">
          <div className="flex items-center justify-between text-ink">
            <span className="text-xs font-bold uppercase tracking-wider">Cette semaine</span>
            <div className="w-9 h-9 rounded-full bg-surface border-2 border-ink flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-5xl font-bold font-display text-ink tabular-nums leading-none">
            <Counter to={weekRdvs.length} />
          </div>
          <p className="text-sm text-ink/75 break-words">
            Réservations confirmées cette semaine
          </p>
        </div>

        {/* Chiffre d'affaires estimé */}
        <div className="bg-sun rounded-[18px] p-5 sm:p-6 border-2 border-ink shadow-hard-md space-y-2 min-w-0 w-full box-border -rotate-1">
          <div className="flex items-center justify-between text-ink">
            <span className="text-xs font-bold uppercase tracking-wider">CA estimé du mois</span>
            <div className="w-9 h-9 rounded-full bg-surface border-2 border-ink flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-display text-ink tabular-nums truncate leading-none py-1.5">
            <Counter to={caMois} suffix=" F" />
          </div>
          <p className="text-sm text-ink/75 break-words">
            Prestations terminées, en Francs CFA
          </p>
        </div>
      </div>

      {/* LIEN DE RÉSERVATION RAPIDE */}
      <div className="bg-surface-alt rounded-[18px] p-4 sm:p-6 border-2 border-border shadow-hard-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full max-w-full min-w-0 box-border">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-foreground truncate">Votre lien de réservation public</h3>
            <p className="text-xs text-muted-foreground font-mono truncate w-full min-w-0">
              {publicUrl}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-surface hover:bg-lime text-foreground font-semibold text-xs border-2 border-border min-h-[44px] cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Copié !' : 'Copier'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white font-semibold text-xs shadow-hard-sm min-h-[44px] cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </button>
        </div>
      </div>

      {/* LISTE "PROCHAINS CLIENTS" */}
      <div className="bg-surface rounded-[18px] p-5 sm:p-7 border-2 border-border shadow-hard-sm space-y-5 w-full max-w-full min-w-0 box-border">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold font-display text-foreground truncate">
              Prochains clients
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Les réservations à venir au salon
            </p>
          </div>
          <Link
            to="/app/agenda"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span className="truncate">Voir l'agenda complet</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {prochainsClients.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Calendar className="w-10 h-10 text-muted-foreground/60 mx-auto" />
            <p className="text-sm font-semibold text-foreground">Aucun rendez-vous planifié</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Partagez votre lien de réservation sur votre statut WhatsApp pour recevoir vos premiers clients.
            </p>
            <button
              type="button"
              onClick={() => setShowNewRdvModal(true)}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-semibold shadow-hard-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer un rendez-vous</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border w-full min-w-0">
            {prochainsClients.map((rdv) => (
              <div
                key={rdv.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-alt/50 rounded-xl px-2 transition-colors min-w-0 w-full"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {(rdv.client?.nom || rdv.client_nom || 'C')[0]}
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="font-bold text-sm text-foreground break-words">
                        {rdv.client?.nom || rdv.client_nom}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border shrink-0 ${
                        rdv.statut === 'confirme'
                          ? 'bg-success/10 text-success border-success/20'
                          : rdv.statut === 'termine'
                          ? 'bg-accent/10 text-accent border-accent/20'
                          : 'bg-gold/15 text-gold border-gold/30'
                      }`}>
                        {rdv.statut === 'confirme' ? 'Confirmé' : rdv.statut === 'termine' ? 'Terminé' : 'En attente'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                      <span className="font-medium text-foreground break-words">{rdv.service?.nom}</span>
                      <span>•</span>
                      <span>{formatDateHuman(rdv.debut)}</span>
                      {rdv.employe && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">{rdv.employe.prenom}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end pt-2 sm:pt-0 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-border/50">
                  <span className="font-bold tabular-nums text-sm text-primary">
                    {formatFCFA(rdv.prix_fcfa)}
                  </span>
                  <WhatsAppButton rdv={rdv} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL QR CODE */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        publicUrl={publicUrl}
        salonNom={salon.nom}
      />

      {/* MODAL CRÉATION RENDEZ-VOUS */}
      {showNewRdvModal && (
        <AppointmentModal
          isOpen={showNewRdvModal}
          onClose={() => setShowNewRdvModal(false)}
          onSuccess={() => loadData(true)}
          salon={salon}
          services={services}
          employes={employes}
        />
      )}
    </div>
  );
};
