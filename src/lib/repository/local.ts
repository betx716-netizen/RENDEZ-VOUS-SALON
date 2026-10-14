// Implémentation démo : tout est stocké dans le navigateur (localStorage).
// Utilisée quand Supabase n'est pas configuré, ou pour le salon de démonstration.
import type {
  Salon,
  Employe,
  Service,
  HoraireEmploye,
  Conge,
  Client,
  RendezVous,
} from '../../types/database';
import {
  INITIAL_SALON,
  INITIAL_SERVICES,
  INITIAL_EMPLOYES,
  INITIAL_HORAIRES,
  INITIAL_CLIENTS,
  INITIAL_RENDEZ_VOUS,
  INITIAL_CONGES,
} from '../mock-data';
import type { Repository } from './types';

export const DEMO_SALON_SLUG = INITIAL_SALON.slug;

// Clés LocalStorage (inchangées : les données de démo déjà présentes dans les navigateurs restent lisibles)
const STORAGE_PREFIX = 'rdv_salon_';
const STORAGE_KEYS = {
  SALON: `${STORAGE_PREFIX}salon`,
  SALONS_LIST: `${STORAGE_PREFIX}salons_list`,
  SERVICES: `${STORAGE_PREFIX}services`,
  EMPLOYES: `${STORAGE_PREFIX}employes`,
  HORAIRES: `${STORAGE_PREFIX}horaires`,
  CLIENTS: `${STORAGE_PREFIX}clients`,
  RENDEZ_VOUS: `${STORAGE_PREFIX}rendez_vous`,
  CONGES: `${STORAGE_PREFIX}conges`,
};

