// Implémentation production : uniquement Supabase, jamais de stockage local ni de données de démo.
// Toute erreur est remontée (Error avec message en français) au lieu d'être ignorée en silence.
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type {
  Salon,
  Employe,
  Service,
  HoraireEmploye,
  Conge,
  Client,
  RendezVous,
} from '../../types/database';
import type { PlageConge } from '../slot-calculator';
import type { Repository, ReservationPublique } from './types';

/** Liens réservés au salon de démonstration (servi en local, même en production) */
export const RESERVED_SLUGS = ['demo', 'ebene-et-or-abidjan'];

function db() {
  if (!supabase) throw new Error("La base de données n'est pas configurée.");
  return supabase;
}

const maintenant = () => new Date().toISOString();

const isUuid = (id?: string | null) =>
  !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/** Traduit une erreur Supabase / PostgREST en message affichable */
export function messageErreur(err: unknown, contexte: string): string {
  const e = (err || {}) as Partial<PostgrestError> & { name?: string };
  const msg = (e.message || '').toLowerCase();
  if (msg.includes('failed to fetch') || msg.includes('network') || e.name === 'TypeError') {
    return 'Connexion impossible. Vérifiez votre réseau puis réessayez.';
  }
  switch (e.code) {
    case '23505':
      if (msg.includes('slug')) return 'Ce lien de réservation est déjà pris. Choisissez-en un autre.';
      if (msg.includes('telephone')) return 'Une fiche client existe déjà avec ce numéro.';
      return 'Cet élément existe déjà.';
    case '23P01':
      return 'Ce créneau chevauche un autre rendez-vous de ce membre de l’équipe.';
    case '23503':
      return 'Suppression impossible : des rendez-vous y sont rattachés. Désactivez-le plutôt.';
    case '23514':
      return 'Valeur invalide : vérifiez les dates et les champs saisis.';
    case '22P02':
      return 'Format de donnée invalide.';
    case '42501':
      return 'Action non autorisée. Reconnectez-vous puis réessayez.';
    case 'PGRST116':
      return 'Élément introuvable ou accès refusé.';
  }
  if (msg.includes('row-level security')) return 'Action non autorisée. Reconnectez-vous puis réessayez.';
  return `${contexte} : ${e.message || 'erreur inconnue'}`;
}

function verifier<T>(res: { data: T | null; error: PostgrestError | null }, contexte: string): T {
  if (res.error) throw new Error(messageErreur(res.error, contexte));
  return res.data as T;
}

