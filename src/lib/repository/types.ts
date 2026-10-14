import type {
  Salon,
  Employe,
  Service,
  HoraireEmploye,
  Conge,
  Client,
  RendezVous,
  StatutRendezVous,
} from '../../types/database';
import type { PlageConge, PlageOccupee } from '../slot-calculator';

export interface PublicBookingData {
  salon: Salon;
  services: Service[];
  employes: Employe[];
  horaires: HoraireEmploye[];
  conges: PlageConge[];
  rendezVous: PlageOccupee[];
}

export interface NouveauSalon {
  proprietaire_id: string;
  nom: string;
  slug: string;
  telephone: string;
  adresse: string;
  ville: string;
}

export interface PublicBookingParams {
  salonId: string;
  serviceId: string;
  employeId: string;
  debut: string; // ISO
  clientNom: string;
  clientTelephone: string;
  clientEmail?: string;
  notes?: string;
}

export interface PublicBookingResult {
  success: boolean;
  token_annulation?: string;
  rdv_id?: string;
  employe_nom?: string;
  error?: string;
}

export interface ManualRendezVousParams {
  salonId: string;
  /** Fiche existante, ou bien nouveauClient pour créer/retrouver la fiche par téléphone */
  clientId?: string;
  nouveauClient?: { nom: string; telephone: string };
  employeId: string;
  serviceId: string;
  debut: string; // ISO
  statut?: StatutRendezVous;
  notes?: string;
}

export interface ReservationPublique {
  id: string;
  debut: string;
  fin: string;
  statut: StatutRendezVous;
  prix_fcfa: number;
  service_nom: string;
  duree_minutes: number;
  salon_nom: string;
  salon_slug: string;
  salon_telephone: string;
  salon_adresse: string;
  salon_ville: string;
  employe_nom: string;
  client_nom: string;
  client_telephone: string;
}

/**
 * Contrat commun aux deux implémentations :
 * - local.ts    : mode démo, tout dans le navigateur (localStorage)
 * - supabase.ts : production, uniquement la base Supabase, erreurs remontées telles quelles
 * Les écritures lèvent une Error avec un message en français prêt à afficher.
 */
export interface Repository {
  // Salon
  getOwnerSalon(userId: string): Promise<Salon | null>;
  createSalon(data: NouveauSalon): Promise<Salon>;
  updateSalon(salonId: string, updates: Partial<Salon>): Promise<Salon>;
  isSlugAvailable(slug: string, exceptSalonId?: string): Promise<boolean>;
  resetToDemo(): void;

  // Prestations
  getServices(salonId: string): Promise<Service[]>;
  saveService(service: Partial<Service> & { salon_id: string }): Promise<Service>;
  deleteService(id: string): Promise<void>;

  // Équipe
  getEmployes(salonId: string): Promise<Employe[]>;
  saveEmploye(employe: Partial<Employe> & { salon_id: string }): Promise<Employe>;
  deleteEmploye(id: string): Promise<void>;

  // Horaires & congés
  getHoraires(salonId: string): Promise<HoraireEmploye[]>;
  saveHoraire(horaire: HoraireEmploye): Promise<void>;
  getConges(salonId: string): Promise<Conge[]>;
  saveConge(conge: Omit<Conge, 'id'>): Promise<Conge>;
  deleteConge(id: string): Promise<void>;

  // Clients
  getClients(salonId: string): Promise<Client[]>;
  saveClient(client: Partial<Client> & { salon_id: string }): Promise<Client>;

  // Rendez-vous (espace gérant)
  getRendezVous(salonId: string): Promise<RendezVous[]>;
  updateStatutRendezVous(rdvId: string, statut: StatutRendezVous): Promise<void>;
  moveRendezVous(rdvId: string, debut: string, fin: string, employeId?: string): Promise<void>;
  createManualRendezVous(params: ManualRendezVousParams): Promise<RendezVous>;

  // Parcours public (sans connexion)
  getPublicBookingData(slug: string): Promise<PublicBookingData | null>;
  bookPublicAppointment(params: PublicBookingParams): Promise<PublicBookingResult>;
  getReservationByToken(token: string): Promise<ReservationPublique | null>;
  cancelByToken(token: string, motif?: string): Promise<{ success: boolean; message: string }>;
}
