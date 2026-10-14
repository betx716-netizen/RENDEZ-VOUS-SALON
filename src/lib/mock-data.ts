import { Salon, Employe, Service, HoraireEmploye, Client, RendezVous, Conge } from '../types/database';

export const INITIAL_SALON: Salon = {
  id: 'sal-ebene-or-001',
  proprietaire_id: 'usr-demo-001',
  nom: 'Ébène & Or Beauté Abidjan',
  slug: 'ebene-et-or-abidjan',
  telephone: '+225 07 08 09 10 11',
  adresse: 'Boulevard François Mitterrand, Riviera 3',
  ville: 'Abidjan',
  commune: 'Cocody',
  description: 'Votre espace d’exception pour tresses haut de gamme, soins capillaires afro & texturés, barbier styliste et institut de beauté à Abidjan.',
  delai_min_heures: 2,
  delai_max_jours: 45,
  pas_creneau_minutes: 30,
  message_rappel: 'Bonjour {client}, nous vous rappelons votre rendez-vous pour {service} le {date} à {heure} chez {salon}. Merci de confirmer votre présence.',
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-001',
    salon_id: 'sal-ebene-or-001',
    nom: 'Knotless Braids Moyennes (Dos)',
    categorie: 'Tresses & Nattes',
    duree_minutes: 180,
    prix_fcfa: 20000,
    description: 'Tresses sans nœud douces pour les tempes avec mèches fournies et finition mousse thermo-protectrice.',
    actif: true,
  },
  {
    id: 'srv-002',
    salon_id: 'sal-ebene-or-001',
    nom: 'Pose & Retouche Locks / Dreadlocks',
    categorie: 'Locks & Nattes',
    duree_minutes: 120,
    prix_fcfa: 15000,
    description: 'Tournage au crochet ou gel avec bain d’huiles végétales et séchage sous casque.',
    actif: true,
  },
  {
    id: 'srv-003',
    salon_id: 'sal-ebene-or-001',
    nom: 'Soin Profond Vapeur & Brushing Silk Press',
    categorie: 'Soins Capillaires',
    duree_minutes: 75,
    prix_fcfa: 12000,
    description: 'Soin hydratant profond sous casque à vapeur d’ozone, massage crânien et lissage soyeux.',
    actif: true,
  },
  {
    id: 'srv-004',
    salon_id: 'sal-ebene-or-001',
    nom: 'Coupe Dégradé Américain & Traçage Barbe',
    categorie: 'Barbier & Homme',
    duree_minutes: 40,
    prix_fcfa: 5000,
    description: 'Coupe moderne aux ciseaux/tondeuse, contours ultra précis et serviette chaude parfumée.',
    actif: true,
  },
  {
    id: 'srv-005',
    salon_id: 'sal-ebene-or-001',
    nom: 'Soin Barbe Prestige & Traitement Huiles',
    categorie: 'Barbier & Homme',
    duree_minutes: 30,
    prix_fcfa: 4000,
    description: 'Shampoing purifiant barbe, gommage, vapeur tiède et hydratation au karité bio.',
    actif: true,
  },
  {
    id: 'srv-006',
    salon_id: 'sal-ebene-or-001',
    nom: 'Manucure Russe & Pose Gel UV',
    categorie: 'Onglerie & Beauté',
    duree_minutes: 60,
    prix_fcfa: 10000,
    description: 'Nettoyage minutieux des cuticules, renforcement gel et vernis semi-permanent longue durée.',
    actif: true,
  },
  {
    id: 'srv-007',
    salon_id: 'sal-ebene-or-001',
    nom: 'Pédicure Spa Complète & Bain Pétillant',
    categorie: 'Onglerie & Beauté',
    duree_minutes: 60,
    prix_fcfa: 12000,
    description: 'Gommage aux sels marins, râpage doux, masque nourrissant et massage relaxant des pieds.',
    actif: true,
  },
];

export const INITIAL_EMPLOYES: Employe[] = [
  {
    id: 'emp-001',
    salon_id: 'sal-ebene-or-001',
    nom: 'Aminata Kouassi',
    telephone: '+225 07 48 11 22 33',
    role: 'Spécialiste Tresses & Locks',
    couleur_agenda: '#D97706', // Ambre doré
    actif: true,
    services_ids: ['srv-001', 'srv-002'],
  },
  {
    id: 'emp-002',
    salon_id: 'sal-ebene-or-001',
    nom: 'Jean-Marc Konan',
    telephone: '+225 05 55 44 33 22',
    role: 'Barbier Styliste Homme',
    couleur_agenda: '#2563EB', // Bleu royal
    actif: true,
    services_ids: ['srv-004', 'srv-005'],
  },
  {
    id: 'emp-003',
    salon_id: 'sal-ebene-or-001',
    nom: 'Marie-Paule Yao',
    telephone: '+225 01 02 03 04 05',
    role: 'Coiffeuse Styliste & Soins',
    couleur_agenda: '#9333EA', // Violet chic
    actif: true,
    services_ids: ['srv-001', 'srv-003'],
  },
  {
    id: 'emp-004',
    salon_id: 'sal-ebene-or-001',
    nom: 'Fatou Cissé',
    telephone: '+225 07 77 88 99 00',
    role: 'Esthéticienne & Onglerie',
    couleur_agenda: '#E11D48', // Rose framboise
    actif: true,
    services_ids: ['srv-006', 'srv-007'],
  },
];

