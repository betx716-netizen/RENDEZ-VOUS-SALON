# Guide de Marque — RDV Salon

## 1. Philosophie & Direction Visuelle
**Style : Néo-brutal**  
Une identité joyeuse, franche et très « réseaux sociaux », pensée pour les salons de coiffure, tresses, ongleries et instituts de beauté en Côte d'Ivoire (Abidjan, Yamoussoukro, Bouaké...). Elle se remarque dans un fil Instagram ou un statut WhatsApp.

- **Esthétique** : bordures noires de 2 px, ombres dures décalées sans flou, aplats acidulés, éléments légèrement inclinés, fond papier pointillé. Aucun dégradé, aucun flou.
- **Mouvement** : les éléments cliquables se soulèvent au survol et s'enfoncent au clic (utilitaire `press`) ; les sélections basculent d'un ou deux degrés.
- **Ressenti** : vivant, accessible, sûr de lui.

---

## 2. Palette de Couleurs

Toutes les valeurs vivent dans [`src/styles/tokens.css`](../styles/tokens.css).

| Nom de variable | Code Hex | Usage Principal |
| :--- | :--- | :--- |
| `--ink` | `#111111` | Texte, bordures, ombres dures |
| `--paper` | `#FFFDF5` | Fond de page (avec le motif `bg-dots`) |
| `--surface` | `#FFFFFF` | Cartes, conteneurs principaux, modales |
| `--surface-alt` | `#F4F0E3` | Zones secondaires, survol |
| `--muted-foreground`| `#55524A` | Sous-titres, libellés secondaires |
| `--primary` (violet) | `#6A4CF5` | Boutons d'action, sélection, onglet actif |
| `--primary-hover` | `#5536E0` | État hover/active des boutons principaux |
| `--lime` | `#C6F432` | Surlignage (`marker`), succès, grand CTA, carte sélectionnée |
| `--candy` | `#FF8AD8` | Accents, autocollants, alertes douces |
| `--sun` | `#FFD23F` | Étiquettes de prix, étoiles |
| `--accent` | `#D9258A` | Icônes et texte rose (contraste suffisant sur blanc) |
| `--success` | `#1F8A4C` | WhatsApp, confirmations |
| `--destructive` | `#E5322D` | Annulations, erreurs |

Règle de contraste : sur `lime`, `candy` et `sun`, le texte est toujours en encre (`text-ink`) ; sur `primary`, toujours en blanc.

---

## 3. Typographie

**Space Grotesk** pour tout : 700 pour les titres (interlettrage `-0.03em`, interlignage serré), 400/500 pour le texte courant. 16px minimum dans les champs pour éviter le zoom iOS. Les prix et heures utilisent `tabular-nums`.

---

## 4. Logo & Monogramme

### Structure
- **Le Monogramme "R"** : tuile violette cerclée d'encre avec ombre dure ; le « R » blanc intègre un ciseau et des dents de peigne citron.
- **Le Typogramme "RDV Salon"** : Space Grotesk Bold, « Salon » surligné au marqueur citron.

### Versions disponibles
1. **Complète (`variant="full"`)** : Utilisée dans les en-têtes desktop et la landing page.
2. **Icône seule (`variant="icon"`)** : Utilisée pour l'icône de navigateur, les avatars, et la barre mobile.
3. **Monochrome (`variant="monochrome"`)** : Pour les fonds sombres (footer, section finale) ou les impressions noir et blanc.

### Tailles minimales
- Icône seule : minimum 24 × 24 px.
- Logo complet : minimum 120 × 32 px.
- Zone de sécurité : laisser au minimum la moitié de la largeur du "R" autour du logo.

---

## 5. Ton de Voix & Ligne Éditoriale

| Public | Registre | Exemples de phrases |
| :--- | :--- | :--- |
| **Gérant(e) de salon** | **Vouvoiement** respectueux, valorisant et orienté gain de temps | *"Remplissez votre salon sans décrocher le téléphone."*<br>*"Vos clientes réservent toutes seules, votre équipe sait exactement quoi faire."* |
| **Cliente finale** | **Tutoiement** bienveillant, direct, simple et rassurant | *"Choisis ta prestation et ton heure préférée."*<br>*"Ton rendez-vous est confirmé ! Reçois ton rappel sur WhatsApp."* |

- **Zéro jargon technique** : Pas de "SaaS multi-tenant", ni de "cloud database". On parle de "votre lien de réservation", "rappels WhatsApp", "votre planning" et "chiffre d'affaires en FCFA".
- **Ancrage local ivoirien** : Prix indiqués en **FCFA**, quartiers d'Abidjan (Cocody, Marcory, Yopougon, Plateau, Angré...) et utilisation intuitive de WhatsApp comme canal de confiance numéro un.