function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(val) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage`, err);
  }
}

// Notifie les autres pages et onglets ouverts (même navigateur) qu'un RDV a changé
function notifyRdvSync(rdv?: RendezVous): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('rdv_updated', { detail: rdv }));
  } catch {}
  try {
    const bc = new BroadcastChannel('salon_rdv_sync');
    bc.postMessage({ type: 'RDV_SYNC', rdv });
    bc.close();
  } catch {}
}

const isDemoSalon = (salonId: string) => salonId === INITIAL_SALON.id || salonId === 'demo';
const appartientAuSalon = (salonId: string, itemSalonId?: string) =>
  itemSalonId === salonId || (isDemoSalon(salonId) && (!itemSalonId || itemSalonId === INITIAL_SALON.id));

const dixDerniersChiffres = (tel: string) => tel.replace(/\D/g, '').slice(-10);

const horairesParDefaut = (salonId: string, employeId: string): HoraireEmploye[] =>
  Array.from({ length: 7 }, (_, jour) => ({
    salon_id: salonId,
    employe_id: employeId,
    jour_semaine: jour,
    est_ouvert: jour !== 0,
    heure_debut: '08:30',
    heure_fin: '19:00',
    pause_debut: '13:00',
    pause_fin: '14:00',
  }));

function enregistrerSalon(salon: Salon): void {
  setLocalItem(STORAGE_KEYS.SALON, salon);
  const salonsList = getLocalItem<Salon[]>(STORAGE_KEYS.SALONS_LIST, [INITIAL_SALON]);
  const idx = salonsList.findIndex((s) => s.id === salon.id);
  if (idx !== -1) salonsList[idx] = salon;
  else salonsList.push(salon);
  setLocalItem(STORAGE_KEYS.SALONS_LIST, salonsList);
}

function trouverOuCreerClientLocal(salonId: string, nouveau: { nom: string; telephone: string }): Client {
  const chiffres = dixDerniersChiffres(nouveau.telephone);
  if (!nouveau.nom.trim()) throw new Error('Saisissez le nom de la cliente.');
  if (chiffres.length < 8) throw new Error('Numéro de téléphone invalide (ex : +225 07 00 00 00 00).');

  const clients = getLocalItem<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  const existant = clients.find(
    (c) => appartientAuSalon(salonId, c.salon_id) && dixDerniersChiffres(c.telephone) === chiffres
  );
  if (existant) return existant;

  const client: Client = {
    id: `cli-${Date.now()}`,
    salon_id: salonId,
    nom: nouveau.nom.trim(),
    telephone: nouveau.telephone.trim(),
    email: '',
    notes: '',
    nb_absences: 0,
    total_depense: 0,
    nb_visites: 0,
    created_at: new Date().toISOString(),
  };
  clients.push(client);
  setLocalItem(STORAGE_KEYS.CLIENTS, clients);
  return client;
}

export const localRepository: Repository = {
  // ---------------------------------------------------------------- Salon
  async getOwnerSalon(userId) {
    const salonsList = getLocalItem<Salon[]>(STORAGE_KEYS.SALONS_LIST, []);
    return (
      salonsList.find((s) => s.proprietaire_id === userId) ||
      getLocalItem<Salon>(STORAGE_KEYS.SALON, INITIAL_SALON)
    );
  },

  async createSalon(data) {
    const salon: Salon = {
      id: `sal-${Date.now()}`,
      ...data,
      delai_min_heures: 2,
      delai_max_jours: 60,
      pas_creneau_minutes: 30,
      message_rappel:
        'Bonjour {client}, nous vous rappelons votre rendez-vous pour {service} le {date} à {heure} chez {salon}. Merci de confirmer votre présence.',
      created_at: new Date().toISOString(),
    };
    enregistrerSalon(salon);
    return salon;
  },

  async updateSalon(salonId, updates) {
    const salonsList = getLocalItem<Salon[]>(STORAGE_KEYS.SALONS_LIST, [INITIAL_SALON]);
    const actuel =
      salonsList.find((s) => s.id === salonId) || getLocalItem<Salon>(STORAGE_KEYS.SALON, INITIAL_SALON);
    const updated = { ...actuel, ...updates, id: salonId, updated_at: new Date().toISOString() };
    enregistrerSalon(updated);
    return updated;
  },

  async isSlugAvailable(slug, exceptSalonId) {
    const salonsList = getLocalItem<Salon[]>(STORAGE_KEYS.SALONS_LIST, [INITIAL_SALON]);
    return !salonsList.some((s) => s.slug === slug && s.id !== exceptSalonId);
  },

  resetToDemo() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },

  // ---------------------------------------------------------------- Prestations
  async getServices(salonId) {
    const allServices = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const salonServices = allServices.filter((s) => appartientAuSalon(salonId, s.salon_id));
    if (salonServices.length > 0) return salonServices;

    // Démo : un nouveau salon reçoit un jeu de prestations d'exemple modifiables
    const clonedDefaults = INITIAL_SERVICES.map((s) => ({
      ...s,
      id: `srv-${s.id}-${salonId.substring(0, 8)}`,
      salon_id: salonId,
    }));
    setLocalItem(STORAGE_KEYS.SERVICES, [...allServices, ...clonedDefaults]);
    return clonedDefaults;
  },

  async saveService(service) {
    const services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const serviceId = service.id || `srv-${Date.now()}`;
    const saved: Service = {
      id: serviceId,
      salon_id: service.salon_id,
      nom: service.nom || 'Nouveau service',
      categorie: service.categorie || 'Autre',
      duree_minutes: service.duree_minutes || 45,
      prix_fcfa: service.prix_fcfa ?? 5000,
      description: service.description || '',
      actif: service.actif ?? true,
      created_at: service.created_at || new Date().toISOString(),
    };

    const index = services.findIndex((s) => s.id === serviceId);
    if (index !== -1) {
      services[index] = { ...services[index], ...saved };
      setLocalItem(STORAGE_KEYS.SERVICES, services);
      return services[index];
    }

    services.push(saved);
    setLocalItem(STORAGE_KEYS.SERVICES, services);

    // Une nouvelle prestation est proposée par défaut à toute l'équipe du salon
    const employes = getLocalItem<Employe[]>(STORAGE_KEYS.EMPLOYES, INITIAL_EMPLOYES);
    employes.forEach((emp) => {
      if (emp.salon_id === service.salon_id) {
        emp.services_ids = Array.from(new Set([...(emp.services_ids || []), serviceId]));
      }
    });
    setLocalItem(STORAGE_KEYS.EMPLOYES, employes);
    return saved;
  },

  async deleteService(id) {
    const services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    setLocalItem(STORAGE_KEYS.SERVICES, services.filter((s) => s.id !== id));
  },

  // ---------------------------------------------------------------- Équipe
  async getEmployes(salonId) {
    const allEmployes = getLocalItem<Employe[]>(STORAGE_KEYS.EMPLOYES, INITIAL_EMPLOYES);
    const salonEmps = allEmployes.filter((e) => appartientAuSalon(salonId, e.salon_id));
    if (salonEmps.length > 0) return salonEmps;

    // Démo : un nouveau salon reçoit une équipe d'exemple et ses horaires
    const clonedEmps = INITIAL_EMPLOYES.map((e) => ({
      ...e,
      id: `emp-${e.id}-${salonId.substring(0, 8)}`,
      salon_id: salonId,
    }));
    setLocalItem(STORAGE_KEYS.EMPLOYES, [...allEmployes, ...clonedEmps]);
    const allHoraires = getLocalItem<HoraireEmploye[]>(STORAGE_KEYS.HORAIRES, INITIAL_HORAIRES);
    setLocalItem(STORAGE_KEYS.HORAIRES, [
      ...allHoraires,
      ...clonedEmps.flatMap((ce) => horairesParDefaut(salonId, ce.id)),
    ]);
    return clonedEmps;
  },

  async saveEmploye(employe) {
    const employes = getLocalItem<Employe[]>(STORAGE_KEYS.EMPLOYES, INITIAL_EMPLOYES);
    const estNouveau = !employe.id || !employes.some((e) => e.id === employe.id);
    const empId = employe.id || `emp-${Date.now()}`;
    const saved: Employe = {
      id: empId,
      salon_id: employe.salon_id,
      nom: employe.nom || 'Employé',
      role: employe.role || 'Coiffeur',
      telephone: employe.telephone || '',
      couleur_agenda: employe.couleur_agenda || '#6A4CF5',
      actif: employe.actif ?? true,
      services_ids: employe.services_ids || [],
      created_at: employe.created_at || new Date().toISOString(),
    };

    if (!estNouveau) {
      const idx = employes.findIndex((e) => e.id === empId);
      employes[idx] = { ...employes[idx], ...saved };
      setLocalItem(STORAGE_KEYS.EMPLOYES, employes);
      return employes[idx];
    }

    employes.push(saved);
    setLocalItem(STORAGE_KEYS.EMPLOYES, employes);
    // Horaires par défaut uniquement à la création : une modification ne doit pas écraser l'existant
    const horaires = getLocalItem<HoraireEmploye[]>(STORAGE_KEYS.HORAIRES, INITIAL_HORAIRES);
    setLocalItem(STORAGE_KEYS.HORAIRES, [...horaires, ...horairesParDefaut(employe.salon_id, empId)]);
    return saved;
  },

  async deleteEmploye(id) {
    const employes = getLocalItem<Employe[]>(STORAGE_KEYS.EMPLOYES, INITIAL_EMPLOYES);
    setLocalItem(STORAGE_KEYS.EMPLOYES, employes.filter((e) => e.id !== id));
  },

  // ---------------------------------------------------------------- Horaires & congés
  async getHoraires(salonId) {
    const allHoraires = getLocalItem<HoraireEmploye[]>(STORAGE_KEYS.HORAIRES, INITIAL_HORAIRES);
    return allHoraires.filter((h) => appartientAuSalon(salonId, h.salon_id));
  },

  async saveHoraire(horaire) {
    const horaires = getLocalItem<HoraireEmploye[]>(STORAGE_KEYS.HORAIRES, INITIAL_HORAIRES);
    const idx = horaires.findIndex(
      (h) => h.employe_id === horaire.employe_id && h.jour_semaine === horaire.jour_semaine
    );
    if (idx !== -1) horaires[idx] = horaire;
    else horaires.push(horaire);
    setLocalItem(STORAGE_KEYS.HORAIRES, horaires);
  },

  async getConges(salonId) {
    const conges = getLocalItem<Conge[]>(STORAGE_KEYS.CONGES, INITIAL_CONGES);
    return conges.filter((c) => appartientAuSalon(salonId, c.salon_id));
  },

  async saveConge(conge) {
    const conges = getLocalItem<Conge[]>(STORAGE_KEYS.CONGES, INITIAL_CONGES);
    const saved: Conge = { ...conge, id: `cng-${Date.now()}` };
    conges.push(saved);
    setLocalItem(STORAGE_KEYS.CONGES, conges);
    return saved;
  },

  async deleteConge(id) {
    const conges = getLocalItem<Conge[]>(STORAGE_KEYS.CONGES, INITIAL_CONGES);
    setLocalItem(STORAGE_KEYS.CONGES, conges.filter((c) => c.id !== id));
  },

  // ---------------------------------------------------------------- Clients
  async getClients(salonId) {
    const clients = getLocalItem<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS).filter((c) =>
      appartientAuSalon(salonId, c.salon_id)
    );
    const rdvs = await localRepository.getRendezVous(salonId);

    return clients.map((c) => {
      const siens = rdvs.filter((r) => r.client_id === c.id);
      const termines = siens.filter((r) => r.statut === 'termine');
      return {
        ...c,
        total_depense: termines.reduce((sum, r) => sum + (r.prix_fcfa || 0), 0),
        nb_visites: termines.length,
        nb_absences: siens.filter((r) => r.statut === 'absent').length,
      };
    });
  },

  async saveClient(client) {
    const clients = getLocalItem<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    const clientId = client.id || `cli-${Date.now()}`;
    const saved: Client = {
      id: clientId,
      salon_id: client.salon_id,
      nom: client.nom || 'Client',
      telephone: client.telephone || '',
      email: client.email || '',
      notes: client.notes || '',
      nb_absences: client.nb_absences || 0,
      total_depense: client.total_depense || 0,
      nb_visites: client.nb_visites || 0,
      created_at: client.created_at || new Date().toISOString(),
    };

    const idx = clients.findIndex((c) => c.id === clientId);
    if (idx !== -1) clients[idx] = { ...clients[idx], ...saved };
    else clients.push(saved);
    setLocalItem(STORAGE_KEYS.CLIENTS, clients);
    return idx !== -1 ? clients[idx] : saved;
  },

  // ---------------------------------------------------------------- Rendez-vous (gérant)
  async getRendezVous(salonId) {
    const rdvs = getLocalItem<RendezVous[]>(STORAGE_KEYS.RENDEZ_VOUS, INITIAL_RENDEZ_VOUS).filter((r) =>
      appartientAuSalon(salonId, r.salon_id)
    );
    const clients = getLocalItem<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    const employes = getLocalItem<Employe[]>(STORAGE_KEYS.EMPLOYES, INITIAL_EMPLOYES);
    const services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);

    return rdvs
      .map((r) => ({
        ...r,
        client: clients.find((c) => c.id === r.client_id) || r.client,
        employe: employes.find((e) => e.id === r.employe_id) || r.employe,
        service: services.find((s) => s.id === r.service_id) || r.service,
      }))
      .sort((a, b) => new Date(b.debut).getTime() - new Date(a.debut).getTime());
  },

  async updateStatutRendezVous(rdvId, statut) {
    const rdvs = getLocalItem<RendezVous[]>(STORAGE_KEYS.RENDEZ_VOUS, INITIAL_RENDEZ_VOUS);
    const rdv = rdvs.find((r) => r.id === rdvId);
    if (!rdv) throw new Error('Rendez-vous introuvable.');
    rdv.statut = statut;
    setLocalItem(STORAGE_KEYS.RENDEZ_VOUS, rdvs);
    notifyRdvSync(rdv);
  },

  async moveRendezVous(rdvId, debut, fin, employeId) {
    const rdvs = getLocalItem<RendezVous[]>(STORAGE_KEYS.RENDEZ_VOUS, INITIAL_RENDEZ_VOUS);
    const target = rdvs.find((r) => r.id === rdvId);
    if (!target) throw new Error('Rendez-vous introuvable.');

    const empId = employeId || target.employe_id;
    const collision = rdvs.some(
      (r) =>
        r.id !== rdvId &&
        r.employe_id === empId &&
        r.statut !== 'annule' &&
        new Date(r.debut) < new Date(fin) &&
        new Date(r.fin) > new Date(debut)
    );
    if (collision) throw new Error('Ce créneau chevauche un autre rendez-vous de ce membre de l’équipe.');

    target.debut = debut;
    target.fin = fin;
    target.employe_id = empId;
    setLocalItem(STORAGE_KEYS.RENDEZ_VOUS, rdvs);
    notifyRdvSync(target);
  },

  async createManualRendezVous(p) {
    const services = await localRepository.getServices(p.salonId);
    const service = services.find((s) => s.id === p.serviceId);
    if (!service) throw new Error('Prestation introuvable.');

    let clientId = p.clientId;
    if (!clientId) {
      if (!p.nouveauClient) throw new Error('Choisissez une cliente ou saisissez son nom et son numéro.');
      clientId = trouverOuCreerClientLocal(p.salonId, p.nouveauClient).id;
    }

    const debut = new Date(p.debut);
    const fin = new Date(debut.getTime() + service.duree_minutes * 60000);
    const rdvs = getLocalItem<RendezVous[]>(STORAGE_KEYS.RENDEZ_VOUS, INITIAL_RENDEZ_VOUS);
    const conflit = rdvs.some(
      (r) => r.employe_id === p.employeId && r.statut !== 'annule' && new Date(r.debut) < fin && new Date(r.fin) > debut
    );
    if (conflit) throw new Error('Ce créneau chevauche un autre rendez-vous de ce membre de l’équipe.');

    const rdv: RendezVous = {
      id: `rdv-man-${Date.now()}`,
      salon_id: p.salonId,
      client_id: clientId,
      employe_id: p.employeId,
      service_id: p.serviceId,
      debut: debut.toISOString(),
      fin: fin.toISOString(),
      statut: p.statut || 'confirme',
      prix_fcfa: service.prix_fcfa,
      notes: p.notes || '',
      token_annulation: `tok-man-${Date.now()}`,
      source: 'manuel',
      created_at: new Date().toISOString(),
    };
    rdvs.unshift(rdv);
    setLocalItem(STORAGE_KEYS.RENDEZ_VOUS, rdvs);
    notifyRdvSync(rdv);
    return (await localRepository.getRendezVous(p.salonId)).find((r) => r.id === rdv.id) || rdv;
  },

  // ---------------------------------------------------------------- Parcours public
  async getPublicBookingData(slug) {
    const salonsList = getLocalItem<Salon[]>(STORAGE_KEYS.SALONS_LIST, []);
    // Démo : un lien inconnu affiche le salon de démonstration pour pouvoir tester le parcours
    const salon =
      salonsList.find((s) => s.slug === slug) || getLocalItem<Salon>(STORAGE_KEYS.SALON, INITIAL_SALON);

    const [services, employes, horaires, conges, rendezVous] = await Promise.all([
      localRepository.getServices(salon.id),
      localRepository.getEmployes(salon.id),
      localRepository.getHoraires(salon.id),
      localRepository.getConges(salon.id),
      localRepository.getRendezVous(salon.id),
    ]);
    return {
      salon,
      services: services.filter((s) => s.actif),
      employes: employes.filter((e) => e.actif),
      horaires,
      conges,
      rendezVous,
    };
  },

  async bookPublicAppointment(params) {
    const services = await localRepository.getServices(params.salonId);
    const service = services.find((s) => s.id === params.serviceId);
    if (!service) return { success: false, error: 'Prestation introuvable.' };
    const employes = await localRepository.getEmployes(params.salonId);
    const employe = employes.find((e) => e.id === params.employeId) || employes[0];
    if (!employe) return { success: false, error: 'Aucun coiffeur disponible pour ce créneau.' };

    const client = trouverOuCreerClientLocal(params.salonId, {
      nom: params.clientNom,
      telephone: params.clientTelephone,
    });
    if (params.clientEmail && !client.email) {
      await localRepository.saveClient({ ...client, email: params.clientEmail.trim() });
    }

    const debut = new Date(params.debut);
    const fin = new Date(debut.getTime() + service.duree_minutes * 60000);
    const rdvs = getLocalItem<RendezVous[]>(STORAGE_KEYS.RENDEZ_VOUS, INITIAL_RENDEZ_VOUS);
    const conflit = rdvs.some(
      (r) => r.employe_id === employe.id && r.statut !== 'annule' && new Date(r.debut) < fin && new Date(r.fin) > debut
    );
    if (conflit) return { success: false, error: 'Ce créneau vient d’être pris, choisissez-en un autre.' };

    const token = `tok-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
    const rdv: RendezVous = {
      id: `rdv-${Date.now()}`,
      salon_id: params.salonId,
      client_id: client.id,
      employe_id: employe.id,
      service_id: service.id,
      debut: debut.toISOString(),
      fin: fin.toISOString(),
      statut: 'confirme',
      prix_fcfa: service.prix_fcfa,
      notes: params.notes || '',
      token_annulation: token,
      source: 'en_ligne',
      created_at: new Date().toISOString(),
    };
    rdvs.unshift(rdv);
    setLocalItem(STORAGE_KEYS.RENDEZ_VOUS, rdvs);
    notifyRdvSync(rdv);

    return { success: true, token_annulation: token, rdv_id: rdv.id, employe_nom: employe.nom };
  },

  async getReservationByToken(token) {
    const rdvs = await localRepository.getRendezVous(INITIAL_SALON.id);
    const toutes = getLocalItem<RendezVous[]>(STORAGE_KEYS.RENDEZ_VOUS, INITIAL_RENDEZ_VOUS);
    const brut = toutes.find((r) => r.token_annulation === token);
    if (!brut) return null;
    const rdv = rdvs.find((r) => r.id === brut.id) || brut;

    const salonsList = getLocalItem<Salon[]>(STORAGE_KEYS.SALONS_LIST, []);
    const salon =
      salonsList.find((s) => s.id === rdv.salon_id) || getLocalItem<Salon>(STORAGE_KEYS.SALON, INITIAL_SALON);
    const services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    const employes = getLocalItem<Employe[]>(STORAGE_KEYS.EMPLOYES, INITIAL_EMPLOYES);
    const clients = getLocalItem<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    const srv = rdv.service || services.find((s) => s.id === rdv.service_id);
    const emp = rdv.employe || employes.find((e) => e.id === rdv.employe_id);
    const cli = rdv.client || clients.find((c) => c.id === rdv.client_id);

    return {
      id: rdv.id,
      debut: rdv.debut,
      fin: rdv.fin,
      statut: rdv.statut,
      prix_fcfa: rdv.prix_fcfa,
      service_nom: srv?.nom || 'Prestation',
      duree_minutes: srv?.duree_minutes || 60,
      salon_nom: salon.nom,
      salon_slug: salon.slug,
      salon_telephone: salon.telephone,
      salon_adresse: salon.adresse,
      salon_ville: salon.ville,
      employe_nom: emp?.nom || 'Notre équipe',
      client_nom: cli?.nom || 'Client',
      client_telephone: cli?.telephone || '',
    };
  },

  async cancelByToken(token, motif) {
    const rdvs = getLocalItem<RendezVous[]>(STORAGE_KEYS.RENDEZ_VOUS, INITIAL_RENDEZ_VOUS);
    const rdv = rdvs.find((r) => r.token_annulation === token);
    if (!rdv) return { success: false, message: 'Rendez-vous introuvable' };
    if (rdv.statut === 'annule') return { success: true, message: 'Ce rendez-vous est déjà annulé' };
    if (rdv.statut === 'termine' || rdv.statut === 'absent' || new Date(rdv.debut) <= new Date()) {
      return { success: false, message: 'Impossible d’annuler un rendez-vous déjà passé' };
    }

    rdv.statut = 'annule';
    if (motif) rdv.notes = (rdv.notes ? rdv.notes + ' ' : '') + `[Annulé par le client: ${motif}]`;
    setLocalItem(STORAGE_KEYS.RENDEZ_VOUS, rdvs);
    notifyRdvSync(rdv);
    return { success: true, message: 'Rendez-vous annulé avec succès' };
  },
};
