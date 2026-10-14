import React, { useState, useEffect } from 'react';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
  addMinutes,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Sparkles,
  User,
  Scissors,
  CheckCircle,
  CalendarX,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { repository } from '../lib/repository';
import {
  RendezVous,
  Employe,
  Service,
  Client,
  StatutRendezVous,
} from '../types/database';
import { formatFCFA, formatHeure } from '../lib/utils';
import { isSameSalonDay, salonParts, salonToday } from '../lib/timezone';
import { AppointmentModal } from '../components/AppointmentModal';
import { useToast } from '../context/ToastContext';

export const AgendaPage: React.FC = () => {
  const { salon } = useAuth();
  const { success, error } = useToast();

  // Jour affiché : un jour calendaire du salon
  const [currentDate, setCurrentDate] = useState<Date>(salonToday());
  const [viewMode, setViewMode] = useState<'jour' | 'semaine'>('jour');
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [initialSlotDate, setInitialSlotDate] = useState<Date | undefined>(undefined);
  const [initialEmployeId, setInitialEmployeId] = useState<string | undefined>(undefined);

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
      console.error('Erreur chargement agenda:', err);
      if (!silent) error(err instanceof Error ? err.message : 'Impossible de charger l’agenda');
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

  // Navigation dans le calendrier
  const handlePrev = () => {
    setCurrentDate((prev) => (viewMode === 'jour' ? subDays(prev, 1) : subDays(prev, 7)));
  };

  const handleNext = () => {
    setCurrentDate((prev) => (viewMode === 'jour' ? addDays(prev, 1) : addDays(prev, 7)));
  };

  const handleToday = () => {
    setCurrentDate(salonToday());
  };

  const handleOpenSlot = (date: Date, empId?: string) => {
    setSelectedRdv(null);
    setInitialSlotDate(date);
    setInitialEmployeId(empId);
    setModalOpen(true);
  };

  const handleOpenRdv = (rdv: RendezVous) => {
    setSelectedRdv(rdv);
    setInitialSlotDate(undefined);
    setInitialEmployeId(undefined);
    setModalOpen(true);
  };

  // Semaine
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Heures d'ouverture
  const heureDebut = salon.heure_ouverture ? parseInt(salon.heure_ouverture.split(':')[0], 10) : 8;
  const heureFin = salon.heure_fermeture ? parseInt(salon.heure_fermeture.split(':')[0], 10) : 19;
  const timeSlots: number[] = [];
  for (let h = heureDebut; h < heureFin; h++) {
    timeSlots.push(h);
  }

  // Libellé écrit + couleur de statut (JAMAIS la couleur seule)
  const getStatusInfo = (statut: StatutRendezVous) => {
    switch (statut) {
      case 'termine':
        return { label: 'Terminé', badgeClass: 'bg-success text-white', borderClass: 'border-success' };
      case 'confirme':
        return { label: 'Confirmé', badgeClass: 'bg-primary text-white', borderClass: 'border-primary' };
      case 'absent':
        return { label: 'Absent', badgeClass: 'bg-destructive text-white', borderClass: 'border-destructive' };
      case 'annule':
        return { label: 'Annulé', badgeClass: 'bg-muted-foreground text-white', borderClass: 'border-border line-through' };
      default:
        return { label: 'En attente', badgeClass: 'bg-gold text-foreground', borderClass: 'border-gold' };
    }
  };

  // Placement à l'heure du salon, quel que soit le fuseau de l'appareil
  const getRdvsForEmployeeAndDate = (empId: string, date: Date) => {
    return rendezVous.filter((r) => {
      if (r.employe_id !== empId) return false;
      if (r.statut === 'annule') return false;
      return isSameSalonDay(r.debut, date);
    });
  };

  const dayAllRdvs = rendezVous.filter(
    (r) => isSameSalonDay(r.debut, currentDate) && r.statut !== 'annule'
  );

  return (
    <div className="w-full max-w-full px-4 sm:px-8 py-4 sm:py-8 space-y-6 mx-auto box-border min-w-0">
      {/* HEADER AGENDA AVEC ACTIONS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-[18px] border-2 border-ink shadow-hard-md w-full max-w-full min-w-0 box-border">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-[14px] bg-sun border-2 border-ink text-ink flex items-center justify-center shrink-0 -rotate-6">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold font-display text-foreground capitalize leading-none">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {viewMode === 'jour'
                ? format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })
                : `Semaine du ${format(weekDays[0], 'd MMM', { locale: fr })} au ${format(weekDays[6], 'd MMM yyyy', { locale: fr })}`}
            </p>
          </div>
        </div>

        {/* Commandes de navigation et bascule de vue */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto shrink-0">
          <div className="flex items-center bg-surface-alt p-1 rounded-full border-2 border-border">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label="Période précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3.5 py-1.5 text-xs font-semibold text-foreground hover:text-primary rounded-full cursor-pointer"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label="Période suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-surface-alt p-1 rounded-full border-2 border-border">
            <button
              type="button"
              onClick={() => setViewMode('jour')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                viewMode === 'jour'
                  ? 'bg-primary text-white shadow-hard-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Jour
            </button>
            <button
              type="button"
              onClick={() => setViewMode('semaine')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer min-h-[38px] ${
                viewMode === 'semaine'
                  ? 'bg-primary text-white shadow-hard-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semaine
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenSlot(setHours(currentDate, 10))}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full press bg-primary text-white border-2 border-ink text-xs sm:text-sm font-semibold shadow-hard-md min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau RDV</span>
          </button>
        </div>
      </div>

      {/* ÉTAT VIDE SI AUCUN RENDEZ-VOUS DANS LA JOURNÉE */}
      {viewMode === 'jour' && dayAllRdvs.length === 0 && (
        <div className="bg-surface rounded-[18px] p-8 sm:p-12 text-center border-2 border-border shadow-hard-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <CalendarX className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-bold text-lg font-display text-foreground">
              Aucun rendez-vous pour cette date
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              L'agenda est entièrement libre pour le {format(currentDate, 'd MMMM yyyy', { locale: fr })}. Vous pouvez enregistrer une réservation manuelle ou partager votre lien de salon.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenSlot(setHours(currentDate, 10))}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full press bg-primary text-white border-2 border-ink text-xs sm:text-sm font-semibold shadow-hard-md min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Planifier un premier rendez-vous</span>
          </button>
        </div>
      )}

      {/* VUE JOUR : COLONNES PAR EMPLOYÉ AVEC COULEUR DÉDIÉE */}
      {viewMode === 'jour' && (
        <div className="bg-surface rounded-[18px] border-2 border-border shadow-hard-sm overflow-x-auto w-full max-w-full min-w-0">
          <div className="min-w-[700px]">
            {/* EN-TÊTE DES COLONNES EMPLOYÉS */}
            <div className="grid border-b-2 border-ink bg-surface-alt/70" style={{ gridTemplateColumns: `80px repeat(${employes.length || 1}, minmax(0, 1fr))` }}>
              <div className="p-3 text-xs font-semibold text-muted-foreground text-center border-r border-ink/15 flex items-center justify-center">
                Heure
              </div>
              {employes.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3.5 text-center border-r border-ink/15 last:border-r-0 space-y-1"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full inline-block shadow-hard-sm ring-1 ring-white"
                      style={{ backgroundColor: emp.couleur_calendrier || '#6A4CF5' }}
                    />
                    <span className="font-bold text-sm text-foreground">
                      {emp.prenom} {emp.nom}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {emp.specialites && emp.specialites.length > 0
                      ? emp.specialites.join(', ')
                      : 'Coiffure'}
                  </p>
                </div>
              ))}
            </div>

            {/* GRILLE HORAIRE */}
            <div className="divide-y divide-ink/15">
              {timeSlots.map((hour) => {
                const slotTime = setMinutes(setHours(currentDate, hour), 0);
                return (
                  <div
                    key={hour}
                    className="grid min-h-[70px]"
                    style={{ gridTemplateColumns: `80px repeat(${employes.length || 1}, minmax(0, 1fr))` }}
                  >
                    <div className="p-2 text-xs tabular-nums font-semibold text-muted-foreground text-center border-r border-ink/15 flex items-center justify-center bg-surface-alt/30">
                      {hour}:00
                    </div>

                    {employes.map((emp) => {
                      const empRdvs = getRdvsForEmployeeAndDate(emp.id, currentDate);
                      const currentRdvs = empRdvs.filter((r) => salonParts(r.debut).hour === hour);

                      return (
                        <div
                          key={emp.id}
                          onClick={() => handleOpenSlot(slotTime, emp.id)}
                          className="p-2 border-r border-ink/15 last:border-r-0 hover:bg-surface-alt/40 transition-colors cursor-pointer relative group flex flex-col justify-start gap-1"
                        >
                          {currentRdvs.map((rdv) => {
                            const status = getStatusInfo(rdv.statut);
                            return (
                              <div
                                key={rdv.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenRdv(rdv);
                                }}
                                className="p-2 rounded-[16px] text-xs bg-surface border shadow-hard-sm cursor-pointer transition-all hover:scale-[1.01]"
                                style={{ borderLeftWidth: '5px', borderLeftColor: emp.couleur_calendrier || '#6A4CF5' }}
                              >
                                <div className="flex items-center justify-between gap-1 pb-1">
                                  <span className="font-bold text-foreground truncate">
                                    {rdv.client?.nom || rdv.client_nom}
                                  </span>
                                  {/* LIBELLÉ ÉCRIT DE STATUT ET COULEUR OBLIGATOIRES */}
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${status.badgeClass}`}>
                                    {status.label}
                                  </span>
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {rdv.service?.nom} • {formatHeure(rdv.debut)} ({rdv.service?.duree_minutes}m)
                                </div>
                              </div>
                            );
                          })}

                          {currentRdvs.length === 0 && (
                            <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-full text-primary text-xs font-semibold">
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              <span>Planifier</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VUE SEMAINE */}
      {viewMode === 'semaine' && (
        <div className="bg-surface rounded-[18px] border-2 border-border shadow-hard-sm overflow-x-auto">
          <div className="min-w-[850px]">
            {/* En-tête des 7 jours */}
            <div className="grid grid-cols-7 border-b-2 border-ink bg-surface-alt/70">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, currentDate);
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setCurrentDate(day)}
                    className={`p-3 text-center border-r border-ink/15 last:border-r-0 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 font-bold' : 'hover:bg-surface-alt'
                    }`}
                  >
                    <span className="text-xs uppercase text-muted-foreground block">
                      {format(day, 'EEE', { locale: fr })}
                    </span>
                    <span className={`text-base font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Contenu des jours de la semaine */}
            <div className="grid grid-cols-7 divide-x divide-border min-h-[450px]">
              {weekDays.map((day) => {
                const dayRdvs = rendezVous.filter(
                  (r) => isSameSalonDay(r.debut, day) && r.statut !== 'annule'
                );

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleOpenSlot(day)}
                    className="p-2 space-y-2 hover:bg-surface-alt/30 transition-colors cursor-pointer"
                  >
                    {dayRdvs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground/40 text-xs py-8">
                        Libre
                      </div>
                    ) : (
                      dayRdvs
                        .sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime())
                        .map((rdv) => {
                          const status = getStatusInfo(rdv.statut);
                          return (
                            <div
                              key={rdv.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRdv(rdv);
                              }}
                              className="p-2 rounded-[14px] text-xs bg-surface border-2 border-border shadow-hard-sm cursor-pointer hover:border-primary/50"
                              style={{ borderLeftWidth: '4px', borderLeftColor: rdv.employe?.couleur_calendrier || '#6A4CF5' }}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-foreground truncate">{rdv.client?.nom || rdv.client_nom}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${status.badgeClass}`}>
                                  {status.label}
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                {formatHeure(rdv.debut)} • {rdv.service?.nom}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CRÉATION / ÉDITION RENDEZ-VOUS */}
      {modalOpen && (
        <AppointmentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            loadData(true);
          }}
          salon={salon}
          services={services}
          employes={employes}
          initialDate={initialSlotDate}
          initialEmployeId={initialEmployeId}
          rdv={selectedRdv}
          clients={clients}
        />
      )}
    </div>
  );
};
