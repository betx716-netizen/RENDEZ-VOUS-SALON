-- ==============================================================================
-- MIGRATION 01 - SÉCURITÉ & FIABILITÉ DE LA RÉSERVATION PUBLIQUE
-- À exécuter UNE fois dans Supabase > SQL Editor, après schema.sql.
-- Le script est idempotent : il peut être relancé sans risque.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. DÉLAI MINIMUM EN HEURES DÉCIMALES
-- Les Paramètres proposent « 30 minutes à l'avance » (0.5) mais la colonne était
-- un entier : l'enregistrement échouait. La fonction publique qui renvoie ce champ
-- doit être recréée car son type de retour change.
-- ------------------------------------------------------------------------------
ALTER TABLE salons ALTER COLUMN delai_min_heures TYPE NUMERIC(4,2);

DROP FUNCTION IF EXISTS get_salon_public(TEXT);
CREATE FUNCTION get_salon_public(p_slug TEXT)
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
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
GRANT EXECUTE ON FUNCTION get_salon_public(TEXT) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 1. FERMER LA LECTURE PUBLIQUE DIRECTE DES TABLES
-- Les politiques ci-dessous permettaient à n'importe qui (avec la clé anon, qui est
-- publique par nature) de lister les employés de TOUS les salons, avec leurs
-- numéros de téléphone, ainsi que toutes les prestations de tous les salons.
-- La page de réservation passe déjà par les fonctions RPC : on peut les supprimer.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Employes publics consultables par tous" ON employes;
DROP POLICY IF EXISTS "Services publics consultables par tous" ON services;

-- ------------------------------------------------------------------------------
-- 2. FIGER LE search_path DES FONCTIONS SECURITY DEFINER
-- Sans cela, une fonction SECURITY DEFINER peut être détournée via un schéma piégé.
-- ------------------------------------------------------------------------------
-- (get_salon_public est déjà recréée avec son search_path à l'étape 0)
ALTER FUNCTION get_services_public(UUID) SET search_path = public;
ALTER FUNCTION get_employes_public(UUID, UUID) SET search_path = public;
ALTER FUNCTION get_reservation_par_token(UUID) SET search_path = public;

-- ------------------------------------------------------------------------------
-- 3. RÈGLES DE DISPONIBILITÉ CÔTÉ SERVEUR
-- Avant : la réservation publique acceptait n'importe quelle heure (3h du matin,
-- dimanche, pendant un congé, hors pause...). Désormais le serveur applique les
-- mêmes règles que le calculateur de créneaux de l'application.
-- ------------------------------------------------------------------------------

