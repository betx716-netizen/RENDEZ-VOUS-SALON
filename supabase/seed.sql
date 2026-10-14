-- ==============================================================================
-- DONNÉES DE DÉMONSTRATION - RDV SALON (Abidjan, Côte d'Ivoire)
-- ==============================================================================

-- Remplacez '00000000-0000-0000-0000-000000000001' par un UUID utilisateur Supabase Auth réel
-- ou utilisez ces données pour peupler votre premier salon créé.

DO $$
DECLARE
    v_user_id UUID := '00000000-0000-0000-0000-000000000001';
    v_salon_id UUID := '11111111-1111-1111-1111-111111111111';
    
    v_emp1 UUID := gen_random_uuid();
    v_emp2 UUID := gen_random_uuid();
    v_emp3 UUID := gen_random_uuid();
    v_emp4 UUID := gen_random_uuid();

    v_srv1 UUID := gen_random_uuid();
    v_srv2 UUID := gen_random_uuid();
    v_srv3 UUID := gen_random_uuid();
    v_srv4 UUID := gen_random_uuid();
    v_srv5 UUID := gen_random_uuid();
    v_srv6 UUID := gen_random_uuid();
    v_srv7 UUID := gen_random_uuid();

    v_cli1 UUID := gen_random_uuid();
    v_cli2 UUID := gen_random_uuid();
    v_cli3 UUID := gen_random_uuid();
    v_cli4 UUID := gen_random_uuid();
    v_cli5 UUID := gen_random_uuid();
BEGIN
    -- 1. SALON
    INSERT INTO salons (id, proprietaire_id, nom, slug, telephone, adresse, ville, commune, description, delai_min_heures, delai_max_jours, pas_creneau_minutes)
    VALUES (
        v_salon_id,
        v_user_id,
        'Ébène & Or Beauté Abidjan',
        'ebene-et-or-abidjan',
        '+225 07 08 09 10 11',
        'Boulevard François Mitterrand, Riviera 3',
        'Abidjan',
        'Cocody',
        'Votre espace d''exception pour tresses haut de gamme, soins capillaires afro & texturés, barbier styliste et institut de beauté à Abidjan.',
        2,
        45,
        30
    ) ON CONFLICT (slug) DO NOTHING;

    -- 2. EMPLOYÉS
    INSERT INTO employes (id, salon_id, nom, telephone, role, couleur_agenda, actif) VALUES
    (v_emp1, v_salon_id, 'Aminata Kouassi', '+225 07 48 11 22 33', 'Spécialiste Tresses & Locks', '#D97706', true),
    (v_emp2, v_salon_id, 'Jean-Marc Konan', '+225 05 55 44 33 22', 'Barbier Styliste Homme', '#2563EB', true),
    (v_emp3, v_salon_id, 'Marie-Paule Yao', '+225 01 02 03 04 05', 'Coiffeuse Styliste & Soins', '#9333EA', true),
    (v_emp4, v_salon_id, 'Fatou Cissé', '+225 07 77 88 99 00', 'Esthéticienne & Onglerie', '#E11D48', true)
    ON CONFLICT DO NOTHING;

    -- 3. SERVICES
    INSERT INTO services (id, salon_id, nom, categorie, duree_minutes, prix_fcfa, description, actif) VALUES
    (v_srv1, v_salon_id, 'Knotless Braids Moyennes (Dos)', 'Tresses & Nattes', 180, 20000, 'Tresses sans nœud douces pour les tempes avec mèches fournies et finition mousse.', true),
    (v_srv2, v_salon_id, 'Pose & Retouche Locks / Dreadlocks', 'Locks & Nattes', 120, 15000, 'Tournage au crochet ou gel avec bain d''huiles végétales et séchage sous casque.', true),
    (v_srv3, v_salon_id, 'Soin Profond Vapeur & Brushing Silk Press', 'Soins Capillaires', 75, 12000, 'Soin hydratant profond sous casque à vapeur d''ozone, massage crânien et lissage soyeux.', true),
    (v_srv4, v_salon_id, 'Coupe Dégradé Américain & Traçage Barbe', 'Barbier & Homme', 40, 5000, 'Coupe moderne aux ciseaux/tondeuse, contours ultra précis et serviette chaude.', true),
    (v_srv5, v_salon_id, 'Soin Barbe Prestige & Traitement Huiles', 'Barbier & Homme', 30, 4000, 'Shampoing purifiant barbe, gommage, vapeur tiède et hydratation au karité bio.', true),
    (v_srv6, v_salon_id, 'Manucure Russe & Pose Gel UV', 'Onglerie & Beauté', 60, 10000, 'Nettoyage des cuticules, renforcement gel et vernis semi-permanent longue tenue.', true),
    (v_srv7, v_salon_id, 'Pédicure Spa Complète & Bain Pétillant', 'Onglerie & Beauté', 60, 12000, 'Gommage aux sels marins, râpage doux, masque hydratant et massage des pieds.', true)
    ON CONFLICT DO NOTHING;

    -- 4. HORAIRES EMPLOYÉS (Lundi au Samedi 8h30 - 19h00, pause 13h-14h)
    FOR i IN 1..6 LOOP
        INSERT INTO horaires_employes (salon_id, employe_id, jour_semaine, est_ouvert, heure_debut, heure_fin, pause_debut, pause_fin)
        VALUES 
        (v_salon_id, v_emp1, i, true, '08:30:00', '19:00:00', '13:00:00', '14:00:00'),
        (v_salon_id, v_emp2, i, true, '08:30:00', '19:00:00', '13:00:00', '14:00:00'),
        (v_salon_id, v_emp3, i, true, '08:30:00', '19:00:00', '13:00:00', '14:00:00'),
        (v_salon_id, v_emp4, i, true, '08:30:00', '19:00:00', '13:00:00', '14:00:00')
        ON CONFLICT (employe_id, jour_semaine) DO NOTHING;
    END LOOP;

    -- Dimanche : repos
    INSERT INTO horaires_employes (salon_id, employe_id, jour_semaine, est_ouvert)
    VALUES 
    (v_salon_id, v_emp1, 0, false),
    (v_salon_id, v_emp2, 0, false),
    (v_salon_id, v_emp3, 0, false),
    (v_salon_id, v_emp4, 0, false)
    ON CONFLICT (employe_id, jour_semaine) DO NOTHING;

    -- 5. LIAISONS EMPLOYÉ <-> SERVICES
    INSERT INTO employe_services (employe_id, service_id) VALUES
    (v_emp1, v_srv1), (v_emp1, v_srv2),
    (v_emp2, v_srv4), (v_emp2, v_srv5),
    (v_emp3, v_srv1), (v_emp3, v_srv3),
    (v_emp4, v_srv6), (v_emp4, v_srv7)
    ON CONFLICT DO NOTHING;

    -- 6. CLIENTS
    INSERT INTO clients (id, salon_id, nom, telephone, email, notes, nb_absences) VALUES
    (v_cli1, v_salon_id, 'Aïcha Traoré', '+225 07 12 34 56 78', 'aicha.traore@gmail.com', 'Cuir chevelu sensible, préfère les mèches couleur 1B/27.', 0),
    (v_cli2, v_salon_id, 'Stéphane Bamba', '+225 05 98 76 54 32', 's.bamba@ci-telecom.ci', 'Vient toujours le vendredi pour son dégradé.', 0),
    (v_cli3, v_salon_id, 'Clarisse N''Guessan', '+225 01 44 55 66 77', 'clarisse.nguessan@yahoo.fr', 'Adore la manucure nude avec nail art discret.', 1),
    (v_cli4, v_salon_id, 'Koffi Franck', '+225 07 65 43 21 09', 'koffi.franck@orange.ci', 'Fidèle depuis l''ouverture.', 0),
    (v_cli5, v_salon_id, 'Sandrine Kassi', '+225 05 11 22 33 44', 'sandrine.kassi@outlook.com', 'Prend souvent soin vapeur + tresses.', 0)
    ON CONFLICT (salon_id, telephone) DO NOTHING;

    -- 7. RENDEZ-VOUS D'EXEMPLE POUR AUJOURD'HUI ET CETTE SEMAINE
    INSERT INTO rendez_vous (salon_id, client_id, employe_id, service_id, debut, fin, statut, prix_fcfa, source, notes) VALUES
    (v_salon_id, v_cli1, v_emp1, v_srv1, CURRENT_DATE + TIME '09:00:00', CURRENT_DATE + TIME '12:00:00', 'termine', 20000, 'en_ligne', 'Rendez-vous bien passé, payé par Wave.'),
    (v_salon_id, v_cli2, v_emp2, v_srv4, CURRENT_DATE + TIME '10:00:00', CURRENT_DATE + TIME '10:40:00', 'termine', 5000, 'en_ligne', 'Régulier'),
    (v_salon_id, v_cli3, v_emp4, v_srv6, CURRENT_DATE + TIME '14:00:00', CURRENT_DATE + TIME '15:00:00', 'confirme', 10000, 'en_ligne', 'Demande french manucure'),
    (v_salon_id, v_cli4, v_emp2, v_srv5, CURRENT_DATE + TIME '15:30:00', CURRENT_DATE + TIME '16:00:00', 'en_attente', 4000, 'manuel', 'Appelé par téléphone'),
    (v_salon_id, v_cli5, v_emp3, v_srv3, CURRENT_DATE + TIME '16:30:00', CURRENT_DATE + TIME '17:45:00', 'confirme', 12000, 'en_ligne', 'Client VIP')
    ON CONFLICT DO NOTHING;

END $$;
