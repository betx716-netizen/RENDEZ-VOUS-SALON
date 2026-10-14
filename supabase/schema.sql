-- ==============================================================================
-- SCHÉMA DE BASE DE DONNÉES - RDV SALON (PostgreSQL / Supabase)
-- Plateforme SaaS de gestion de rendez-vous pour salons de beauté & coiffure
-- Fuseau horaire de référence : Africa/Abidjan (UTC+0) | Devise : FCFA (XOF)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. TABLES

-- A. SALONS
CREATE TABLE IF NOT EXISTS salons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proprietaire_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    telephone VARCHAR(50) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    ville VARCHAR(100) NOT NULL DEFAULT 'Abidjan',
    commune VARCHAR(100) DEFAULT 'Cocody',
    description TEXT,
    logo_url TEXT,
    delai_min_heures NUMERIC(4,2) NOT NULL DEFAULT 2, -- Réservation au moins X heures à l'avance (0.5 = 30 min)
    delai_max_jours INT NOT NULL DEFAULT 60,     -- Réservation au max X jours à l'avance
    pas_creneau_minutes INT NOT NULL DEFAULT 30, -- Pas de calcul des créneaux (15, 30, 45, 60)
    message_rappel TEXT DEFAULT 'Bonjour {client}, nous vous rappelons votre rendez-vous pour {service} le {date} à {heure} chez {salon}. Merci de confirmer votre présence.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- B. EMPLOYÉS (Coiffeurs, esthéticiennes, barbiers)
CREATE TABLE IF NOT EXISTS employes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    role VARCHAR(100) DEFAULT 'Coiffeur / Styliste',
    couleur_agenda VARCHAR(20) NOT NULL DEFAULT '#B45309', -- Code couleur hex pour le planning
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- C. SERVICES
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    categorie VARCHAR(100) NOT NULL DEFAULT 'Coiffure', -- Tresses, Soins, Coiffure, Barbe, Onglerie, etc.
    duree_minutes INT NOT NULL DEFAULT 45,               -- Durée du service en minutes
    prix_fcfa INT NOT NULL DEFAULT 5000,                 -- Prix en FCFA (XOF)
    description TEXT,
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- D. EMPLOYÉ_SERVICES (Liaison many-to-many : quels employés peuvent réaliser quels services)
CREATE TABLE IF NOT EXISTS employe_services (
    employe_id UUID NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (employe_id, service_id)
);

-- E. HORAIRES DE TRAVAIL HEBDOMADAIRES DES EMPLOYÉS
-- jour_semaine: 0 = Dimanche, 1 = Lundi, 2 = Mardi, ..., 6 = Samedi
CREATE TABLE IF NOT EXISTS horaires_employes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    employe_id UUID NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    jour_semaine INT NOT NULL CHECK (jour_semaine BETWEEN 0 AND 6),
    est_ouvert BOOLEAN NOT NULL DEFAULT true,
    heure_debut TIME NOT NULL DEFAULT '08:30:00',
    heure_fin TIME NOT NULL DEFAULT '19:00:00',
    pause_debut TIME DEFAULT '13:00:00',
    pause_fin TIME DEFAULT '14:00:00',
    UNIQUE (employe_id, jour_semaine)
);

-- F. CONGÉS ET ABSENCES PONCTUELLES DES EMPLOYÉS
CREATE TABLE IF NOT EXISTS conges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    employe_id UUID NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    debut TIMESTAMPTZ NOT NULL,
    fin TIMESTAMPTZ NOT NULL,
    motif VARCHAR(255) DEFAULT 'Congé',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CHECK (fin > debut)
);

-- G. CLIENTS (Fichier clientèle du salon)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    notes TEXT,
    nb_absences INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(salon_id, telephone)
);

