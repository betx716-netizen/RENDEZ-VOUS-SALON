# RDV Salon - Plateforme SaaS de Gestion & Réservation pour Salons de Beauté

**RDV Salon** est une application SaaS full-stack moderne, élégante et mobile-first, dédiée aux salons de coiffure, barbieries et instituts de beauté en Côte d'Ivoire (Afrique de l'Ouest).

- **Devise** : Francs CFA (XOF)
- **Fuseau horaire de référence** : `Africa/Abidjan` (UTC+0)
- **Indicatif téléphonique** : Côte d'Ivoire (+225)
- **Langue** : 100 % en français

---

## 🚀 Fonctionnalités Clés

### A) Espace Public de Réservation (sans connexion) — `/s/:slug`
1. **Choix de la prestation** : groupé par catégorie (Tresses & Nattes, Soins, Barbier, Onglerie), durée et prix en FCFA.
2. **Choix du coiffeur/esthéticienne** ou option *"Peu importe (Premier disponible)"*.
3. **Sélection de la date & du créneau** :
   - Calcul dynamique en temps réel selon les horaires d'ouverture et pauses déjeuner.
   - Exclusion automatique des congés de l'employé et des rendez-vous existants.
   - Détection des conflits et respect du délai minimum de réservation (ex: 2h).
4. **Coordonnées client** : Nom, Téléphone ivoirien (07 / 05 / 01), email optionnel et notes.
5. **Confirmation & Partage** :
   - Animation festive et récapitulatif clair.
   - Bouton **"Ajouter au calendrier"** (téléchargement `.ics` universel).
   - Bouton **"Partager sur WhatsApp"** avec message prérempli.
   - Lien secret unique pour annuler à tout moment (`/annuler/:token`).

### B) Espace Privé Salon (connexion requise) — `/app`
1. **Tableau de bord** : Rendez-vous du jour, RV de la semaine, Chiffre d'affaires estimé du mois (sur prestations terminées), Taux de présence, prochains clients et Top 5 des services.
2. **Agenda & Planning** :
   - Vue Jour (colonnes par employé) et Vue Semaine.
   - Clic sur un créneau libre = Nouveau rendez-vous manuel.
   - Clic sur un rendez-vous = Détails, changement de statut (*Confirmé, Terminé, Absent/No-show, Annulé*), déplacement de créneau et bouton WhatsApp direct.
3. **Rendez-vous** : Liste filtrable par date (Aujourd'hui, À venir, Passés), statut et employé avec recherche rapide par nom ou téléphone.
4. **Fichier Clients** : Fiche client détaillée, total dépensé en FCFA, nombre de visites, suivi des absences (no-shows), notes capillaires et historique des rendez-vous.
5. **Prestations (Services)** : CRUD complet (nom, catégorie, durée en minutes, tarif en FCFA, statut actif/inactif).
6. **Équipe & Horaires** : CRUD des employés (rôle, couleur personnalisée sur le planning, services attribués), horaires hebdomadaires jour par jour avec pause déjeuner, et gestion des congés ponctuels.
7. **Paramètres** : Coordonnées du salon, délais de réservation, pas des créneaux (15/30/45/60 min), modèle de rappel WhatsApp personnalisable, lien public avec bouton copier et **Générateur de QR Code téléchargeable en PNG**.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, Vite, TypeScript, Tailwind CSS, React Router v7
- **Base de données & Auth** : Supabase (PostgreSQL 15+, RLS, Row Level Security, contrainte d'exclusion `btree_gist`, fonctions RPC `SECURITY DEFINER`)
- **Dates & Calendrier** : `date-fns` (avec locale `fr`)
- **Icônes** : `lucide-react`
- **QR Code** : `qrcode`

---

## 🗄️ Configuration de la Base de Données Supabase

1. Connectez-vous sur votre console [Supabase](https://supabase.com).
2. Créez un nouveau projet (ex: région Europe ou la plus proche de l'Afrique de l'Ouest).
3. Rendez-vous dans le menu **SQL Editor**.
4. Copiez l'intégralité du fichier [`supabase/schema.sql`](./supabase/schema.sql) et exécutez-le :
   - Active l'extension `btree_gist`.
   - Crée les tables : `salons`, `employes`, `services`, `employe_services`, `horaires_employes`, `conges`, `clients`, `rendez_vous`.
   - Applique la contrainte d'exclusion **anti double-réservation** empêchant deux créneaux de se chevaucher pour le même employé :
     ```sql
     ALTER TABLE rendez_vous
     ADD CONSTRAINT rdv_pas_de_chevauchement
     EXCLUDE USING gist (
         employe_id WITH =,
         tstzrange(debut, fin) WITH &&
     )
     WHERE (statut != 'annule');
     ```
   - Active Row Level Security (RLS) sur toutes les tables.
   - Installe les fonctions RPC publiques sécurisées : `get_salon_public`, `get_services_public`, `get_employes_public`, `creer_reservation_publique`, `get_reservation_par_token`, `annuler_reservation_publique`.
5. Exécutez ensuite [`supabase/migration-01-securite.sql`](./supabase/migration-01-securite.sql) : ferme la lecture publique des employés/prestations, vérifie horaires, congés et pauses côté serveur à chaque réservation, et expose les créneaux occupés (sans données client) à la page publique. Le script est rejouable sans risque.
6. Dans **Authentication > URL Configuration**, renseignez l'adresse du site (*Site URL*) et ajoutez aux *Redirect URLs* :
   - `https://votre-domaine/connexion` (lien de confirmation d'email : le salon est créé automatiquement à la première connexion) ;
   - `https://votre-domaine/nouveau-mot-de-passe` (lien « mot de passe oublié »).
7. *(Optionnel)* Exécutez le script [`supabase/seed.sql`](./supabase/seed.sql) pour charger les données d'exemple du salon modèle d'Abidjan : *"Ébène & Or Beauté Abidjan"*.

---

## ⚙️ Variables d'Environnement

Créez un fichier `.env` à la racine du projet (en vous basant sur `.env.example`) :

```env
# URL du projet Supabase
VITE_SUPABASE_URL="https://votre-projet.supabase.co"

# Clé API publique (anon) de Supabase
VITE_SUPABASE_ANON_KEY="votre_cle_anon_publique"
```

> **Mode démonstration :**
> Sans ces variables, l'application fonctionne entièrement en démo, avec les données stockées dans le navigateur.
> Avec Supabase configuré, les vrais salons n'utilisent **que** la base (aucune donnée locale, aucune donnée de démo) ; le salon de démonstration reste accessible via le bouton « Accéder au salon de démonstration » de la page de connexion et le lien `/s/demo`.
> Le code est séparé en deux implémentations : `src/lib/repository/supabase.ts` (production) et `src/lib/repository/local.ts` (démo).

---

## 💻 Lancement Local

1. Installez les dépendances :
   ```bash
   npm install
   ```
2. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```
3. Ouvrez votre navigateur sur `http://localhost:3000` (ou le port indiqué).

---

## 🚀 Déploiement sur Vercel

Le fichier [`vercel.json`](./vercel.json) est déjà préconfiguré pour réécrire toutes les routes SPA vers `index.html` :

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

1. Poussez votre code sur GitHub ou GitLab.
2. Importez le dépôt sur [Vercel](https://vercel.com).
3. Dans la section **Environment Variables**, ajoutez :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Cliquez sur **Deploy**.