export const INITIAL_HORAIRES: HoraireEmploye[] = [];
// Remplir 6 jours par semaine (Lundi à Samedi) pour chaque employé
[INITIAL_EMPLOYES[0].id, INITIAL_EMPLOYES[1].id, INITIAL_EMPLOYES[2].id, INITIAL_EMPLOYES[3].id].forEach((empId) => {
  for (let j = 1; j <= 6; j++) {
    INITIAL_HORAIRES.push({
      salon_id: 'sal-ebene-or-001',
      employe_id: empId,
      jour_semaine: j,
      est_ouvert: true,
      heure_debut: '08:30',
      heure_fin: '19:00',
      pause_debut: '13:00',
      pause_fin: '14:00',
    });
  }
  // Dimanche fermé
  INITIAL_HORAIRES.push({
    salon_id: 'sal-ebene-or-001',
    employe_id: empId,
    jour_semaine: 0,
    est_ouvert: false,
    heure_debut: '09:00',
    heure_fin: '18:00',
  });
});

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    salon_id: 'sal-ebene-or-001',
    nom: 'Aïcha Traoré',
    telephone: '+225 07 12 34 56 78',
    email: 'aicha.traore@gmail.com',
    notes: 'Cuir chevelu sensible, préfère les mèches couleur 1B/27.',
    nb_absences: 0,
    total_depense: 40000,
    nb_visites: 2,
  },
  {
    id: 'cli-002',
    salon_id: 'sal-ebene-or-001',
    nom: 'Stéphane Bamba',
    telephone: '+225 05 98 76 54 32',
    email: 's.bamba@ci-telecom.ci',
    notes: 'Vient toujours le vendredi pour son dégradé et sa barbe.',
    nb_absences: 0,
    total_depense: 25000,
    nb_visites: 5,
  },
  {
    id: 'cli-003',
    salon_id: 'sal-ebene-or-001',
    nom: 'Clarisse N’Guessan',
    telephone: '+225 01 44 55 66 77',
    email: 'clarisse.nguessan@yahoo.fr',
    notes: 'Adore la manucure nude avec nail art discret.',
    nb_absences: 1,
    total_depense: 10000,
    nb_visites: 1,
  },
  {
    id: 'cli-004',
    salon_id: 'sal-ebene-or-001',
    nom: 'Koffi Franck',
    telephone: '+225 07 65 43 21 09',
    email: 'koffi.franck@orange.ci',
    notes: 'Client ponctuel et fidèle depuis le début.',
    nb_absences: 0,
    total_depense: 18000,
    nb_visites: 4,
  },
  {
    id: 'cli-005',
    salon_id: 'sal-ebene-or-001',
    nom: 'Sandrine Kassi',
    telephone: '+225 05 11 22 33 44',
    email: 'sandrine.kassi@outlook.com',
    notes: 'Prend souvent soin vapeur + tresses.',
    nb_absences: 0,
    total_depense: 32000,
    nb_visites: 2,
  },
];

// Créer des dates dynamiques autour d'aujourd'hui
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const todayDateStr = `${yyyy}-${mm}-${dd}`;

export const INITIAL_RENDEZ_VOUS: RendezVous[] = [
  {
    id: 'rdv-001',
    salon_id: 'sal-ebene-or-001',
    client_id: 'cli-001',
    employe_id: 'emp-001',
    service_id: 'srv-001',
    debut: `${todayDateStr}T09:00:00.000Z`,
    fin: `${todayDateStr}T12:00:00.000Z`,
    statut: 'termine',
    prix_fcfa: 20000,
    notes: 'Rendez-vous impeccable, payé en Wave.',
    token_annulation: 'tok-00001-ebene',
    source: 'en_ligne',
  },
  {
    id: 'rdv-002',
    salon_id: 'sal-ebene-or-001',
    client_id: 'cli-002',
    employe_id: 'emp-002',
    service_id: 'srv-004',
    debut: `${todayDateStr}T10:00:00.000Z`,
    fin: `${todayDateStr}T10:40:00.000Z`,
    statut: 'termine',
    prix_fcfa: 5000,
    notes: 'Coupe régulière avec serviette chaude.',
    token_annulation: 'tok-00002-ebene',
    source: 'en_ligne',
  },
  {
    id: 'rdv-003',
    salon_id: 'sal-ebene-or-001',
    client_id: 'cli-003',
    employe_id: 'emp-004',
    service_id: 'srv-006',
    debut: `${todayDateStr}T14:00:00.000Z`,
    fin: `${todayDateStr}T15:00:00.000Z`,
    statut: 'confirme',
    prix_fcfa: 10000,
    notes: 'French manucure demandée.',
    token_annulation: 'tok-00003-ebene',
    source: 'en_ligne',
  },
  {
    id: 'rdv-004',
    salon_id: 'sal-ebene-or-001',
    client_id: 'cli-004',
    employe_id: 'emp-002',
    service_id: 'srv-005',
    debut: `${todayDateStr}T15:30:00.000Z`,
    fin: `${todayDateStr}T16:00:00.000Z`,
    statut: 'en_attente',
    prix_fcfa: 4000,
    notes: 'Réservation par appel WhatsApp.',
    token_annulation: 'tok-00004-ebene',
    source: 'manuel',
  },
  {
    id: 'rdv-005',
    salon_id: 'sal-ebene-or-001',
    client_id: 'cli-005',
    employe_id: 'emp-003',
    service_id: 'srv-003',
    debut: `${todayDateStr}T16:30:00.000Z`,
    fin: `${todayDateStr}T17:45:00.000Z`,
    statut: 'confirme',
    prix_fcfa: 12000,
    notes: 'Client VIP, prévoir thé à la menthe.',
    token_annulation: 'tok-00005-ebene',
    source: 'en_ligne',
  },
];

export const INITIAL_CONGES: Conge[] = [];
