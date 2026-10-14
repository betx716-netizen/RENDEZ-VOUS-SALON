import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Scissors,
  CheckCircle,
  MessageCircle,
  Edit2,
  X,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { repository } from '../lib/repository';
import { Client, RendezVous } from '../types/database';
import { formatFCFA, formatPhoneDisplay, buildWhatsAppLink, formatDateHuman } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const ClientsPage: React.FC = () => {
  const { salon } = useAuth();
  const { success, error } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fiche client sélectionné
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Modal Ajout/Édition
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [formNom, setFormNom] = useState('');
  const [formTelephone, setFormTelephone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const loadData = async (silent = false) => {
    if (!salon) return;
    if (!silent) setLoading(true);
    try {
      const [clis, rdvs] = await Promise.all([
        repository.getClients(salon.id),
        repository.getRendezVous(salon.id),
      ]);
      setClients(clis);
      setRendezVous(rdvs);
      if (selectedClient) {
        const refreshed = clis.find((c) => c.id === selectedClient.id);
        if (refreshed) setSelectedClient(refreshed);
      }
    } catch (err) {
      console.error('Erreur chargement clients:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!salon) return;
    loadData();

    const handleSync = () => {
      loadData(true);
    };

    window.addEventListener('rdv_updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('salon_rdv_sync');
      bc.onmessage = () => handleSync();
    } catch {}

    const interval = setInterval(() => handleSync(), 10000);

    return () => {
      window.removeEventListener('rdv_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [salon]);

  if (!salon) return null;

  const filteredClients = clients.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.nom.toLowerCase().includes(q) ||
      c.telephone.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    );
  });

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormNom('');
    setFormTelephone('+225 ');
    setFormEmail('');
    setFormNotes('');
    setEditModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormNom(client.nom);
    setFormTelephone(client.telephone);
    setFormEmail(client.email || '');
    setFormNotes(client.notes || '');
    setEditModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom.trim() || !formTelephone.trim()) {
      error('Le nom et le numéro de téléphone sont requis.');
      return;
    }

    try {
      const saved = await repository.saveClient({
        id: editingClient?.id,
        salon_id: salon.id,
        nom: formNom.trim(),
        telephone: formTelephone.trim(),
        email: formEmail.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });

      success(editingClient ? 'Client mis à jour !' : 'Nouveau client ajouté !');
      setEditModalOpen(false);
      await loadData();
      if (selectedClient?.id === saved.id) {
        setSelectedClient(saved);
      }
    } catch (err: any) {
      error(err?.message || 'Erreur lors de l’enregistrement');
    }
  };

  // Historique des rendez-vous pour le client sélectionné
  const clientHistory = selectedClient
    ? rendezVous
        .filter((r) => r.client_id === selectedClient.id)
        .sort((a, b) => new Date(b.debut).getTime() - new Date(a.debut).getTime())
    : [];

  const getClientStats = (client: Client) => {
    const clientRdvs = rendezVous.filter((r) => r.client_id === client.id);
    const activeOrFinished = clientRdvs.filter((r) => r.statut === 'termine' || r.statut === 'confirme');
    const computedSpent = activeOrFinished.reduce((sum, r) => sum + (r.prix_fcfa || 0), 0);
    const computedVisits = activeOrFinished.length;
    const computedAbsences = clientRdvs.filter((r) => r.statut === 'absent').length;
    return {
      total_depense: Math.max(client.total_depense || 0, computedSpent),
      nb_visites: Math.max(client.nb_visites || 0, computedVisits),
      nb_absences: Math.max(client.nb_absences || 0, computedAbsences),
    };
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-8 py-4 sm:py-8 max-w-7xl mx-auto space-y-6 box-border min-w-0">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full min-w-0 box-border">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-extrabold text-foreground break-words">Fichier Clients</h2>
          <p className="text-xs text-muted-foreground mt-0.5 break-words">
            Historique de visites, total dépensé en FCFA, notes capillaires et suivi des absences
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold press bg-primary text-white border-2 border-ink rounded-xl shadow-hard-sm transition-colors self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau client</span>
        </button>
      </div>

      {/* RECHERCHE */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher par nom ou numéro de téléphone ivoirien (+225 07...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-base bg-white rounded-2xl border-2 border-border shadow-hard-sm focus:outline-none focus:border-primary focus:shadow-hard-sm"
        />
      </div>

      {/* GRILLE : LISTE & FICHE DÉTAILLÉE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LISTE DES CLIENTS */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-border shadow-hard-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} enregistré{filteredClients.length > 1 ? 's' : ''}
            </span>
          </div>

          {filteredClients.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <User className="w-10 h-10 mx-auto mb-2 opacity-30 text-muted-foreground" />
              <p className="text-sm font-medium">Aucun client trouvé</p>
            </div>
          ) : (
            <div className="divide-y divide-border/15">
              {filteredClients.map((c) => {
                const isSelected = selectedClient?.id === c.id;
                const stats = getClientStats(c);
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClient(c)}
                    className={`p-4 hover:bg-surface-alt transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected ? 'bg-primary/10 border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-surface-alt text-foreground font-bold flex items-center justify-center shrink-0 text-sm">
                        {c.nom.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <h4 className="font-bold text-foreground text-sm break-words">{c.nom}</h4>
                          {stats.nb_absences > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-destructive/10 text-destructive flex items-center gap-1 shrink-0">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{stats.nb_absences} absence{stats.nb_absences > 1 ? 's' : ''}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 truncate">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{formatPhoneDisplay(c.telephone)}</span>
                        </div>

                        {c.notes && (
                          <p className="text-[11px] text-muted-foreground mt-1 italic line-clamp-1 break-words">
                            "{c.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col sm:items-end justify-between items-center text-xs shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <span className="font-extrabold text-primary text-sm">
                        {formatFCFA(stats.total_depense)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {stats.nb_visites} visite{stats.nb_visites > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FICHE CLIENT DÉTAILLÉE */}
        <div className="bg-white rounded-2xl border-2 border-border shadow-hard-sm p-6 sticky top-6">
          {selectedClient ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedClient.nom}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Fiche profil client</p>
                </div>
                <button
                  onClick={() => handleOpenEdit(selectedClient)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg border-2 border-border hover:bg-surface-alt transition-colors"
                  title="Modifier les coordonnées"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* STATS RAPIDES CLIENT */}
              {(() => {
                const sStats = getClientStats(selectedClient);
                return (
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-surface-alt rounded-xl border-2 border-border">
                      <span className="text-[11px] text-muted-foreground font-semibold block uppercase">Total Dépensé</span>
                      <span className="text-base font-extrabold text-primary">
                        {formatFCFA(sStats.total_depense)}
                      </span>
                    </div>
                    <div className="p-3 bg-surface-alt rounded-xl border-2 border-border">
                      <span className="text-[11px] text-muted-foreground font-semibold block uppercase">Visites</span>
                      <span className="text-base font-extrabold text-foreground">
                        {sStats.nb_visites}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* COORDONNÉES */}
              <div className="space-y-2.5 text-xs text-muted-foreground bg-surface-alt p-3.5 rounded-xl border-2 border-border">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold">{formatPhoneDisplay(selectedClient.telephone)}</span>
                </div>
                {selectedClient.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <span>{selectedClient.email}</span>
                  </div>
                )}
                {selectedClient.nb_absences > 0 && (
                  <div className="flex items-center gap-2.5 text-destructive font-semibold pt-1 border-t border-border">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{selectedClient.nb_absences} rendez-vous non honoré(s) (no-show)</span>
                  </div>
                )}
              </div>

              {/* NOTES PARTICULIÈRES */}
              {selectedClient.notes && (
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                    Notes & Préférences
                  </h4>
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary text-xs text-foreground leading-relaxed">
                    {selectedClient.notes}
                  </div>
                </div>
              )}

              {/* BOUTON WHATSAPP */}
              <a
                href={buildWhatsAppLink(
                  selectedClient.telephone,
                  `Bonjour ${selectedClient.nom}, nous vous contactons depuis le salon ${salon.nom}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success hover:bg-success/90 text-white text-xs font-semibold shadow-hard-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contacter sur WhatsApp</span>
              </a>

              {/* HISTORIQUE DES RENDEZ-VOUS */}
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Historique ({clientHistory.length})
                </h4>

                {clientHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3 text-center">Aucun rendez-vous passé</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {clientHistory.map((h) => (
                      <div
                        key={h.id}
                        className="p-2.5 bg-surface-alt rounded-xl border-2 border-border text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-foreground">{h.service?.nom}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDateHuman(h.debut)} • {h.employe?.nom}
                          </p>
                        </div>
                        <span className="font-bold text-primary text-[11px]">
                          {formatFCFA(h.prix_fcfa)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <User className="w-10 h-10 mx-auto mb-2 opacity-30 text-muted-foreground" />
              <p className="text-xs font-semibold">Sélectionnez un client dans la liste</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Pour afficher ses détails, ses notes et son historique de visites.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CRÉATION / MODIFICATION CLIENT */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-hard-lg p-6 border-2 border-border">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-4">
              {editingClient ? 'Modifier le client' : 'Nouveau client'}
            </h3>

            <form onSubmit={handleSaveClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aïcha Traoré"
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Numéro de téléphone (Côte d'Ivoire) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+225 07 12 34 56 78"
                  value={formTelephone}
                  onChange={(e) => setFormTelephone(e.target.value)}
                  className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm font-mono"
                />
                <span className="text-[11px] text-muted-foreground block mt-1">
                  Format recommandé : 07, 05 ou 01 suivi des 8 chiffres.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Email (optionnel)</label>
                <input
                  type="email"
                  placeholder="client@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Notes / Préférences capillaires
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Cuir chevelu sensible, allergique à certains gels, préfère être coiffée par Aminata..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm resize-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
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
