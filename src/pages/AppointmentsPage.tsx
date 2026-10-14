import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle,
  Plus,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { repository } from '../lib/repository';
import {
  RendezVous,
  StatutRendezVous,
  Employe,
  Service,
  Client,
} from '../types/database';
import { formatFCFA, formatDateHuman, formatHeure, formatPhoneDisplay } from '../lib/utils';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { AppointmentModal } from '../components/AppointmentModal';
import { isFuture, isPast, parseISO } from 'date-fns';
import { isSameSalonDay, salonToday } from '../lib/timezone';
import { useToast } from '../context/ToastContext';

export const AppointmentsPage: React.FC = () => {
  const { salon } = useAuth();
  const { error } = useToast();
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState<'tous' | 'aujourdhui' | 'avenir' | 'passes'>('tous');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [filterEmploye, setFilterEmploye] = useState<string>('tous');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);

  const loadData = async (silent = false) => {
    if (!salon) return;
    if (!silent) setLoading(true);
    try {
      const [rdvs, emps, srvs, clis] = await Promise.all([
        repository.getRendezVous(salon.id),
        repository.getEmployes(salon.id),
        repository.getServices(salon.id),
        repository.getClients(salon.id),
      ]);
      setRendezVous(rdvs);
      setEmployes(emps);
      setServices(srvs);
      setClients(clis);
    } catch (err) {
      console.error('Erreur chargement rendez-vous:', err);
      if (!silent) error(err instanceof Error ? err.message : 'Impossible de charger les rendez-vous');
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

  // Filtrage
  const filteredRdvs = rendezVous.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const nom = r.client?.nom?.toLowerCase() || r.client_nom?.toLowerCase() || '';
      const tel = r.client?.telephone?.replace(/\s/g, '') || r.client_telephone?.replace(/\s/g, '') || '';
      if (!nom.includes(q) && !tel.includes(q.replace(/\s/g, ''))) {
        return false;
      }
    }

    if (filterStatut !== 'tous' && r.statut !== filterStatut) {
      return false;
    }

    if (filterEmploye !== 'tous' && r.employe_id !== filterEmploye) {
      return false;
    }

    const d = parseISO(r.debut);
    if (filterDate === 'aujourdhui' && !isSameSalonDay(d, salonToday())) return false;
    if (filterDate === 'avenir' && !isFuture(d)) return false;
    if (filterDate === 'passes' && !isPast(d)) return false;

    return true;
  });

  const handleOpenRdv = (rdv: RendezVous) => {
    setSelectedRdv(rdv);
    setModalOpen(true);
  };

  const getStatusBadge = (statut: StatutRendezVous) => {
    switch (statut) {
      case 'termine':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-success/10 text-success border border-success">
            Terminé
          </span>
        );
      case 'confirme':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
            Confirmé
          </span>
        );
      case 'absent':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
            Absent
          </span>
        );
      case 'annule':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-alt text-muted-foreground line-through border-2 border-border">
            Annulé
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gold/15 text-gold border border-gold/30">
            En attente
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-8 py-4 sm:py-8 max-w-7xl mx-auto space-y-6 box-border min-w-0">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-[18px] border-2 border-border shadow-hard-sm w-full max-w-full min-w-0 box-border">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground break-words">
            Tous les rendez-vous
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 break-words">
            Historique complet, recherche et rappels clients
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedRdv(null);
            setModalOpen(true);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full press bg-primary text-white border-2 border-ink font-semibold text-xs sm:text-sm shadow-hard-md min-h-[44px] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nouveau RDV</span>
        </button>
      </div>

      {/* FILTRES & RECHERCHE */}
      <div className="bg-surface rounded-[18px] p-5 border-2 border-border shadow-hard-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Rechercher par nom ou numéro WhatsApp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base bg-surface-alt rounded-[16px] border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
            />
          </div>

          {/* Filtre Date */}
          <div className="flex items-center gap-1 bg-surface-alt p-1 rounded-full border-2 border-border text-xs font-medium shrink-0 overflow-x-auto">
            {[
              { id: 'tous', label: 'Tous' },
              { id: 'aujourdhui', label: "Aujourd'hui" },
              { id: 'avenir', label: 'À venir' },
              { id: 'passes', label: 'Passés' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterDate(tab.id as any)}
                className={`px-3.5 py-1.5 min-h-[38px] rounded-full transition-colors flex items-center justify-center cursor-pointer ${
                  filterDate === tab.id
                    ? 'bg-primary text-white font-semibold shadow-hard-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtres secondaires (Statut & Employé) */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Statut :</span>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="p-2 bg-surface-alt border-2 border-border rounded-[14px] text-foreground focus:outline-none text-base min-h-[40px]"
            >
              <option value="tous">Tous les statuts</option>
              <option value="confirme">Confirmé</option>
              <option value="termine">Terminé</option>
              <option value="en_attente">En attente</option>
              <option value="absent">Absent</option>
              <option value="annule">Annulé</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Praticienne :</span>
            <select
              value={filterEmploye}
              onChange={(e) => setFilterEmploye(e.target.value)}
              className="p-2 bg-surface-alt border-2 border-border rounded-[14px] text-foreground focus:outline-none text-base min-h-[40px]"
            >
              <option value="tous">Toute l'équipe</option>
              {employes.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.prenom} {emp.nom}
                </option>
              ))}
            </select>
          </div>

          <span className="ml-auto text-muted-foreground font-medium">
            {filteredRdvs.length} résultat{filteredRdvs.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* LISTE DES RENDEZ-VOUS */}
      <div className="bg-surface rounded-[18px] border-2 border-border shadow-hard-sm overflow-hidden">
        {filteredRdvs.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-2">
            <Calendar className="w-10 h-10 mx-auto opacity-30 text-primary" />
            <p className="text-sm font-semibold text-foreground">Aucun rendez-vous trouvé</p>
            <p className="text-xs">Modifiez vos critères de recherche ou planifiez un nouveau rendez-vous.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredRdvs.map((rdv) => (
              <div
                key={rdv.id}
                onClick={() => handleOpenRdv(rdv)}
                className="p-4 sm:p-5 hover:bg-surface-alt/50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Infos principales */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-[16px] bg-primary/10 border border-primary/20 text-primary flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold tabular-nums">{formatHeure(rdv.debut)}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{formatHeure(rdv.fin)}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                      <h3 className="font-bold text-foreground text-sm md:text-base break-words">
                        {rdv.client?.nom || rdv.client_nom || 'Client inconnu'}
                      </h3>
                      {getStatusBadge(rdv.statut)}
                      {rdv.source === 'en_ligne' && (
                        <span className="text-[10px] bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-medium shrink-0">
                          En ligne
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground mt-1 min-w-0">
                      <span className="font-semibold text-foreground break-words">
                        {rdv.service?.nom}
                      </span>
                      <span>•</span>
                      <span className="text-primary font-bold tabular-nums">{formatFCFA(rdv.prix_fcfa)}</span>
                      <span>•</span>
                      <span>{rdv.employe?.prenom || 'Coiffeuse'}</span>
                      <span>•</span>
                      <span>{formatDateHuman(rdv.debut)}</span>
                    </div>

                    {(rdv.client?.telephone || rdv.client_telephone) && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 truncate">
                        <Phone className="w-3 h-3 text-success shrink-0" />
                        <span className="truncate">{formatPhoneDisplay(rdv.client?.telephone || rdv.client_telephone || '')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton d'action WhatsApp */}
                <div
                  className="flex items-center gap-2 self-start sm:self-end md:self-center shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <WhatsAppButton rdv={rdv} salon={salon} variant="button" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        salon={salon}
        rdv={selectedRdv}
        employes={employes}
        services={services}
        clients={clients}
        onSuccess={() => loadData(true)}
      />
    </div>
  );
};
