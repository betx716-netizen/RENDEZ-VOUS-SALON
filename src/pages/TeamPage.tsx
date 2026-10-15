import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  Check,
  X,
  Phone,
  Scissors,
  Coffee,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { repository } from '../lib/repository';
import { Employe, HoraireEmploye, Conge, Service } from '../types/database';
import { formatDateShort, formatPhoneDisplay } from '../lib/utils';
import { salonInputToIso } from '../lib/timezone';
import { useToast } from '../context/ToastContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const DAYS_NAMES = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

const PRESET_COLORS = [
  '#D97706', // Ambre doré
  '#2563EB', // Bleu royal
  '#9333EA', // Violet chic
  '#E11D48', // Rose framboise
  '#059669', // Émeraude
  '#475569', // Ardoise
  '#D946EF', // Fuchsia
  '#EA580C', // Orange coucher de soleil
];

export const TeamPage: React.FC = () => {
  const { salon } = useAuth();
  const { success, error } = useToast();

  const [employes, setEmployes] = useState<Employe[]>([]);
  const [horaires, setHoraires] = useState<HoraireEmploye[]>([]);
  const [conges, setConges] = useState<Conge[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Employé sélectionné pour la gestion des horaires
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  // Modals
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employe | null>(null);
  const [congeModalOpen, setCongeModalOpen] = useState(false);
  // Empêche le double-clic de créer deux fois la même fiche ou la même absence
  const [enregistrement, setEnregistrement] = useState(false);

  // Form states Employé
  const [empNom, setEmpNom] = useState('');
  const [empRole, setEmpRole] = useState('Coiffeur / Styliste');
  const [empTel, setEmpTel] = useState('+225 ');
  const [empColor, setEmpColor] = useState(PRESET_COLORS[0]);
  const [empServices, setEmpServices] = useState<string[]>([]);

  // Form states Congé
  const [congeDebut, setCongeDebut] = useState('');
  const [congeFin, setCongeFin] = useState('');
  const [congeMotif, setCongeMotif] = useState('Congé annuel');

  const loadData = async () => {
    if (!salon) return;
    setLoading(true);
    try {
      const [emps, hors, cngs, srvs] = await Promise.all([
        repository.getEmployes(salon.id),
        repository.getHoraires(salon.id),
        repository.getConges(salon.id),
        repository.getServices(salon.id),
      ]);
      setEmployes(emps);
      setHoraires(hors);
      setConges(cngs);
      setServices(srvs);
      if (!selectedEmpId && emps.length > 0) {
        setSelectedEmpId(emps[0].id);
      }
    } catch (err) {
      console.error('Erreur chargement équipe:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [salon]);

  if (!salon) return null;

  const currentSelectedEmp = employes.find((e) => e.id === selectedEmpId) || employes[0];

  // Gestion Employé Modal
  const handleOpenCreateEmp = () => {
    setEditingEmp(null);
    setEmpNom('');
    setEmpRole('Coiffeur / Styliste');
    setEmpTel('+225 ');
    setEmpColor(PRESET_COLORS[employes.length % PRESET_COLORS.length]);
    setEmpServices(services.map((s) => s.id));
    setEmpModalOpen(true);
  };

  const handleOpenEditEmp = (emp: Employe) => {
    setEditingEmp(emp);
    setEmpNom(emp.nom);
    setEmpRole(emp.role);
    setEmpTel(emp.telephone || '+225 ');
    setEmpColor(emp.couleur_agenda);
    setEmpServices(emp.services_ids || services.map((s) => s.id));
    setEmpModalOpen(true);
  };

  const handleSaveEmp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empNom.trim()) {
      error('Le nom est requis');
      return;
    }
    if (enregistrement) return;

    setEnregistrement(true);
    try {
      const saved = await repository.saveEmploye({
        id: editingEmp?.id,
        salon_id: salon.id,
        nom: empNom.trim(),
        role: empRole.trim(),
        telephone: empTel.trim(),
        couleur_agenda: empColor,
        services_ids: empServices,
      });

      success(editingEmp ? 'Employé modifié' : 'Nouvel employé ajouté avec horaires par défaut !');
      setEmpModalOpen(false);
      await loadData();
      setSelectedEmpId(saved.id);
    } catch (err: any) {
      error(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setEnregistrement(false);
    }
  };

  const handleDeleteEmp = async (id: string, nom: string) => {
    if (confirm(`Supprimer définitivement l'employé "${nom}" ?`)) {
      try {
        await repository.deleteEmploye(id);
        success('Employé retiré');
        await loadData();
        if (selectedEmpId === id) {
          setSelectedEmpId(employes.find((e) => e.id !== id)?.id || '');
        }
      } catch {
        error('Erreur de suppression');
      }
    }
  };

  // Mise à jour rapide des horaires d'un jour pour l'employé sélectionné
  const handleUpdateHoraire = async (
    jourSemaine: number,
    updates: Partial<HoraireEmploye>
  ) => {
    if (!currentSelectedEmp) return;
    const existing = horaires.find(
      (h) => h.employe_id === currentSelectedEmp.id && h.jour_semaine === jourSemaine
    );

    const updatedHoraire: HoraireEmploye = {
      salon_id: salon.id,
      employe_id: currentSelectedEmp.id,
      jour_semaine: jourSemaine,
      est_ouvert: existing ? existing.est_ouvert : true,
      heure_debut: existing ? existing.heure_debut : '08:30',
      heure_fin: existing ? existing.heure_fin : '19:00',
      pause_debut: existing ? existing.pause_debut : '13:00',
      pause_fin: existing ? existing.pause_fin : '14:00',
      ...updates,
    };

    try {
      await repository.saveHoraire(updatedHoraire);
      setHoraires((prev) => {
        const next = [...prev];
        const idx = next.findIndex(
          (h) => h.employe_id === currentSelectedEmp.id && h.jour_semaine === jourSemaine
        );
        if (idx !== -1) next[idx] = updatedHoraire;
        else next.push(updatedHoraire);
        return next;
      });
      success('Horaires mis à jour');
    } catch {
      error('Erreur lors de la mise à jour des horaires');
    }
  };

  // Congés
  const handleSaveConge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedEmp || !congeDebut || !congeFin) {
      error('Veuillez renseigner les dates');
      return;
    }
    if (congeFin < congeDebut) {
      error('La date de fin doit être après la date de début');
      return;
    }
    if (enregistrement) return;

    setEnregistrement(true);
    try {
      await repository.saveConge({
        salon_id: salon.id,
        employe_id: currentSelectedEmp.id,
        // Jours entiers chez le salon, date de fin incluse (un congé « du 15 au 15 » bloque tout le 15)
        debut: salonInputToIso(congeDebut, '00:00'),
        fin: new Date(new Date(salonInputToIso(congeFin, '00:00')).getTime() + 24 * 3600 * 1000).toISOString(),
        motif: congeMotif,
      });

      success('Absence / Congé enregistré');
      setCongeModalOpen(false);
      setCongeDebut('');
      setCongeFin('');
      await loadData();
    } catch {
      error('Erreur lors de l’enregistrement du congé');
    } finally {
      setEnregistrement(false);
    }
  };

  const handleDeleteConge = async (id: string) => {
    try {
      await repository.deleteConge(id);
      success('Congé supprimé');
      await loadData();
    } catch {
      error('Erreur lors de la suppression');
    }
  };

  const currentEmpConges = conges.filter(
    (c) => currentSelectedEmp && c.employe_id === currentSelectedEmp.id
  );

  return (
    <div className="w-full max-w-full px-4 sm:px-8 py-4 sm:py-8 max-w-7xl mx-auto space-y-6 box-border min-w-0">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full min-w-0 box-border">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-extrabold text-foreground break-words">Équipe & Horaires de travail</h2>
          <p className="text-xs text-muted-foreground mt-0.5 break-words">
            Gérez vos coiffeurs, barbiers, esthéticiennes, plannings hebdomadaires et congés
          </p>
        </div>

        <button
          onClick={handleOpenCreateEmp}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold press bg-primary text-white border-2 border-ink rounded-xl shadow-hard-sm transition-colors self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un employé</span>
        </button>
      </div>

      {/* SÉLECTEUR D'EMPLOYÉ EN ONGLETS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full max-w-full min-w-0">
        {employes.map((emp) => {
          const isSelected = currentSelectedEmp?.id === emp.id;
          return (
            <button
              key={emp.id}
              onClick={() => setSelectedEmpId(emp.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-white border-primary text-foreground shadow-hard-sm ring-2 ring-primary/20'
                  : 'bg-surface-alt border-border text-muted-foreground hover:bg-white'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: emp.couleur_agenda }}
              />
              <span className="truncate">{emp.nom}</span>
              <span className="text-[10px] text-muted-foreground font-normal">({emp.role})</span>
            </button>
          );
        })}
      </div>

      {/* DÉTAIL ET CONFIGURATION DE L'EMPLOYÉ SÉLECTIONNÉ */}
      {currentSelectedEmp ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* COLONNE GAUCHE : INFOS EMPLOYÉ & SERVICES */}
          <div className="bg-white rounded-2xl border-2 border-border shadow-hard-sm p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-hard-sm"
                  style={{ backgroundColor: currentSelectedEmp.couleur_agenda }}
                >
                  {currentSelectedEmp.nom.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg leading-tight">
                    {currentSelectedEmp.nom}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentSelectedEmp.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditEmp(currentSelectedEmp)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface-alt rounded-lg"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEmp(currentSelectedEmp.id, currentSelectedEmp.nom)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {currentSelectedEmp.telephone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface-alt p-3 rounded-xl border-2 border-border">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>{formatPhoneDisplay(currentSelectedEmp.telephone)}</span>
              </div>
            )}

            {/* CONGÉS & ABSENCES */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Congés & Absences</span>
                </h4>
                <button
                  onClick={() => setCongeModalOpen(true)}
                  className="text-xs font-semibold text-primary hover:text-primary-hover"
                >
                  + Ajouter
                </button>
              </div>

              {currentEmpConges.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">Aucun congé planifié</p>
              ) : (
                <div className="space-y-2">
                  {currentEmpConges.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 bg-destructive/10 rounded-xl border border-destructive text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-foreground block">{c.motif}</span>
                        <span className="text-[10px] text-destructive">
                          {/* La fin est stockée au début du jour suivant : on affiche le dernier jour inclus */}
                          Du {formatDateShort(c.debut)} au{' '}
                          {formatDateShort(new Date(new Date(c.fin).getTime() - 1))}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteConge(c.id)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE : HORAIRES HEBDOMADAIRES (Lundi à Dimanche) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-border shadow-hard-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Planning hebdomadaire de {currentSelectedEmp.nom}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ces horaires servent à calculer les créneaux disponibles pour vos clients
                </p>
              </div>
            </div>

            <div className="divide-y divide-border/15">
              {/* Afficher du Lundi (1) au Samedi (6) puis Dimanche (0) */}
              {[1, 2, 3, 4, 5, 6, 0].map((jour) => {
                const h = horaires.find(
                  (item) =>
                    item.employe_id === currentSelectedEmp.id && item.jour_semaine === jour
                ) || {
                  jour_semaine: jour,
                  est_ouvert: jour !== 0,
                  heure_debut: '08:30',
                  heure_fin: '19:00',
                  pause_debut: '13:00',
                  pause_fin: '14:00',
                };

                return (
                  <div key={jour} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="w-32 flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id={`jour-${jour}`}
                        checked={h.est_ouvert}
                        onChange={(e) =>
                          handleUpdateHoraire(jour, { est_ouvert: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={`jour-${jour}`}
                        className={`text-xs font-bold cursor-pointer ${
                          h.est_ouvert ? 'text-foreground' : 'text-muted-foreground line-through'
                        }`}
                      >
                        {DAYS_NAMES[jour]}
                      </label>
                    </div>

                    {h.est_ouvert ? (
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
                        {/* Heure ouverture */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground text-[11px]">De</span>
                          <input
                            type="time"
                            value={h.heure_debut}
                            onChange={(e) =>
                              handleUpdateHoraire(jour, { heure_debut: e.target.value })
                            }
                            className="p-1.5 border-2 border-border rounded-lg text-base bg-surface-alt font-mono"
                          />
                          <span className="text-muted-foreground text-[11px]">à</span>
                          <input
                            type="time"
                            value={h.heure_fin}
                            onChange={(e) =>
                              handleUpdateHoraire(jour, { heure_fin: e.target.value })
                            }
                            className="p-1.5 border-2 border-border rounded-lg text-base bg-surface-alt font-mono"
                          />
                        </div>

                        {/* Pause déjeuner */}
                        <div className="flex items-center gap-1.5 bg-surface-alt px-2 py-1 rounded-lg border-2 border-border">
                          <Coffee className="w-3 h-3 text-primary shrink-0" />
                          <span className="text-[10px] text-muted-foreground">Pause :</span>
                          <input
                            type="time"
                            value={h.pause_debut || '13:00'}
                            onChange={(e) =>
                              handleUpdateHoraire(jour, { pause_debut: e.target.value })
                            }
                            className="p-1 border-2 border-border rounded text-base bg-white font-mono"
                          />
                          <span className="text-[10px] text-muted-foreground">-</span>
                          <input
                            type="time"
                            value={h.pause_fin || '14:00'}
                            onChange={(e) =>
                              handleUpdateHoraire(jour, { pause_fin: e.target.value })
                            }
                            className="p-1 border-2 border-border rounded text-base bg-white font-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Repos / Fermé</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center text-muted-foreground border-2 border-border">
          <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-30 text-muted-foreground" />
          <p className="text-sm font-semibold">Aucun membre dans l'équipe</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ajoutez au moins un employé pour démarrer les prises de rendez-vous.
          </p>
        </div>
      )}

      {/* MODAL CRÉATION / ÉDITION EMPLOYÉ */}
      {empModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-hard-lg p-6 border-2 border-border">
            <button
              onClick={() => setEmpModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-4">
              {editingEmp ? "Modifier l'employé" : 'Ajouter un employé'}
            </h3>

            <form onSubmit={handleSaveEmp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aminata Kouassi"
                  value={empNom}
                  onChange={(e) => setEmpNom(e.target.value)}
                  className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Rôle / Spécialité *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Spécialiste Tresses & Locks, Barbier..."
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  placeholder="+225 07 12 34 56 78"
                  value={empTel}
                  onChange={(e) => setEmpTel(e.target.value)}
                  className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm font-mono"
                />
              </div>

              {/* Choix couleur planning */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Couleur sur l'agenda
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEmpColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        empColor === c ? 'scale-125 ring-2 ring-foreground ring-offset-2' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEmpModalOpen(false)}
                  className="flex-1 py-2.5 min-h-[44px] text-xs font-medium text-muted-foreground bg-surface-alt hover:bg-surface-alt rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={enregistrement}
                  className="flex-1 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors shadow-hard-sm disabled:opacity-60 disabled:cursor-wait"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJOUT CONGÉ */}
      {congeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-hard-lg p-6 border-2 border-border">
            <button
              onClick={() => setCongeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-4">
              Enregistrer une absence pour {currentSelectedEmp?.nom}
            </h3>

            <form onSubmit={handleSaveConge} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Motif de l'absence *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Congé annuel, Maladie, Formation..."
                  value={congeMotif}
                  onChange={(e) => setCongeMotif(e.target.value)}
                  className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    required
                    value={congeDebut}
                    onChange={(e) => setCongeDebut(e.target.value)}
                    className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Date de fin *
                  </label>
                  <input
                    type="date"
                    required
                    value={congeFin}
                    onChange={(e) => setCongeFin(e.target.value)}
                    className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCongeModalOpen(false)}
                  className="flex-1 py-2.5 min-h-[44px] text-xs font-medium text-muted-foreground bg-surface-alt hover:bg-surface-alt rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={enregistrement}
                  className="flex-1 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors shadow-hard-sm disabled:opacity-60 disabled:cursor-wait"
                >
                  Valider l'absence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
