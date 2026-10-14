import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Smartphone,
  Eye,
  Layers,
  Palette,
  Type,
  Maximize2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../components/brand/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BentoCard } from '../components/landing/BentoCard';
import { MagneticButton } from '../components/motion/MagneticButton';
import { TracedUnderline } from '../components/motion/TracedUnderline';
import {
  ScissorsIllustration,
  CombIllustration,
  HairDryerIllustration,
  MirrorIllustration,
  NailPolishIllustration,
  MakeupBrushIllustration,
  BotanicalIllustration,
  SparkleIllustration,
} from '../components/illustrations';
import { WaveSeparator, ArchSeparator, PebbleSeparator } from '../components/illustrations/OrganicSeparators';
import { usePerformanceTier, PerformanceTier } from '../lib/tier';
import { useToast } from '../context/ToastContext';

export const DesignSystemPage: React.FC = () => {
  const currentTier = usePerformanceTier();
  const { success, error, info } = useToast();
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [illustrationSize, setIllustrationSize] = useState<number>(56);
  const [animateIllustrations, setAnimateIllustrations] = useState<boolean>(true);

  const copyToClipboard = (hex: string, label: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    success(`Couleur ${label} (${hex}) copiée !`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const colorTokens = [
    { label: '--ink', hex: '#111111', desc: 'Texte, bordures et ombres dures', text: 'white' },
    { label: '--paper', hex: '#FFFDF5', desc: 'Fond général papier crème', text: 'black' },
    { label: '--violet (primary)', hex: '#6A4CF5', desc: 'Action principale, sélection', text: 'white' },
    { label: '--primary-hover', hex: '#5536E0', desc: 'État hover/focus actif', text: 'white' },
    { label: '--lime', hex: '#C6F432', desc: 'Surlignage, succès, grand CTA', text: 'black' },
    { label: '--candy', hex: '#FF8AD8', desc: 'Accents, autocollants, alertes douces', text: 'black' },
    { label: '--sun', hex: '#FFD23F', desc: 'Étiquettes de prix, étoiles', text: 'black' },
    { label: '--accent', hex: '#D9258A', desc: 'Icônes et texte rose lisible', text: 'white' },
    { label: '--surface', hex: '#FFFFFF', desc: 'Cartes blanches & modales', text: 'black' },
    { label: '--surface-alt', hex: '#F4F0E3', desc: 'Fond alternatif & survol', text: 'black' },
    { label: '--muted-foreground', hex: '#55524A', desc: 'Sous-titres & métadonnées', text: 'white' },
    { label: '--success', hex: '#1F8A4C', desc: 'WhatsApp & confirmation', text: 'white' },
    { label: '--destructive', hex: '#E5322D', desc: 'Alertes & annulations', text: 'white' },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans selection:bg-primary/20 pb-28">
      {/* HEADER DE LA PAGE DESIGN SYSTEM */}
      <header className="sticky top-0 z-40 bg-surface border-b border-border py-4 px-6 shadow-hard-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="icon" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg text-foreground">Design System Vivant</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Niveau 10 Signature
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Tokens, illustrations et composants de RDV Salon</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-alt border-2 border-border text-xs">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Palier actif : <strong>{currentTier}</strong></span>
            </div>
            <Link
              to="/"
              className="px-4 py-2 rounded-full bg-surface-alt hover:bg-lime text-xs font-semibold text-foreground border-2 border-border transition-colors"
            >
              ← Retour au salon
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-20">
        {/* 1. PALETTE DE COULEURS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">1. Palette & Tokens CSS</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Toutes les couleurs sont définies par variables dans <code>src/styles/tokens.css</code>. Cliquez sur une puce pour copier son code hexadécimal.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
            {colorTokens.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => copyToClipboard(c.hex, c.label)}
                className="group p-3 rounded-[20px] bg-surface border-2 border-border shadow-hard-sm hover:shadow-hard-md transition-all text-left flex flex-col justify-between min-h-[140px] cursor-pointer"
              >
                <div
                  className="w-full h-12 rounded-[14px] shadow-inner border border-black/5 flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ backgroundColor: c.hex }}
                >
                  {copiedHex === c.hex ? (
                    <Check className={`w-4 h-4 ${c.text === 'white' ? 'text-white' : 'text-black'}`} />
                  ) : null}
                </div>
                <div className="mt-2 space-y-0.5">
                  <div className="font-mono text-[11px] font-bold text-foreground truncate">{c.label}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{c.hex}</div>
                  <div className="text-[10px] text-muted-foreground/80 leading-tight truncate">{c.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 2. TYPOGRAPHIE ÉDITORIALE */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <Type className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">2. Typographie & Rythme</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[18px] bg-surface border-2 border-border shadow-hard-sm space-y-5">
              <span className="text-xs uppercase font-bold tracking-widest text-primary">Space Grotesk Bold (Titres affiche)</span>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-bold font-display leading-display">
                  Remplissez votre salon avec <TracedUnderline>sérénité</TracedUnderline>.
                </h1>
                <p className="font-display text-2xl italic text-muted-foreground">
                  « Vos clientes réservent en 30 secondes depuis leur smartphone. »
                </p>
                <div className="flex items-baseline gap-4 pt-2">
                  <span className="text-6xl font-bold font-display stroke-num">01</span>
                  <span className="text-6xl font-bold font-display stroke-num is-active">02</span>
                  <span className="text-6xl font-bold font-display text-primary">03</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[18px] bg-surface border-2 border-border shadow-hard-sm space-y-5">
              <span className="text-xs uppercase font-bold tracking-widest text-accent">Space Grotesk (Texte courant, UI & Mobile)</span>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p className="text-base text-foreground font-medium">
                  Space Grotesk 16px minimum pour garantir l'absence totale de zoom indésirable sur iOS Safari.
                </p>
                <p>
                  Interligne 1.5 pour une aération parfaite lors de la lecture d'un agenda ou d'un récapitulatif tarifaire en Francs CFA (FCFA).
                </p>
                <div className="pt-3 flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-3 py-1 rounded-full bg-surface-alt border-2 border-border font-bold">25 000 FCFA</span>
                  <span className="px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 font-bold">+225 07 •••• ••••</span>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">rdv-salon.ci/s/ebene-or</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SYSTÈME D'ILLUSTRATIONS (8 SVG UNIFORMES) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-gold" />
              <h2 className="font-display text-2xl font-bold text-foreground">3. Les 8 Illustrations Métier</h2>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span>Taille :</span>
                {[40, 56, 72, 96].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setIllustrationSize(s)}
                    className={`px-2.5 py-1 rounded-full font-mono transition-colors ${
                      illustrationSize === s ? 'bg-primary text-white font-bold' : 'bg-surface-alt border-2 border-border'
                    }`}
                  >
                    {s}px
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={animateIllustrations}
                  onChange={(e) => setAnimateIllustrations(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Tracé animé</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { component: ScissorsIllustration, name: 'Ciseaux', role: 'Coupe & Prestations' },
              { component: CombIllustration, name: 'Peigne', role: 'Tresses & Démêlage' },
              { component: HairDryerIllustration, name: 'Sèche-cheveux', role: 'Brushing & Soin' },
              { component: MirrorIllustration, name: 'Miroir', role: 'Visage & Finition' },
              { component: NailPolishIllustration, name: 'Vernis', role: 'Onglerie & Manucure' },
              { component: MakeupBrushIllustration, name: 'Pinceau', role: 'Maquillage & Esthétique' },
              { component: BotanicalIllustration, name: 'Fleur Tropicale', role: 'Soins naturels & Karité' },
              { component: SparkleIllustration, name: 'Étoile Éclat', role: 'Confirmation & Succès' },
            ].map((ill, idx) => {
              const Comp = ill.component;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-[18px] bg-surface border-2 border-border shadow-hard-sm hover:shadow-hard-md transition-all flex flex-col items-center justify-between text-center gap-4 min-h-[170px]"
                >
                  <div className="flex-1 flex items-center justify-center">
                    <Comp size={illustrationSize} animated={animateIllustrations} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-foreground font-display">{ill.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{ill.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. BOUTONS, ACTIONS & ÉTATS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">4. Boutons & Cibles Tactiles (44px min)</h2>
          </div>

          <div className="p-8 rounded-[18px] bg-surface border-2 border-border shadow-hard-sm space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary">Bouton Principal</Button>
              <Button variant="secondary">Bouton Secondaire</Button>
              <Button variant="accent">Bouton Accent</Button>
              <Button variant="outline">Contour Doux</Button>
              <Button variant="ghost">Discret (Ghost)</Button>
              <Button variant="primary" disabled>Désactivé</Button>
            </div>

            <div className="pt-4 border-t border-border flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Bouton Magnétique avec Reflet traversant :</p>
                <MagneticButton>
                  <button className="px-8 py-3.5 rounded-full bg-primary text-white font-semibold text-sm shadow-hard-md min-h-[48px] flex items-center gap-2 cursor-pointer">
                    <span>Créer mon salon</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </MagneticButton>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Autocollant asymétrique incliné (-6°) :</p>
                <span className="inline-block sticker-badge px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold font-display">
                  Nouveau • Côte d'Ivoire
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FORMULAIRES & INPUTS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">5. Champs de Saisie & Ergonomie Mobile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-[18px] bg-surface border-2 border-border shadow-hard-sm space-y-2">
              <label className="text-xs font-semibold text-foreground block">Champ Standard (16px minimum)</label>
              <input
                type="text"
                defaultValue="Salon Ébène & Or"
                className="w-full px-4 py-3 rounded-[16px] bg-surface-alt border-2 border-border text-foreground text-base focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
              />
              <p className="text-[11px] text-muted-foreground">Empêche le zoom forcé sur Safari iOS.</p>
            </div>

            <div className="p-6 rounded-[18px] bg-surface border-2 border-border shadow-hard-sm space-y-2">
              <label className="text-xs font-semibold text-foreground block">Champ Téléphone Local</label>
              <input
                type="tel"
                defaultValue="+225 07 59 35 86"
                className="w-full px-4 py-3 rounded-[16px] bg-surface-alt border-2 border-border text-foreground font-mono text-base focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
              />
              <p className="text-[11px] text-success flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Numéro valide en Côte d'Ivoire
              </p>
            </div>

            <div className="p-6 rounded-[18px] bg-surface border-2 border-border shadow-hard-sm space-y-2">
              <label className="text-xs font-semibold text-foreground block">État Erreur</label>
              <input
                type="text"
                defaultValue="Nom invalide"
                className="w-full px-4 py-3 rounded-[16px] bg-destructive/5 border border-destructive text-destructive text-base focus:outline-none focus:ring-2 focus:ring-destructive min-h-[44px]"
              />
              <p className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Veuillez renseigner le nom complet
              </p>
            </div>
          </div>
        </section>

        {/* 6. SÉPARATEURS ORGANIQUES SANS LIGNES DROITES */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <Maximize2 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">6. Séparateurs Organiques SVG</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Jamais de ligne droite sèche entre les sections : nous alternons les vagues, arches et galets pour une lecture fluide et féminine.
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-[18px] bg-surface-cream border-2 border-border">
              <span className="text-xs font-bold text-muted-foreground block mb-2">Vague Douce :</span>
              <WaveSeparator fillColor="#6A4CF5" />
            </div>

            <div className="p-4 rounded-[18px] bg-ink text-white">
              <span className="text-xs font-bold text-muted-foreground block mb-2">Arche Galbée vers section sombre :</span>
              <ArchSeparator fillColor="#FFFDF5" />
            </div>

            <div className="p-4 rounded-[18px] bg-surface-alt border-2 border-border">
              <span className="text-xs font-bold text-muted-foreground block mb-2">Galet Asymétrique :</span>
              <PebbleSeparator fillColor="#FFD23F" />
            </div>
          </div>
        </section>

        {/* 7. NOTIFICATIONS & TOASTS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">7. Système de Notifications (Toasts)</h2>
          </div>

          <div className="p-8 rounded-[18px] bg-surface border-2 border-border shadow-hard-sm flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => success('Rendez-vous validé et notifié sur WhatsApp !')}
              className="px-5 py-2.5 rounded-full bg-success text-white text-xs font-semibold shadow-hard-sm hover:opacity-90 transition-opacity min-h-[44px]"
            >
              Déclencher Toast Succès
            </button>
            <button
              type="button"
              onClick={() => error('Créneau déjà réservé par une autre cliente.')}
              className="px-5 py-2.5 rounded-full bg-destructive text-white text-xs font-semibold shadow-hard-sm hover:opacity-90 transition-opacity min-h-[44px]"
            >
              Déclencher Toast Erreur
            </button>
            <button
              type="button"
              onClick={() => info('Mise à jour du planning synchronisée en temps réel.')}
              className="px-5 py-2.5 rounded-full bg-accent text-white text-xs font-semibold shadow-hard-sm hover:opacity-90 transition-opacity min-h-[44px]"
            >
              Déclencher Toast Info
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