-- Un employé sans prestation attribuée peut tout faire ; sinon seulement ses prestations.
CREATE OR REPLACE FUNCTION employe_qualifie(p_employe_id UUID, p_service_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT NOT EXISTS (SELECT 1 FROM employe_services WHERE employe_id = p_employe_id)
        OR EXISTS (SELECT 1 FROM employe_services WHERE employe_id = p_employe_id AND service_id = p_service_id);
$$;

-- Horaires (heure d'Abidjan), pause, congés et rendez-vous existants.
CREATE OR REPLACE FUNCTION employe_disponible(p_employe_id UUID, p_debut TIMESTAMPTZ, p_fin TIMESTAMPTZ)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_h RECORD;
    v_local_debut TIMESTAMP := p_debut AT TIME ZONE 'Africa/Abidjan';
    v_local_fin   TIMESTAMP := p_fin   AT TIME ZONE 'Africa/Abidjan';
    v_jour INT := EXTRACT(DOW FROM v_local_debut)::INT;
    v_ouvert BOOLEAN;
    v_hd TIME; v_hf TIME; v_pd TIME; v_pf TIME;
BEGIN
    -- Une prestation ne peut pas déborder sur le lendemain
    IF v_local_fin::date <> v_local_debut::date THEN
        RETURN false;
    END IF;

    SELECT * INTO v_h FROM horaires_employes
    WHERE employe_id = p_employe_id AND jour_semaine = v_jour;

    IF FOUND THEN
        v_ouvert := v_h.est_ouvert;
        v_hd := v_h.heure_debut; v_hf := v_h.heure_fin;
        v_pd := v_h.pause_debut; v_pf := v_h.pause_fin;
    ELSE
        -- Mêmes horaires par défaut que src/lib/slot-calculator.ts
        v_ouvert := v_jour <> 0;
        v_hd := '08:30'; v_hf := '19:00';
        v_pd := '13:00'; v_pf := '14:00';
    END IF;

    IF NOT v_ouvert THEN
        RETURN false;
    END IF;

    IF v_local_debut::time < v_hd OR v_local_fin::time > v_hf THEN
        RETURN false;
    END IF;

    IF v_pd IS NOT NULL AND v_pf IS NOT NULL
       AND v_local_debut::time < v_pf AND v_local_fin::time > v_pd THEN
        RETURN false;
    END IF;

    IF EXISTS (
        SELECT 1 FROM conges c
        WHERE c.employe_id = p_employe_id
          AND tstzrange(c.debut, c.fin) && tstzrange(p_debut, p_fin)
    ) THEN
        RETURN false;
    END IF;

    IF EXISTS (
        SELECT 1 FROM rendez_vous r
        WHERE r.employe_id = p_employe_id
          AND r.statut <> 'annule'
          AND tstzrange(r.debut, r.fin) && tstzrange(p_debut, p_fin)
    ) THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

-- Fonctions internes : appelées uniquement depuis les RPC ci-dessous
REVOKE EXECUTE ON FUNCTION employe_qualifie(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION employe_disponible(UUID, TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;

-- ------------------------------------------------------------------------------
-- 4. RÉSERVATION PUBLIQUE DURCIE
-- Même signature et même format de réponse qu'avant (l'application n'a rien à changer).
-- Ajouts : horaires/congés/pause vérifiés, délai maximum, employé qualifié,
-- longueurs limitées, 3 RDV à venir max par téléphone, fiche client existante
-- non écrasée par un inconnu, message clair en cas de course entre deux clients.
-- ------------------------------------------------------------------------------
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
    v_salon RECORD;
    v_service RECORD;
    v_fin TIMESTAMPTZ;
    v_client_id UUID;
    v_rdv_id UUID;
    v_token UUID;
    v_employe_nom TEXT;
    v_quelquun_qualifie BOOLEAN;
    v_rdv_a_venir INT;
    v_nom TEXT := LEFT(TRIM(COALESCE(p_client_nom, '')), 100);
    v_tel TEXT := LEFT(TRIM(COALESCE(p_client_telephone, '')), 30);
    v_tel_chiffres TEXT := regexp_replace(COALESCE(p_client_telephone, ''), '[^0-9]', '', 'g');
    v_email TEXT := NULLIF(LEFT(TRIM(COALESCE(p_client_email, '')), 255), '');
    v_notes TEXT := NULLIF(LEFT(TRIM(COALESCE(p_notes, '')), 500), '');
BEGIN
    -- 0. Validation des paramètres
    IF p_salon_id IS NULL THEN
        RAISE EXCEPTION 'Identifiant du salon requis';
    END IF;
    IF p_service_id IS NULL THEN
        RAISE EXCEPTION 'Identifiant de la prestation requis';
    END IF;
    IF p_debut IS NULL THEN
        RAISE EXCEPTION 'Date et heure du rendez-vous requises';
    END IF;
    IF length(v_nom) < 2 THEN
        RAISE EXCEPTION 'Nom du client requis';
    END IF;
    IF length(v_tel_chiffres) NOT BETWEEN 8 AND 15 THEN
        RAISE EXCEPTION 'Numéro de téléphone invalide (ex: +225 07 00 00 00 00)';
    END IF;

    -- 1. Salon
    SELECT * INTO v_salon FROM salons WHERE id = p_salon_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Salon introuvable dans la base de données';
    END IF;

    -- 2. Prestation
    SELECT * INTO v_service FROM services
    WHERE id = p_service_id AND salon_id = p_salon_id AND actif = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service introuvable ou indisponible';
    END IF;

    v_fin := p_debut + make_interval(mins => v_service.duree_minutes);

    -- 3. Délais minimum (tolérance 5 min) et maximum
    IF p_debut < now() + make_interval(mins => GREATEST(COALESCE(v_salon.delai_min_heures, 0) * 60 - 5, 0)::INT) THEN
        RAISE EXCEPTION 'Le créneau demandé ne respecte pas le délai minimum de réservation (% heures)', COALESCE(v_salon.delai_min_heures, 0);
    END IF;
    IF p_debut > now() + make_interval(days => COALESCE(v_salon.delai_max_jours, 60)) THEN
        RAISE EXCEPTION 'Ce créneau est trop loin dans le futur (maximum % jours)', COALESCE(v_salon.delai_max_jours, 60);
    END IF;

    -- 4. Anti-abus : pas plus de 3 rendez-vous à venir par numéro dans un même salon
    SELECT COUNT(*) INTO v_rdv_a_venir
    FROM rendez_vous r
    JOIN clients c ON c.id = r.client_id
    WHERE r.salon_id = p_salon_id
      AND r.statut IN ('en_attente', 'confirme')
      AND r.debut > now()
      AND right(regexp_replace(c.telephone, '[^0-9]', '', 'g'), 10) = right(v_tel_chiffres, 10);
    IF v_rdv_a_venir >= 3 THEN
        RAISE EXCEPTION 'Vous avez déjà 3 rendez-vous à venir dans ce salon. Contactez le salon directement.';
    END IF;

    -- 5. Employé : qualifié pour la prestation ET réellement disponible
    v_quelquun_qualifie := EXISTS (
        SELECT 1 FROM employes e
        WHERE e.salon_id = p_salon_id AND e.actif = true
          AND employe_qualifie(e.id, p_service_id)
    );

    IF p_employe_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM employes e
            WHERE e.id = p_employe_id AND e.salon_id = p_salon_id AND e.actif = true
              AND (NOT v_quelquun_qualifie OR employe_qualifie(e.id, p_service_id))
        ) THEN
            -- Employé inconnu, inactif ou non qualifié : on en choisit un automatiquement
            p_employe_id := NULL;
        ELSIF NOT employe_disponible(p_employe_id, p_debut, v_fin) THEN
            RAISE EXCEPTION 'Ce créneau vient d''être pris, choisissez-en un autre';
        END IF;
    END IF;

    IF p_employe_id IS NULL THEN
        SELECT e.id INTO p_employe_id
        FROM employes e
        WHERE e.salon_id = p_salon_id
          AND e.actif = true
          AND (NOT v_quelquun_qualifie OR employe_qualifie(e.id, p_service_id))
          AND employe_disponible(e.id, p_debut, v_fin)
        ORDER BY e.nom
        LIMIT 1;

        IF p_employe_id IS NULL THEN
            RAISE EXCEPTION 'Aucun coiffeur disponible pour ce créneau';
        END IF;
    END IF;

    SELECT nom INTO v_employe_nom FROM employes WHERE id = p_employe_id;

    -- 6. Client : retrouvé par numéro (10 derniers chiffres), sinon créé.
    -- Une fiche existante n'est jamais renommée par une réservation anonyme.
    SELECT id INTO v_client_id
    FROM clients
    WHERE salon_id = p_salon_id
      AND right(regexp_replace(telephone, '[^0-9]', '', 'g'), 10) = right(v_tel_chiffres, 10)
    LIMIT 1;

    IF v_client_id IS NULL THEN
        INSERT INTO clients (salon_id, nom, telephone, email)
        VALUES (p_salon_id, v_nom, v_tel, v_email)
        RETURNING id INTO v_client_id;
    ELSIF v_email IS NOT NULL THEN
        UPDATE clients SET email = v_email, updated_at = now()
        WHERE id = v_client_id AND email IS NULL;
    END IF;

    -- 7. Rendez-vous (la contrainte d'exclusion tranche si deux clients valident en même temps)
    v_token := gen_random_uuid();
    BEGIN
        INSERT INTO rendez_vous (
            salon_id, client_id, employe_id, service_id,
            debut, fin, statut, prix_fcfa, notes,
            token_annulation, source
        )
        VALUES (
            p_salon_id, v_client_id, p_employe_id, p_service_id,
            p_debut, v_fin, 'confirme', v_service.prix_fcfa, v_notes,
            v_token, 'en_ligne'
        )
        RETURNING id INTO v_rdv_id;
    EXCEPTION WHEN exclusion_violation THEN
        RAISE EXCEPTION 'Ce créneau vient d''être pris, choisissez-en un autre';
    END;

    RETURN jsonb_build_object(
        'success', true,
        'rdv_id', v_rdv_id,
        'token_annulation', v_token,
        'debut', p_debut,
        'fin', v_fin,
        'prix_fcfa', v_service.prix_fcfa,
        'service_nom', v_service.nom,
        'employe_id', p_employe_id,
        'employe_nom', v_employe_nom,
        'salon_nom', v_salon.nom,
        'salon_telephone', v_salon.telephone
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. ANNULATION PUBLIQUE : uniquement un RDV à venir, encore actif
-- Avant : un client pouvait « annuler » un RDV passé ou marqué absent (et effacer
-- ainsi son no-show).
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION annuler_reservation_publique(p_token UUID, p_motif TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_rdv RECORD;
    v_motif TEXT := NULLIF(LEFT(TRIM(COALESCE(p_motif, '')), 300), '');
BEGIN
    SELECT * INTO v_rdv FROM rendez_vous WHERE token_annulation = p_token;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Rendez-vous introuvable');
    END IF;

    IF v_rdv.statut = 'annule' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Ce rendez-vous est déjà annulé');
    END IF;

    IF v_rdv.statut IN ('termine', 'absent') OR v_rdv.debut <= now() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Impossible d''annuler un rendez-vous déjà passé');
    END IF;

    UPDATE rendez_vous
    SET statut = 'annule',
        notes = CASE
            WHEN v_motif IS NOT NULL THEN COALESCE(notes, '') || ' [Annulé par le client: ' || v_motif || ']'
            ELSE notes
        END,
        updated_at = now()
    WHERE id = v_rdv.id;

    RETURN jsonb_build_object('success', true, 'message', 'Rendez-vous annulé avec succès');
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. DISPONIBILITÉS PUBLIQUES (pour afficher les vrais créneaux libres)
-- Avant : la page publique ne pouvait lire ni les horaires, ni les congés, ni les
-- RDV existants (bloqués par RLS) ; elle affichait donc des créneaux déjà pris.
-- Seules les plages occupées sont exposées : aucune donnée client.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_disponibilites_public(p_salon_id UUID)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT jsonb_build_object(
        'horaires', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'employe_id', h.employe_id,
                'jour_semaine', h.jour_semaine,
                'est_ouvert', h.est_ouvert,
                'heure_debut', left(h.heure_debut::text, 5),
                'heure_fin', left(h.heure_fin::text, 5),
                'pause_debut', left(h.pause_debut::text, 5),
                'pause_fin', left(h.pause_fin::text, 5)
            ))
            FROM horaires_employes h
            WHERE h.salon_id = p_salon_id
        ), '[]'::jsonb),
        'conges', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('employe_id', c.employe_id, 'debut', c.debut, 'fin', c.fin))
            FROM conges c
            WHERE c.salon_id = p_salon_id AND c.fin > now()
        ), '[]'::jsonb),
        'occupations', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('employe_id', r.employe_id, 'debut', r.debut, 'fin', r.fin))
            FROM rendez_vous r
            WHERE r.salon_id = p_salon_id
              AND r.statut <> 'annule'
              AND r.fin > now()
              AND r.debut < now() + interval '120 days'
        ), '[]'::jsonb),
        'employe_services', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('employe_id', es.employe_id, 'service_id', es.service_id))
            FROM employe_services es
            JOIN employes e ON e.id = es.employe_id
            WHERE e.salon_id = p_salon_id
        ), '[]'::jsonb)
    );
$$;

GRANT EXECUTE ON FUNCTION creer_reservation_publique(UUID, UUID, UUID, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION annuler_reservation_publique(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_disponibilites_public(UUID) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 7. VÉRIFICATION (à lire après exécution)
-- Doit lister uniquement les politiques "Proprietaire ..." : aucune politique
-- destinée au rôle anon ne doit apparaître.
-- ------------------------------------------------------------------------------
SELECT tablename, policyname, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