-- H. RENDEZ-VOUS
CREATE TABLE IF NOT EXISTS rendez_vous (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    employe_id UUID NOT NULL REFERENCES employes(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    debut TIMESTAMPTZ NOT NULL,
    fin TIMESTAMPTZ NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'en_attente'
        CHECK (statut IN ('en_attente', 'confirme', 'termine', 'annule', 'absent')),
    prix_fcfa INT NOT NULL,
    notes TEXT,
    token_annulation UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    source VARCHAR(20) NOT NULL DEFAULT 'en_ligne'
        CHECK (source IN ('en_ligne', 'manuel')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CHECK (fin > debut)
);

-- 3. CONTRAINTE D'EXCLUSION : ANTI DOUBLE-RÉSERVATION (btree_gist)
-- Empêche deux rendez-vous non annulés de se chevaucher sur le même créneau pour le même employé
ALTER TABLE rendez_vous
DROP CONSTRAINT IF EXISTS rdv_pas_de_chevauchement;

ALTER TABLE rendez_vous
ADD CONSTRAINT rdv_pas_de_chevauchement
EXCLUDE USING gist (
    employe_id WITH =,
    tstzrange(debut, fin) WITH &&
)
WHERE (statut != 'annule');

-- 4. INDEX DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_salons_proprietaire ON salons(proprietaire_id);
CREATE INDEX IF NOT EXISTS idx_salons_slug ON salons(slug);
CREATE INDEX IF NOT EXISTS idx_employes_salon ON employes(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_clients_salon ON clients(salon_id);
CREATE INDEX IF NOT EXISTS idx_clients_telephone ON clients(salon_id, telephone);
CREATE INDEX IF NOT EXISTS idx_rdv_salon_debut ON rendez_vous(salon_id, debut);
CREATE INDEX IF NOT EXISTS idx_rdv_employe_debut ON rendez_vous(employe_id, debut);
CREATE INDEX IF NOT EXISTS idx_rdv_token ON rendez_vous(token_annulation);
CREATE INDEX IF NOT EXISTS idx_conges_employe ON conges(employe_id, debut, fin);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE employes ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE employe_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE horaires_employes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conges ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendez_vous ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les propriétaires authentifiés
-- SALONS
CREATE POLICY "Proprietaire gere son salon" ON salons
    FOR ALL TO authenticated
    USING (proprietaire_id = auth.uid())
    WITH CHECK (proprietaire_id = auth.uid());

-- EMPLOYES
CREATE POLICY "Proprietaire gere ses employes" ON employes
    FOR ALL TO authenticated
    USING (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()))
    WITH CHECK (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()));

-- SERVICES
-- Pas de lecture publique directe : la page de réservation passe par get_services_public()
CREATE POLICY "Proprietaire gere ses services" ON services
    FOR ALL TO authenticated
    USING (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()))
    WITH CHECK (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()));

-- EMPLOYE_SERVICES
CREATE POLICY "Proprietaire gere employe_services" ON employe_services
    FOR ALL TO authenticated
    USING (employe_id IN (SELECT e.id FROM employes e JOIN salons s ON e.salon_id = s.id WHERE s.proprietaire_id = auth.uid()))
    WITH CHECK (employe_id IN (SELECT e.id FROM employes e JOIN salons s ON e.salon_id = s.id WHERE s.proprietaire_id = auth.uid()));

-- HORAIRES_EMPLOYES
CREATE POLICY "Proprietaire gere les horaires" ON horaires_employes
    FOR ALL TO authenticated
    USING (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()))
    WITH CHECK (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()));

-- CONGES
CREATE POLICY "Proprietaire gere les conges" ON conges
    FOR ALL TO authenticated
    USING (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()))
    WITH CHECK (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()));

-- CLIENTS
CREATE POLICY "Proprietaire gere ses clients" ON clients
    FOR ALL TO authenticated
    USING (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()))
    WITH CHECK (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()));

-- RENDEZ-VOUS
CREATE POLICY "Proprietaire gere ses rendez-vous" ON rendez_vous
    FOR ALL TO authenticated
    USING (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()))
    WITH CHECK (salon_id IN (SELECT id FROM salons WHERE proprietaire_id = auth.uid()));


