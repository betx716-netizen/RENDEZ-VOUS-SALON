export type StatutRendezVous = 'en_attente' | 'confirme' | 'termine' | 'annule' | 'absent';
export type SourceRendezVous = 'en_ligne' | 'manuel';

export interface Salon {
  id: string;
  proprietaire_id: string;
  nom: string;
  slug: string;
  telephone: string;
  adresse: string;
  ville: string;
  commune?: string;
  description?: string;
  logo_url?: string;
  heure_ouverture?: string;
  heure_fermeture?: string;
  delai_min_heures: number;
  delai_max_jours: number;
  pas_creneau_minutes: number;
  message_rappel: string;
  created_at?: string;
  updated_at?: string;
}

export interface Employe {
  id: string;
  salon_id: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  role: string;
  couleur_agenda: string;
  couleur_calendrier?: string;
  specialites?: string[];
  actif: boolean;
  services_ids?: string[];
  created_at?: string;
}

export interface Service {
  id: string;
  salon_id: string;
  nom: string;
  categorie: string;
  duree_minutes: number;
  prix_fcfa: number;
  description?: string;
  actif: boolean;
  created_at?: string;
}

export interface HoraireEmploye {
  id?: string;
  salon_id: string;
  employe_id: string;
  jour_semaine: number; // 0 = Dimanche, 1 = Lundi, ... 6 = Samedi
  est_ouvert: boolean;
  heure_debut: string; // "08:30"
  heure_fin: string;   // "19:00"
  pause_debut?: string; // "13:00"
  pause_fin?: string;   // "14:00"
}

export interface Conge {
  id: string;
  salon_id: string;
  employe_id: string;
  debut: string; // ISO string
  fin: string;   // ISO string
  motif?: string;
}

export interface Client {
  id: string;
  salon_id: string;
  nom: string;
  telephone: string;
  email?: string;
  notes?: string;
  nb_absences: number;
  total_depense?: number;
  nb_visites?: number;
  created_at?: string;
}

export interface RendezVous {
  id: string;
  salon_id: string;
  client_id: string;
  employe_id: string;
  service_id: string;
  debut: string; // ISO string
  fin: string;   // ISO string
  statut: StatutRendezVous;
  prix_fcfa: number;
  notes?: string;
  token_annulation: string;
  source: SourceRendezVous;
  created_at?: string;
  
  // Direct client fields when flat or queried
  client_nom?: string;
  client_telephone?: string;
  client_email?: string;
  
  // Relations jointes
  client?: Client;
  employe?: Employe;
  service?: Service;
}

export interface CreneauHoraire {
  heure: string; // "09:00"
  debut: string; // ISO string
  fin: string;   // ISO string
  employe_id: string;
  employe_nom: string;
  disponible: boolean;
}