/** Ne garde que les colonnes réellement présentes en base (le type TS en contient d'autres) */
function colonnes<T extends object>(obj: T, keys: (keyof T)[]): Partial<T> {
  const out: Partial<T> = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

const SALON_COLS: (keyof Salon)[] = [
  'nom', 'slug', 'telephone', 'adresse', 'ville', 'commune', 'description', 'logo_url',
  'delai_min_heures', 'delai_max_jours', 'pas_creneau_minutes', 'message_rappel',
];
const SERVICE_COLS: (keyof Service)[] = ['nom', 'categorie', 'duree_minutes', 'prix_fcfa', 'description', 'actif'];
const EMPLOYE_COLS: (keyof Employe)[] = ['nom', 'telephone', 'role', 'couleur_agenda', 'actif'];
const CLIENT_COLS: (keyof Client)[] = ['nom', 'telephone', 'email', 'notes'];

const hhmm = (t?: string | null) => (t ? t.slice(0, 5) : undefined);

// La base stocke couleur_agenda et la liaison employe_services ; l'interface lit aussi
// couleur_calendrier et services_ids.
function normaliserEmploye(row: any): Employe {
  const { employe_services, ...e } = row;
  return {
    ...e,
    couleur_calendrier: e.couleur_agenda,
    services_ids: Array.isArray(employe_services)
      ? employe_services.map((x: { service_id: string }) => x.service_id)
      : e.services_ids,
  };
}

function normaliserHoraire(h: any): HoraireEmploye {
  return {
    ...h,
    heure_debut: hhmm(h.heure_debut) || '08:30',
    heure_fin: hhmm(h.heure_fin) || '19:00',
    pause_debut: hhmm(h.pause_debut),
    pause_fin: hhmm(h.pause_fin),
  };
}

function normaliserRdv(row: any): RendezVous {
  return { ...row, employe: row.employe ? normaliserEmploye(row.employe) : undefined };
}

const RDV_AVEC_RELATIONS = '*, client:clients(*), employe:employes(*), service:services(*)';

/** Lundi-samedi 8h30-19h, pause 13h-14h, dimanche fermé */
const horairesParDefaut = (salonId: string, employeId: string) =>
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

const dixDerniersChiffres = (tel: string) => tel.replace(/\D/g, '').slice(-10);

async function trouverOuCreerClient(salonId: string, nouveau: { nom: string; telephone: string }): Promise<string> {
  const chiffres = dixDerniersChiffres(nouveau.telephone);
  if (!nouveau.nom.trim()) throw new Error('Saisissez le nom de la cliente.');
  if (chiffres.length < 8) throw new Error('Numéro de téléphone invalide (ex : +225 07 00 00 00 00).');

  const existants = verifier(
    await db().from('clients').select('id, telephone').eq('salon_id', salonId),
    'Recherche de la fiche client'
  ) as { id: string; telephone: string }[];
  const trouve = existants.find((c) => dixDerniersChiffres(c.telephone) === chiffres);
  if (trouve) return trouve.id;

  const cree = verifier(
    await db()
      .from('clients')
      .insert({ salon_id: salonId, nom: nouveau.nom.trim(), telephone: nouveau.telephone.trim() })
      .select('id')
      .single(),
    'Création de la fiche client'
  ) as { id: string };
  return cree.id;
}

export const supabaseRepository: Repository = {
  // ---------------------------------------------------------------- Salon
  async getOwnerSalon(userId) {
    const rows = verifier(
      await db().from('salons').select('*').eq('proprietaire_id', userId).order('created_at').limit(1),
      'Chargement du salon'
    ) as Salon[];
    return rows[0] ?? null;
  },

  async createSalon(data) {
    // Si le lien a été pris entre-temps, on ajoute un petit suffixe plutôt que d'échouer
    let slug = RESERVED_SLUGS.includes(data.slug) ? `${data.slug}-salon` : data.slug;
    for (let essai = 0; essai < 3; essai++) {
      const res = await db().from('salons').insert({ ...data, slug }).select().single();
      if (!res.error) return res.data as Salon;
      if (res.error.code !== '23505' || !res.error.message.includes('slug')) {
        throw new Error(messageErreur(res.error, 'Création du salon'));
      }
      slug = `${data.slug}-${Math.floor(100 + Math.random() * 900)}`;
    }
    throw new Error('Ce lien de réservation est déjà pris. Choisissez-en un autre.');
  },

  async updateSalon(salonId, updates) {
    if (updates.slug && RESERVED_SLUGS.includes(updates.slug)) {
      throw new Error('Ce lien de réservation est réservé. Choisissez-en un autre.');
    }
    return verifier(
      await db()
        .from('salons')
        .update({ ...colonnes(updates, SALON_COLS), updated_at: maintenant() })
        .eq('id', salonId)
        .select()
        .single(),
      'Enregistrement du salon'
    ) as Salon;
  },

  async isSlugAvailable(slug, exceptSalonId) {
    if (RESERVED_SLUGS.includes(slug)) return false;
    const { data, error } = await db().rpc('get_salon_public', { p_slug: slug }).maybeSingle();
    if (error) throw new Error(messageErreur(error, 'Vérification du lien'));
    return !data || (data as Salon).id === exceptSalonId;
  },

  resetToDemo() {
    // Réservé au mode démo : rien à réinitialiser en production
  },

  // ---------------------------------------------------------------- Prestations
  async getServices(salonId) {
    return verifier(
      await db().from('services').select('*').eq('salon_id', salonId).order('categorie').order('prix_fcfa'),
      'Chargement des prestations'
    ) as Service[];
  },

  async saveService(service) {
    const payload = colonnes(service, SERVICE_COLS);
    const query = service.id
      ? db().from('services').update({ ...payload, updated_at: maintenant() }).eq('id', service.id)
      : db().from('services').insert({ ...payload, salon_id: service.salon_id });
    return verifier(await query.select().single(), 'Enregistrement de la prestation') as Service;
  },

  async deleteService(id) {
    verifier(await db().from('services').delete().eq('id', id), 'Suppression de la prestation');
  },

  // ---------------------------------------------------------------- Équipe
  async getEmployes(salonId) {
    const rows = verifier(
      await db().from('employes').select('*, employe_services(service_id)').eq('salon_id', salonId).order('nom'),
      'Chargement de l’équipe'
    ) as any[];
    return rows.map(normaliserEmploye);
  },

  async saveEmploye(employe) {
    const payload = colonnes(employe, EMPLOYE_COLS);
    const estNouveau = !employe.id;
    const query = estNouveau
      ? db().from('employes').insert({ ...payload, salon_id: employe.salon_id })
      : db().from('employes').update({ ...payload, updated_at: maintenant() }).eq('id', employe.id!);
    const saved = verifier(await query.select().single(), 'Enregistrement du membre de l’équipe') as Employe;

    // Horaires par défaut uniquement à la création : une modification ne doit jamais écraser l'existant
    if (estNouveau) {
      verifier(
        await db().from('horaires_employes').insert(horairesParDefaut(employe.salon_id, saved.id)),
        'Création des horaires par défaut'
      );
    }

    if (employe.services_ids) {
      verifier(
        await db().from('employe_services').delete().eq('employe_id', saved.id),
        'Mise à jour des prestations du membre'
      );
      if (employe.services_ids.length > 0) {
        verifier(
          await db()
            .from('employe_services')
            .insert(employe.services_ids.map((service_id) => ({ employe_id: saved.id, service_id }))),
          'Mise à jour des prestations du membre'
        );
      }
    }

    return normaliserEmploye({ ...saved, services_ids: employe.services_ids ?? [] });
  },

  async deleteEmploye(id) {
    verifier(await db().from('employes').delete().eq('id', id), 'Suppression du membre de l’équipe');
  },

  // ---------------------------------------------------------------- Horaires & congés
  async getHoraires(salonId) {
    const rows = verifier(
      await db().from('horaires_employes').select('*').eq('salon_id', salonId),
      'Chargement des horaires'
    ) as any[];
    return rows.map(normaliserHoraire);
  },

  async saveHoraire(horaire) {
    const payload = {
      salon_id: horaire.salon_id,
      employe_id: horaire.employe_id,
      jour_semaine: horaire.jour_semaine,
      est_ouvert: horaire.est_ouvert,
      heure_debut: horaire.heure_debut,
      heure_fin: horaire.heure_fin,
      pause_debut: horaire.pause_debut || null,
      pause_fin: horaire.pause_fin || null,
    };
    verifier(
      await db().from('horaires_employes').upsert(payload, { onConflict: 'employe_id,jour_semaine' }),
      'Enregistrement des horaires'
    );
  },

  async getConges(salonId) {
    return verifier(
      await db().from('conges').select('*').eq('salon_id', salonId).order('debut'),
      'Chargement des congés'
    ) as Conge[];
  },

  async saveConge(conge) {
    return verifier(await db().from('conges').insert(conge).select().single(), 'Enregistrement du congé') as Conge;
  },

  async deleteConge(id) {
    verifier(await db().from('conges').delete().eq('id', id), 'Suppression du congé');
  },

  // ---------------------------------------------------------------- Clients
  async getClients(salonId) {
    const [clientsRes, rdvRes] = await Promise.all([
      db().from('clients').select('*').eq('salon_id', salonId).order('nom'),
      db().from('rendez_vous').select('client_id, statut, prix_fcfa').eq('salon_id', salonId),
    ]);
    const clients = verifier(clientsRes, 'Chargement des clients') as Client[];
    const rdvs = verifier(rdvRes, 'Chargement des clients') as { client_id: string; statut: string; prix_fcfa: number }[];

    // Statistiques calculées à partir des rendez-vous réels
    const stats = new Map<string, { total: number; visites: number; absences: number }>();
    for (const r of rdvs) {
      const s = stats.get(r.client_id) || { total: 0, visites: 0, absences: 0 };
      if (r.statut === 'termine') {
        s.total += r.prix_fcfa || 0;
        s.visites += 1;
      } else if (r.statut === 'absent') {
        s.absences += 1;
      }
      stats.set(r.client_id, s);
    }
    return clients.map((c) => {
      const s = stats.get(c.id);
      return { ...c, total_depense: s?.total ?? 0, nb_visites: s?.visites ?? 0, nb_absences: s?.absences ?? 0 };
    });
  },

  async saveClient(client) {
    const payload = colonnes(client, CLIENT_COLS);
    const query = client.id
      ? db().from('clients').update({ ...payload, updated_at: maintenant() }).eq('id', client.id)
      : db().from('clients').insert({ ...payload, salon_id: client.salon_id });
    return verifier(await query.select().single(), 'Enregistrement du client') as Client;
  },

  // ---------------------------------------------------------------- Rendez-vous (gérant)
  async getRendezVous(salonId) {
    const rows = verifier(
      await db().from('rendez_vous').select(RDV_AVEC_RELATIONS).eq('salon_id', salonId).order('debut', { ascending: false }),
      'Chargement des rendez-vous'
    ) as any[];
    return rows.map(normaliserRdv);
  },

  async updateStatutRendezVous(rdvId, statut) {
    verifier(
      await db().from('rendez_vous').update({ statut, updated_at: maintenant() }).eq('id', rdvId).select('id').single(),
      'Mise à jour du statut'
    );
  },

  async moveRendezVous(rdvId, debut, fin, employeId) {
    const payload: Record<string, string> = { debut, fin, updated_at: maintenant() };
    if (employeId) payload.employe_id = employeId;
    // La contrainte d'exclusion de la base refuse tout chevauchement (message 23P01 traduit)
    verifier(
      await db().from('rendez_vous').update(payload).eq('id', rdvId).select('id').single(),
      'Déplacement du rendez-vous'
    );
  },

  async createManualRendezVous(p) {
    const service = verifier(
      await db().from('services').select('duree_minutes, prix_fcfa').eq('id', p.serviceId).single(),
      'Lecture de la prestation'
    ) as { duree_minutes: number; prix_fcfa: number };

    let clientId = p.clientId;
    if (!clientId) {
      if (!p.nouveauClient) throw new Error('Choisissez une cliente ou saisissez son nom et son numéro.');
      clientId = await trouverOuCreerClient(p.salonId, p.nouveauClient);
    }

    const debut = new Date(p.debut);
    const fin = new Date(debut.getTime() + service.duree_minutes * 60000);
    const row = verifier(
      await db()
        .from('rendez_vous')
        .insert({
          salon_id: p.salonId,
          client_id: clientId,
          employe_id: p.employeId,
          service_id: p.serviceId,
          debut: debut.toISOString(),
          fin: fin.toISOString(),
          statut: p.statut || 'confirme',
          prix_fcfa: service.prix_fcfa,
          notes: p.notes || null,
          source: 'manuel',
        })
        .select(RDV_AVEC_RELATIONS)
        .single(),
      'Création du rendez-vous'
    );
    return normaliserRdv(row);
  },

  // ---------------------------------------------------------------- Parcours public
  async getPublicBookingData(slug) {
    const { data: salonRow, error: salonErr } = await db().rpc('get_salon_public', { p_slug: slug }).maybeSingle();
    if (salonErr) throw new Error(messageErreur(salonErr, 'Chargement du salon'));
    if (!salonRow) return null;
    const salon = salonRow as Salon;

    const [srvRes, empRes, dispoRes] = await Promise.all([
      db().rpc('get_services_public', { p_salon_id: salon.id }),
      db().rpc('get_employes_public', { p_salon_id: salon.id }),
      db().rpc('get_disponibilites_public', { p_salon_id: salon.id }),
    ]);
    if (srvRes.error) throw new Error(messageErreur(srvRes.error, 'Chargement des prestations'));
    if (empRes.error) throw new Error(messageErreur(empRes.error, 'Chargement de l’équipe'));

    // Sans la migration 01, les disponibilités ne sont pas lisibles : le serveur
    // continue malgré tout de refuser les créneaux invalides au moment de réserver.
    if (dispoRes.error) {
      console.warn('get_disponibilites_public indisponible (exécutez supabase/migration-01-securite.sql) :', dispoRes.error);
    }
    const dispo = (dispoRes.data || {}) as {
      horaires?: Omit<HoraireEmploye, 'salon_id'>[];
      conges?: PlageConge[];
      occupations?: { employe_id: string; debut: string; fin: string }[];
      employe_services?: { employe_id: string; service_id: string }[];
    };
    const liens = dispo.employe_services || [];

    return {
      salon,
      services: ((srvRes.data || []) as any[]).map((s) => ({ ...s, salon_id: salon.id, actif: true })),
      employes: ((empRes.data || []) as any[]).map((e) => ({
        ...e,
        salon_id: salon.id,
        actif: true,
        couleur_calendrier: e.couleur_agenda,
        services_ids: liens.filter((l) => l.employe_id === e.id).map((l) => l.service_id),
      })),
      horaires: (dispo.horaires || []).map((h) => ({ ...h, salon_id: salon.id })),
      conges: dispo.conges || [],
      rendezVous: (dispo.occupations || []).map((o) => ({ ...o, statut: 'confirme' as const })),
    };
  },

  async bookPublicAppointment(params) {
    if (!isUuid(params.salonId) || !isUuid(params.serviceId)) {
      return { success: false, error: 'Ce salon ou cette prestation est introuvable. Rechargez la page.' };
    }
    try {
      const { data, error } = await db().rpc('creer_reservation_publique', {
        p_salon_id: params.salonId,
        p_service_id: params.serviceId,
        p_employe_id: isUuid(params.employeId) ? params.employeId : null,
        p_debut: params.debut,
        p_client_nom: params.clientNom.trim(),
        p_client_telephone: params.clientTelephone.trim(),
        p_client_email: params.clientEmail?.trim() || null,
        p_notes: params.notes?.trim() || null,
      });

      if (error) {
        console.error('Erreur RPC creer_reservation_publique :', error);
        // Les messages levés par la fonction SQL sont déjà rédigés pour les clientes
        if (error.code === 'P0001') return { success: false, error: error.message };
        if (error.code === '42883' || error.code === '42501') {
          return { success: false, error: 'La réservation en ligne est momentanément indisponible. Contactez le salon.' };
        }
        return { success: false, error: messageErreur(error, 'Réservation') };
      }

      return {
        success: true,
        token_annulation: data?.token_annulation,
        rdv_id: data?.rdv_id,
        // Le serveur peut attribuer un autre coiffeur que celui proposé à l'écran
        employe_nom: data?.employe_nom,
      };
    } catch (err) {
      console.error('Exception creer_reservation_publique :', err);
      return { success: false, error: messageErreur(err, 'Réservation') };
    }
  },

  async getReservationByToken(token) {
    if (!isUuid(token)) return null;
    const { data, error } = await db().rpc('get_reservation_par_token', { p_token: token });
    if (error) throw new Error(messageErreur(error, 'Lecture de la réservation'));
    return (data as ReservationPublique | null) ?? null;
  },

  async cancelByToken(token, motif) {
    if (!isUuid(token)) return { success: false, message: 'Rendez-vous introuvable' };
    const { data, error } = await db().rpc('annuler_reservation_publique', {
      p_token: token,
      p_motif: motif || null,
    });
    if (error) return { success: false, message: messageErreur(error, 'Annulation') };
    return { success: !!data?.success, message: data?.message || '' };
  },
};
