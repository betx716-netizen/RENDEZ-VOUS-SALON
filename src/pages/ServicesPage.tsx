import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Plus,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { repository } from '../lib/repository';
import { Service } from '../types/database';
import { formatFCFA } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const ServicesPage: React.FC = () => {
  const { salon } = useAuth();
  const { success, error } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form states
  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('Coiffure');
  const [dureeMinutes, setDureeMinutes] = useState(60);
  const [prixFcfa, setPrixFcfa] = useState(5000);
  const [description, setDescription] = useState('');
  const [actif, setActif] = useState(true);

  const categories = [
    'Tresses & Nattes',
    'Locks & Nattes',
    'Soins Capillaires',
    'Coiffure & Brushing',
    'Barbier & Homme',
    'Onglerie & Beauté',
    'Autre Prestation',
  ];

  const loadData = async () => {
    if (!salon) return;
    setLoading(true);
    try {
      const data = await repository.getServices(salon.id);
      setServices(data);
    } catch (err) {
      console.error('Erreur chargement services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [salon]);

  if (!salon) return null;

  const publicUrl = `/s/${salon.slug}`;

  const handleOpenCreate = () => {
    setEditingService(null);
    setNom('');
    setCategorie('Tresses & Nattes');
    setDureeMinutes(60);
    setPrixFcfa(10000);
    setDescription('');
    setActif(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService(srv);
    setNom(srv.nom);
    setCategorie(srv.categorie);
    setDureeMinutes(srv.duree_minutes);
    setPrixFcfa(srv.prix_fcfa);
    setDescription(srv.description || '');
    setActif(srv.actif);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      error('Le nom du service est requis');
      return;
    }

    try {
      await repository.saveService({
        id: editingService?.id,
        salon_id: salon.id,
        nom: nom.trim(),
        categorie,
        duree_minutes: Number(dureeMinutes),
        prix_fcfa: Number(prixFcfa),
        description: description.trim() || undefined,
        actif,
      });

      success(editingService ? 'Prestation modifiée avec succès !' : 'Nouvelle prestation ajoutée !');
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      error(err?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleToggleActif = async (srv: Service) => {
    try {
      await repository.saveService({
        ...srv,
        actif: !srv.actif,
      });
      success(`Prestation ${!srv.actif ? 'activée' : 'désactivée'}`);
      await loadData();
    } catch {
      error('Erreur de mise à jour');
    }
  };

  const handleDelete = async (id: string, srvNom: string) => {
    if (confirm(`Voulez-vous vraiment supprimer la prestation "${srvNom}" ?`)) {
      try {
        await repository.deleteService(id);
        success('Prestation supprimée');
        await loadData();
      } catch {
        error('Erreur lors de la suppression');
      }
    }
  };

  // Grouper par catégorie
  const groupedServices: Record<string, Service[]> = {};
  services.forEach((s) => {
    if (!groupedServices[s.categorie]) {
      groupedServices[s.categorie] = [];
    }
    groupedServices[s.categorie].push(s);
  });

  return (
    <div className="w-full max-w-full px-4 sm:px-8 py-4 sm:py-8 max-w-7xl mx-auto space-y-6 box-border min-w-0">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full min-w-0 box-border">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-extrabold text-foreground break-words">Prestations & Tarifs (FCFA)</h2>
          <p className="text-xs text-muted-foreground mt-0.5 break-words">
            Configurez vos services, durées et prix affichés sur votre page de réservation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold bg-surface-alt hover:bg-surface-alt text-foreground rounded-xl transition-colors border-2 border-border"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Voir la page client</span>
          </a>

          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold press bg-primary text-white border-2 border-ink rounded-xl shadow-hard-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une prestation</span>
          </button>
        </div>
      </div>

      {/* LISTE GROUPÉE PAR CATÉGORIE */}
      {Object.keys(groupedServices).length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-border p-12 text-center text-muted-foreground">
          <Scissors className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground">Aucune prestation</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Ajoutez vos tresses, coupes ou soins pour permettre aux clients de réserver en ligne.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedServices).map(([cat, items]) => (
            <div key={cat} className="bg-white rounded-2xl border-2 border-border shadow-hard-sm overflow-hidden">
              <div className="bg-surface-alt px-6 py-3 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <span>{cat}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-alt text-foreground">
                    {items.length}
                  </span>
                </h3>
              </div>

              <div className="divide-y divide-border/15">
                {items.map((srv) => (
                  <div
                    key={srv.id}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      !srv.actif ? 'bg-surface-alt opacity-60' : 'hover:bg-primary/15'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground text-sm md:text-base">{srv.nom}</h4>
                        {!srv.actif && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-alt text-muted-foreground">
                            Désactivé
                          </span>
                        )}
                      </div>

                      {srv.description && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                          {srv.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{srv.duree_minutes} min</span>
                        </span>
                        <span>•</span>
                        <span className="font-bold text-primary text-sm">
                          {formatFCFA(srv.prix_fcfa)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleActif(srv)}
                        className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                          srv.actif
                            ? 'bg-success/10 text-success border-success hover:bg-success/15'
                            : 'bg-surface-alt text-muted-foreground border-border hover:bg-surface-alt'
                        }`}
                        title={srv.actif ? 'Désactiver' : 'Activer'}
                      >
                        {srv.actif ? 'Actif' : 'Inactif'}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(srv)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface-alt rounded-xl border-2 border-border transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(srv.id, srv.nom)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl border-2 border-border transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL AJOUT / ÉDITION SERVICE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-hard-lg p-6 border-2 border-border">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-4">
              {editingService ? 'Modifier la prestation' : 'Nouvelle prestation'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nom de la prestation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tresses Knotless dos avec mèches"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Catégorie *</label>
                  <select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Durée (minutes) *
                  </label>
                  <select
                    value={dureeMinutes}
                    onChange={(e) => setDureeMinutes(Number(e.target.value))}
                    className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1h (60 min)</option>
                    <option value={75}>1h15 (75 min)</option>
                    <option value={90}>1h30 (90 min)</option>
                    <option value={105}>1h45 (105 min)</option>
                    <option value={120}>2h (120 min)</option>
                    <option value={150}>2h30 (150 min)</option>
                    <option value={180}>3h (180 min)</option>
                    <option value={210}>3h30 (210 min)</option>
                    <option value={240}>4h (240 min)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Prix en FCFA (XOF) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={500}
                    min={0}
                    required
                    value={prixFcfa}
                    onChange={(e) => setPrixFcfa(Number(e.target.value))}
                    className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm font-semibold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-muted-foreground">
                    FCFA
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Description / Conseils pour le client
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Mèches fournies, shampoing inclus, prévoir cheveux propres..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="srvActif"
                  checked={actif}
                  onChange={(e) => setActif(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="srvActif" className="text-xs font-medium text-foreground">
                  Visible et disponible à la réservation en ligne
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 min-h-[44px] text-xs font-medium text-muted-foreground bg-surface-alt hover:bg-surface-alt rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors shadow-hard-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