-- ==============================================================================
-- 6. FONCTIONS RPC PUBLIQUES SÉCURISÉES (SECURITY DEFINER)
-- Strictement limitées pour le tunnel de réservation public /s/:slug
-- Aucune table n'est directement exposée en lecture libre aux utilisateurs anonymes
-- ==============================================================================

-- A. Obtenir les informations publiques d'un salon par son slug
CREATE OR REPLACE FUNCTION get_salon_public(p_slug TEXT)
RETURNS TABLE (
    id UUID,
    nom VARCHAR,
    slug VARCHAR,
    telephone VARCHAR,
    adresse VARCHAR,
    ville VARCHAR,
    commune VARCHAR,
    description TEXT,
    logo_url TEXT,
    delai_min_heures NUMERIC,
    delai_max_jours INT,
    pas_creneau_minutes INT,
    message_rappel TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id, s.nom, s.slug, s.telephone, s.adresse, s.ville, s.commune,
        s.description, s.logo_url, s.delai_min_heures, s.delai_max_jours,
        s.pas_creneau_minutes, s.message_rappel
    FROM salons s
    WHERE s.slug = p_slug;
END;
$$;

-- B. Obtenir les services actifs d'un salon (public)
CREATE OR REPLACE FUNCTION get_services_public(p_salon_id UUID)
RETURNS TABLE (
    id UUID,
    nom VARCHAR,
    categorie VARCHAR,
    duree_minutes INT,
    prix_fcfa INT,
    description TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.nom, s.categorie, s.duree_minutes, s.prix_fcfa, s.description
    FROM services s
    WHERE s.salon_id = p_salon_id AND s.actif = true
    ORDER BY s.categorie, s.prix_fcfa;
END;
$$;

-- C. Obtenir les employés qualifiés pour un service donné (public)
CREATE OR REPLACE FUNCTION get_employes_public(p_salon_id UUID, p_service_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    nom VARCHAR,
    role VARCHAR,
    couleur_agenda VARCHAR
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF p_service_id IS NULL THEN
        RETURN QUERY
        SELECT e.id, e.nom, e.role, e.couleur_agenda
        FROM employes e
        WHERE e.salon_id = p_salon_id AND e.actif = true
        ORDER BY e.nom;
    ELSE
        RETURN QUERY
        SELECT e.id, e.nom, e.role, e.couleur_agenda
        FROM employes e
        JOIN employe_services es ON es.employe_id = e.id
        WHERE e.salon_id = p_salon_id 
          AND es.service_id = p_service_id 
          AND e.actif = true
        ORDER BY e.nom;
    END IF;
END;
$$;

-- D. Créer une réservation publique sécurisée (avec anti-conflit et gestion automatique client)
-- D. Créer une réservation publique sécurisée (avec anti-conflit et gestion automatique client)
CREATE OR REPLACE FUNCTION creer_reservation_publique(
    p_salon_id UUID,
    p_service_id UUID,
    p_employe_id UUID DEFAULT NULL,
    p_debut TIMESTAMPTZ DEFAULT NULL,
    p_client_nom TEXT DEFAULT NULL,
    p_client_telephone TEXT DEFAULT NULL,
    p_client_email TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_service RECORD;
    v_employe RECORD;
    v_salon RECORD;
    v_fin TIMESTAMPTZ;
    v_client_id UUID;
    v_rdv_id UUID;
    v_token UUID;
    v_conflict_count INT;
BEGIN
    -- 0. Validation des paramètres obligatoires
    IF p_salon_id IS NULL THEN
        RAISE EXCEPTION 'Identifiant du salon requis';
    END IF;
    IF p_service_id IS NULL THEN
        RAISE EXCEPTION 'Identifiant de la prestation requis';
    END IF;
    IF p_debut IS NULL THEN
        RAISE EXCEPTION 'Date et heure du rendez-vous requises';
    END IF;
    IF p_client_nom IS NULL OR TRIM(p_client_nom) = '' THEN
        RAISE EXCEPTION 'Nom du client requis';
    END IF;
    IF p_client_telephone IS NULL OR TRIM(p_client_telephone) = '' THEN
        RAISE EXCEPTION 'Numéro de téléphone du client requis';
    END IF;

    -- 1. Vérifier le salon
    SELECT * INTO v_salon FROM salons WHERE id = p_salon_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Salon introuvable dans la base de données';
    END IF;

    -- 2. Vérifier le service
    SELECT * INTO v_service FROM services WHERE id = p_service_id AND salon_id = p_salon_id AND actif = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service introuvable ou indisponible';
    END IF;

    -- 3. Gestion et vérification de l'employé
    IF p_employe_id IS NOT NULL THEN
        SELECT * INTO v_employe FROM employes WHERE id = p_employe_id AND salon_id = p_salon_id AND actif = true;
        IF NOT FOUND THEN
            -- Si l'employé demandé n'est pas trouvé dans ce salon, chercher un employé disponible
            p_employe_id := NULL;
        END IF;
    END IF;

    -- Si aucun employé spécifié ou valide, en choisir un automatiquement qualifié et libre
    IF p_employe_id IS NULL THEN
        SELECT e.id INTO p_employe_id
        FROM employes e
        JOIN employe_services es ON es.employe_id = e.id
        WHERE e.salon_id = p_salon_id 
          AND es.service_id = p_service_id 
          AND e.actif = true
          AND NOT EXISTS (
              SELECT 1 FROM rendez_vous r
              WHERE r.employe_id = e.id
                AND r.statut != 'annule'
                AND tstzrange(r.debut, r.fin) && tstzrange(p_debut, p_debut + (v_service.duree_minutes || ' minutes')::interval)
          )
        LIMIT 1;

        -- Fallback si employe_services n'est pas encore renseigné pour ce service
        IF p_employe_id IS NULL THEN
            SELECT e.id INTO p_employe_id
            FROM employes e
            WHERE e.salon_id = p_salon_id 
              AND e.actif = true
              AND NOT EXISTS (
                  SELECT 1 FROM rendez_vous r
                  WHERE r.employe_id = e.id
                    AND r.statut != 'annule'
                    AND tstzrange(r.debut, r.fin) && tstzrange(p_debut, p_debut + (v_service.duree_minutes || ' minutes')::interval)
              )
            LIMIT 1;
        END IF;

        IF p_employe_id IS NULL THEN
            RAISE EXCEPTION 'Aucun coiffeur disponible pour ce créneau';
        END IF;
    END IF;

    -- 4. Calcul de l'heure de fin
    v_fin := p_debut + (v_service.duree_minutes || ' minutes')::interval;

    -- 5. Vérifier que la date est dans le futur et respecte le délai minimum (avec tolérance de 5 min)
    IF p_debut < (now() + ((COALESCE(v_salon.delai_min_heures, 0.5) * 60 - 5) || ' minutes')::interval) THEN
        RAISE EXCEPTION 'Le créneau demandé ne respecte pas le délai minimum de réservation (% heures)', COALESCE(v_salon.delai_min_heures, 1);
    END IF;

    -- 6. Vérifier qu'il n'y a pas de conflit de rendez-vous pour cet employé
    SELECT COUNT(*) INTO v_conflict_count
    FROM rendez_vous
    WHERE employe_id = p_employe_id
      AND statut != 'annule'
      AND tstzrange(debut, fin) && tstzrange(p_debut, v_fin);

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Ce créneau vient d''être pris, choisissez-en un autre';
    END IF;

    -- 7. Upsert du client (créer ou retrouver par téléphone pour ce salon avant d'insérer le rdv)
    SELECT id INTO v_client_id 
    FROM clients 
    WHERE salon_id = p_salon_id 
      AND (
        telephone = TRIM(p_client_telephone)
        OR REPLACE(REPLACE(telephone, ' ', ''), '+', '') = REPLACE(REPLACE(TRIM(p_client_telephone), ' ', ''), '+', '')
      )
    LIMIT 1;

    IF v_client_id IS NULL THEN
        INSERT INTO clients (salon_id, nom, telephone, email)
        VALUES (
            p_salon_id,
            TRIM(p_client_nom),
            TRIM(p_client_telephone),
            NULLIF(TRIM(p_client_email), '')
        )
        RETURNING id INTO v_client_id;
    ELSE
        -- Mettre à jour le nom et l'email si fournis
        UPDATE clients 
        SET nom = TRIM(p_client_nom), 
            email = COALESCE(NULLIF(TRIM(p_client_email), ''), email),
            updated_at = now()
        WHERE id = v_client_id;
    END IF;

    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Impossible de créer ou récupérer le profil client';
    END IF;

    -- 8. Insérer le rendez-vous dans la table rendez_vous
    v_token := gen_random_uuid();
    INSERT INTO rendez_vous (
        salon_id, client_id, employe_id, service_id,
        debut, fin, statut, prix_fcfa, notes,
        token_annulation, source
    )
    VALUES (
        p_salon_id, v_client_id, p_employe_id, p_service_id,
        p_debut, v_fin, 'confirme', v_service.prix_fcfa, p_notes,
        v_token, 'en_ligne'
    )
    RETURNING id INTO v_rdv_id;

    -- 9. Retourner l'objet récapitulatif JSONB
    RETURN jsonb_build_object(
        'success', true,
        'rdv_id', v_rdv_id,
        'token_annulation', v_token,
        'debut', p_debut,
        'fin', v_fin,
        'prix_fcfa', v_service.prix_fcfa,
        'service_nom', v_service.nom,
        'salon_nom', v_salon.nom,
        'salon_telephone', v_salon.telephone
    );
END;
$$;

-- E. Récupérer les informations d'une réservation pour annulation (public via token)
CREATE OR REPLACE FUNCTION get_reservation_par_token(p_token UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', r.id,
        'debut', r.debut,
        'fin', r.fin,
        'statut', r.statut,
        'prix_fcfa', r.prix_fcfa,
        'service_nom', s.nom,
        'duree_minutes', s.duree_minutes,
        'salon_nom', sa.nom,
        'salon_slug', sa.slug,
        'salon_telephone', sa.telephone,
        'salon_adresse', sa.adresse,
        'salon_ville', sa.ville,
        'employe_nom', e.nom,
        'client_nom', c.nom,
        'client_telephone', c.telephone
    ) INTO v_result
    FROM rendez_vous r
    JOIN services s ON s.id = r.service_id
    JOIN salons sa ON sa.id = r.salon_id
    JOIN employes e ON e.id = r.employe_id
    JOIN clients c ON c.id = r.client_id
    WHERE r.token_annulation = p_token;

    RETURN v_result;
END;
$$;

-- F. Annuler une réservation via le token unique
CREATE OR REPLACE FUNCTION annuler_reservation_publique(p_token UUID, p_motif TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_rdv RECORD;
BEGIN
    SELECT * INTO v_rdv FROM rendez_vous WHERE token_annulation = p_token;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Rendez-vous introuvable');
    END IF;

    IF v_rdv.statut = 'annule' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Ce rendez-vous est déjà annulé');
    END IF;

    IF v_rdv.statut = 'termine' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Impossible d''annuler un rendez-vous déjà effectué');
    END IF;

    UPDATE rendez_vous
    SET statut = 'annule',
        notes = CASE WHEN p_motif IS NOT NULL THEN COALESCE(notes, '') || ' [Annulé par le client: ' || p_motif || ']' ELSE notes END,
        updated_at = now()
    WHERE id = v_rdv.id;

    RETURN jsonb_build_object('success', true, 'message', 'Rendez-vous annulé avec succès');
END;
$$;

-- ==============================================================================
-- 7. ATTRIBUTION DES DROITS D'EXÉCUTION (GRANT EXECUTE AUX RÔLES ANON & AUTHENTICATED)
-- Crucial pour permettre la réservation publique sans bloquer les visiteurs /s/:slug
-- ==============================================================================
GRANT EXECUTE ON FUNCTION get_salon_public(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_services_public(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_employes_public(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION creer_reservation_publique(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_reservation_par_token(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION annuler_reservation_publique(UUID, TEXT) TO anon, authenticated;
