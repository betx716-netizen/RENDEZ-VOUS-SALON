import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Scissors, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { RendezVous, StatutRendezVous, Employe, Service, Client, Salon } from '../types/database';
import { formatFCFA, formatPhoneDisplay, formatHeure, formatJour, formatDuree } from '../lib/utils';
import { isoToSalonInputs, salonInputToIso } from '../lib/timezone';
import { repository } from '../lib/repository';
import { WhatsAppButton } from './WhatsAppButton';
import { useToast } from '../context/ToastContext';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  rdv?: RendezVous | null;
  /** Créneau cliqué dans l'agenda (heure murale du salon) */
  initialDate?: Date;
  initialEmployeId?: string;
  employes: Employe[];
  services: Service[];
  /** Facultatif : chargés par la fenêtre elle-même s'ils ne sont pas fournis */
  clients?: Client[];
  /** Appelé après chaque modification réussie, pour recharger la page */
  onSuccess?: () => void;
}

const STATUT_LABELS: Record<StatutRendezVous, string> = {
  confirme: 'Confirmé',
  en_attente: 'En attente',
  termine: 'Terminé',
  annule: 'Annulé',
  absent: 'Marqué comme absent',
};

const NOUVELLE_CLIENTE = '__nouvelle__';

const fieldClass =
  'w-full text-base p-3 rounded-[14px] border-2 border-ink bg-surface text-ink focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[48px]';

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  salon,
  rdv,
  initialDate,
  initialEmployeId,
  employes,
  services,
  clients: clientsProp,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const isEditing = !!rdv;
  const servicesActifs = services.filter((s) => s.actif);
  const employesActifs = employes.filter((e) => e.actif);

  const [clients, setClients] = useState<Client[]>(clientsProp || []);

  // Nouveau RDV manuel
  const [selectedClientId, setSelectedClientId] = useState(NOUVELLE_CLIENTE);
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauTel, setNouveauTel] = useState('+225 ');
  const [selectedEmployeId, setSelectedEmployeId] = useState(initialEmployeId || employesActifs[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(servicesActifs[0]?.id || '');
  const [dateStr, setDateStr] = useState(isoToSalonInputs(new Date()).date);
  const [timeStr, setTimeStr] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Déplacement d'un RDV existant
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [reschedDate, setReschedDate] = useState('');
  const [reschedTime, setReschedTime] = useState('');
  const [reschedEmployeId, setReschedEmployeId] = useState('');

  useEffect(() => {
    if (clientsProp) setClients(clientsProp);
    else if (isOpen && !rdv) {
      repository.getClients(salon.id).then(setClients).catch((err) => console.error('Chargement clients :', err));
    }
  }, [clientsProp, isOpen, rdv, salon.id]);

  useEffect(() => {
    if (rdv) {
      const { date, time } = isoToSalonInputs(rdv.debut);
      setReschedDate(date);
      setReschedTime(time);
      setReschedEmployeId(rdv.employe_id);
    } else {
      // Les lignes de l'agenda représentent déjà des heures du salon
      if (initialDate) {
        setDateStr(format(initialDate, 'yyyy-MM-dd'));
        setTimeStr(format(initialDate, 'HH:mm'));
      }
      if (initialEmployeId) setSelectedEmployeId(initialEmployeId);
    }
  }, [rdv, initialDate, initialEmployeId]);

  if (!isOpen) return null;

  const terminer = (message: string) => {
    success(message);
    onSuccess?.();
    onClose();
  };

  const handleUpdateStatus = async (statut: StatutRendezVous) => {
    if (!rdv) return;
    setLoading(true);
    try {
      await repository.updateStatutRendezVous(rdv.id, statut);
      terminer(`Statut mis à jour : ${STATUT_LABELS[statut]}`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Erreur de mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedEmployeId) {
      error('Choisissez une prestation et un membre de l’équipe');
      return;
    }
    const estNouvelle = selectedClientId === NOUVELLE_CLIENTE;
    if (estNouvelle && (!nouveauNom.trim() || nouveauTel.replace(/\D/g, '').length < 8)) {
      error('Saisissez le nom et le numéro de la cliente');
      return;
    }

    setLoading(true);
    try {
      await repository.createManualRendezVous({
        salonId: salon.id,
        clientId: estNouvelle ? undefined : selectedClientId,
        nouveauClient: estNouvelle ? { nom: nouveauNom.trim(), telephone: nouveauTel.trim() } : undefined,
        employeId: selectedEmployeId,
        serviceId: selectedServiceId,
        debut: salonInputToIso(dateStr, timeStr),
        notes: notes.trim() || undefined,
      });
      terminer('Rendez-vous planifié');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rdv) return;

    setLoading(true);
    try {
      const debut = salonInputToIso(reschedDate, reschedTime);
      const duree = rdv.service?.duree_minutes || Math.round((new Date(rdv.fin).getTime() - new Date(rdv.debut).getTime()) / 60000);
      const fin = new Date(new Date(debut).getTime() + duree * 60000).toISOString();
      await repository.moveRendezVous(rdv.id, debut, fin, reschedEmployeId || undefined);
      terminer('Rendez-vous déplacé');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Erreur lors du déplacement');
    } finally {
      setLoading(false);
    }
  };

  const statutButtons: { statut: StatutRendezVous; label: string; className: string }[] = [
    { statut: 'confirme', label: 'Confirmer', className: 'bg-primary text-white' },
    { statut: 'termine', label: 'Terminé', className: 'bg-lime text-ink' },
    { statut: 'absent', label: 'Absent', className: 'bg-candy text-ink' },
    { statut: 'annule', label: 'Annuler', className: 'bg-surface text-ink' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Fiche rendez-vous' : 'Nouveau rendez-vous'}
        className="relative w-full max-w-lg bg-surface rounded-[18px] shadow-hard-lg p-6 sm:p-8 border-2 border-ink my-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-5 right-5 p-2 text-ink rounded-full border-2 border-ink bg-surface hover:bg-lime transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isEditing && rdv ? (
          /* DÉTAILS D'UN RENDEZ-VOUS EXISTANT */
          <div className="space-y-6">
            <div className="pr-12">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-ink bg-candy border-2 border-ink rounded-full px-3 py-0.5 -rotate-2">
                Fiche rendez-vous
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-ink mt-2">
                {rdv.client?.nom || rdv.client_nom || 'Client'}
              </h2>
            </div>

            <div className="bg-surface-alt rounded-[16px] p-4 sm:p-5 border-2 border-ink space-y-3">
              <div className="flex items-center justify-between gap-3 pb-2 border-b-2 border-dashed border-ink">
                <span className="font-bold text-sm text-ink flex items-center gap-2">
                  <Scissors className="w-4 h-4 shrink-0" />
                  <span>{rdv.service?.nom}</span>
                </span>
                <span className="font-bold text-ink tabular-nums bg-sun border-2 border-ink rounded-full px-2.5 py-0.5 shrink-0">
                  {formatFCFA(rdv.prix_fcfa)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="text-ink font-medium first-letter:uppercase">{formatJour(rdv.debut)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="text-ink font-medium">
                    {formatHeure(rdv.debut)}
                    {rdv.service?.duree_minutes ? ` (${formatDuree(rdv.service.duree_minutes)})` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 shrink-0" />
                  <span className="text-ink font-medium">{rdv.employe?.nom || 'Équipe'}</span>
                </div>
                {rdv.client?.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span className="text-ink font-medium">{formatPhoneDisplay(rdv.client.telephone)}</span>
                  </div>
                )}
              </div>

              {rdv.notes && (
                <div className="mt-2 pt-2 border-t-2 border-dashed border-ink text-sm text-ink italic">
                  « {rdv.notes} »
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <WhatsAppButton rdv={rdv} salon={salon} />
              <button
                type="button"
                onClick={() => setIsRescheduling(!isRescheduling)}
                aria-expanded={isRescheduling}
                className="px-4 py-2 text-sm font-bold text-ink underline decoration-2 underline-offset-4 decoration-primary cursor-pointer min-h-[44px]"
              >
                {isRescheduling ? 'Masquer le déplacement' : 'Déplacer le créneau'}
              </button>
            </div>

            {isRescheduling && (
              <form onSubmit={handleRescheduleSubmit} className="p-4 bg-surface-alt rounded-[16px] border-2 border-ink space-y-3">
                <span className="text-sm font-bold text-ink block">Déplacer vers un nouveau créneau :</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    aria-label="Nouvelle date"
                    value={reschedDate}
                    onChange={(e) => setReschedDate(e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    type="time"
                    required
                    aria-label="Nouvelle heure"
                    value={reschedTime}
                    onChange={(e) => setReschedTime(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <select
                  aria-label="Membre de l’équipe"
                  value={reschedEmployeId}
                  onChange={(e) => setReschedEmployeId(e.target.value)}
                  className={fieldClass}
                >
                  {employesActifs.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.prenom} {emp.nom}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="press w-full py-3 rounded-full bg-primary text-white border-2 border-ink text-sm font-bold shadow-hard-sm min-h-[48px] cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Déplacement...' : 'Valider le déplacement'}
                </button>
              </form>
            )}

            <div className="space-y-2 pt-3 border-t-2 border-ink">
              <span className="text-xs font-bold text-ink uppercase tracking-wider block">
                Modifier le statut :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {statutButtons.map((b) => (
                  <button
                    key={b.statut}
                    type="button"
                    onClick={() => handleUpdateStatus(b.statut)}
                    disabled={loading || rdv.statut === b.statut}
                    className={`press p-2.5 rounded-full text-sm font-bold border-2 border-ink shadow-hard-sm min-h-[44px] disabled:opacity-40 cursor-pointer ${b.className}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* FORMULAIRE NOUVEAU RDV MANUEL */
          <div className="space-y-5">
            <div className="pr-12">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-ink bg-lime border-2 border-ink rounded-full px-3 py-0.5 -rotate-2">
                Agenda du salon
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-ink mt-2">
                Nouveau rendez-vous
              </h2>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="rdv-client" className="block text-sm font-bold text-ink">
                  Cliente
                </label>
                <select
                  id="rdv-client"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className={fieldClass}
                >
                  <option value={NOUVELLE_CLIENTE}>+ Nouvelle cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} ({formatPhoneDisplay(c.telephone)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedClientId === NOUVELLE_CLIENTE && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-[16px] bg-surface-alt border-2 border-dashed border-ink">
                  <div className="space-y-1.5">
                    <label htmlFor="rdv-nouveau-nom" className="block text-sm font-bold text-ink">Nom *</label>
                    <input
                      id="rdv-nouveau-nom"
                      type="text"
                      value={nouveauNom}
                      onChange={(e) => setNouveauNom(e.target.value)}
                      placeholder="Ex : Aminata Koné"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="rdv-nouveau-tel" className="block text-sm font-bold text-ink">Téléphone *</label>
                    <input
                      id="rdv-nouveau-tel"
                      type="tel"
                      value={nouveauTel}
                      onChange={(e) => setNouveauTel(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <p className="sm:col-span-2 text-xs text-muted-foreground">
                    Si ce numéro existe déjà, le rendez-vous est rattaché à la fiche existante.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="rdv-service" className="block text-sm font-bold text-ink">Prestation *</label>
                <select
                  id="rdv-service"
                  required
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className={fieldClass}
                >
                  {servicesActifs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom} ({formatDuree(s.duree_minutes)} · {formatFCFA(s.prix_fcfa)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="rdv-employe" className="block text-sm font-bold text-ink">Avec *</label>
                <select
                  id="rdv-employe"
                  required
                  value={selectedEmployeId}
                  onChange={(e) => setSelectedEmployeId(e.target.value)}
                  className={fieldClass}
                >
                  {employesActifs.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.prenom} {emp.nom} · {emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="rdv-date" className="block text-sm font-bold text-ink">Date *</label>
                  <input
                    id="rdv-date"
                    type="date"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="rdv-heure" className="block text-sm font-bold text-ink">Heure *</label>
                  <input
                    id="rdv-heure"
                    type="time"
                    required
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="rdv-notes" className="block text-sm font-bold text-ink">Remarques (optionnel)</label>
                <textarea
                  id="rdv-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex : tresses avec mèches fournies..."
                  className={fieldClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading || servicesActifs.length === 0 || employesActifs.length === 0}
                className="press w-full py-3.5 px-6 rounded-full bg-lime text-ink border-2 border-ink font-bold text-base shadow-hard-md min-h-[52px] cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer le rendez-vous'}
              </button>
              {(servicesActifs.length === 0 || employesActifs.length === 0) && (
                <p className="text-xs font-bold text-destructive text-center">
                  Ajoutez d'abord au moins une prestation active et un membre de l'équipe.
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
