import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Clock,
  MessageCircle,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Save,
  RotateCcw,
  ShieldCheck,
  Database,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { repository } from '../lib/repository';
import { isSupabaseConfigured } from '../lib/supabase';
import { QRCodeModal } from '../components/QRCodeModal';
import { useToast } from '../context/ToastContext';

// Script SQL de référence : la migration de sécurité elle-même, jamais une copie figée
import SUPABASE_RPC_SQL from '../../supabase/migration-01-securite.sql?raw';

export const SettingsPage: React.FC = () => {
  const { salon, refreshSalon } = useAuth();
  const { success, error, info } = useToast();

  const [nom, setNom] = useState('');
  const [slug, setSlug] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [commune, setCommune] = useState('Cocody');
  const [ville, setVille] = useState('Abidjan');
  const [description, setDescription] = useState('');

  // Règles
  const [delaiMinHeures, setDelaiMinHeures] = useState(2);
  const [delaiMaxJours, setDelaiMaxJours] = useState(60);
  const [pasCreneauMinutes, setPasCreneauMinutes] = useState(30);

  // Message rappel
  const [messageRappel, setMessageRappel] = useState('');

  // UI
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (salon) {
      setNom(salon.nom || '');
      setSlug(salon.slug || '');
      setTelephone(salon.telephone || '');
      setAdresse(salon.adresse || '');
      setCommune(salon.commune || 'Cocody');
      setVille(salon.ville || 'Abidjan');
      setDescription(salon.description || '');
      setDelaiMinHeures(salon.delai_min_heures ?? 2);
      setDelaiMaxJours(salon.delai_max_jours ?? 60);
      setPasCreneauMinutes(salon.pas_creneau_minutes ?? 30);
      setMessageRappel(
        salon.message_rappel ||
          'Bonjour {client}, nous vous rappelons votre rendez-vous pour {service} le {date} à {heure} chez {salon}. Merci de confirmer votre présence.'
      );
    }
  }, [salon]);

  if (!salon) return null;

  const publicUrl = `${window.location.origin}/s/${slug || salon.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    success('Lien public copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !slug.trim()) {
      error('Le nom et le slug du salon sont requis');
      return;
    }

    setSaving(true);
    try {
      await repository.updateSalon(salon.id, {
        nom: nom.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        telephone: telephone.trim(),
        adresse: adresse.trim(),
        commune: commune.trim(),
        ville: ville.trim(),
        description: description.trim(),
        delai_min_heures: Number(delaiMinHeures),
        delai_max_jours: Number(delaiMaxJours),
        pas_creneau_minutes: Number(pasCreneauMinutes),
        message_rappel: messageRappel.trim(),
      });

      await refreshSalon();
      success('Paramètres enregistrés avec succès !');
    } catch (err: any) {
      error(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = () => {
    if (
      confirm(
        'Voulez-vous réinitialiser toutes les données de démonstration avec le salon "Ébène & Or Beauté Abidjan" ? Vos modifications locales seront remplacées.'
      )
    ) {
      repository.resetToDemo();
      info('Données de démo réinitialisées');
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-8 py-4 sm:py-8 max-w-5xl mx-auto space-y-6 box-border min-w-0">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full min-w-0 box-border">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-extrabold text-foreground break-words">Paramètres du Salon</h2>
          <p className="text-xs text-muted-foreground mt-0.5 break-words">
            Configurez les informations publiques, les règles de créneaux et vos modèles WhatsApp
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold press bg-primary text-white border-2 border-ink rounded-xl shadow-hard-sm transition-colors self-start sm:self-auto disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. LIEN PUBLIC ET QR CODE */}
        <div className="bg-white rounded-2xl border-2 border-border shadow-hard-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                <span>Votre Page Publique de Réservation</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                C'est le lien direct que vos clients ouvrent pour choisir leur coiffeur et réserver
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary hover:bg-primary/15 rounded-xl text-xs font-semibold transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Générer le QR Code</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface-alt p-3 rounded-xl border-2 border-border">
            <span className="text-xs font-mono text-foreground break-all flex-1 px-1">
              {publicUrl}
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-surface-alt text-foreground border-2 border-border rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 press bg-primary text-white border-2 border-ink rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Tester la page</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2. INFORMATIONS GÉNÉRALES DU SALON */}
        <div className="bg-white rounded-2xl border-2 border-border shadow-hard-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
            Informations de l'établissement
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Nom du Salon *
              </label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Slug URL personnalisé *
              </label>
              <div className="flex items-center text-base">
                <span className="text-xs text-muted-foreground bg-surface-alt p-2.5 rounded-l-xl border border-r-0 border-border">
                  /s/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  className="flex-1 text-base p-2.5 rounded-r-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Numéro WhatsApp officiel du salon *
              </label>
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Commune / Quartier
              </label>
              <input
                type="text"
                placeholder="Ex: Cocody Riviera 3, Marcory Zone 4, Plateau..."
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">
                Adresse physique détaillée
              </label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="Ex: Boulevard François Mitterrand, carrefour Sainte Famille"
                className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">
                Description / Présentation du salon
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Présentez brièvement vos spécialités pour rassurer vos clients..."
                className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* 3. RÈGLES DE RÉSERVATION & DISPONIBILITÉS */}
        <div className="bg-white rounded-2xl border-2 border-border shadow-hard-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Règles de prise de rendez-vous</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Délai minimum avant RDV
              </label>
              <select
                value={delaiMinHeures}
                onChange={(e) => setDelaiMinHeures(Number(e.target.value))}
                className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
              >
                <option value={0.5}>30 minutes à l'avance (très rapide)</option>
                <option value={1}>1 heure à l'avance</option>
                <option value={2}>2 heures à l'avance (conseillé)</option>
                <option value={3}>3 heures à l'avance</option>
                <option value={4}>4 heures à l'avance</option>
                <option value={12}>12 heures à l'avance</option>
                <option value={24}>24 heures (1 jour) à l'avance</option>
                <option value={48}>48 heures (2 jours) à l'avance</option>
              </select>
              <span className="text-[11px] text-muted-foreground block mt-1">
                Empêche les réservations de dernière minute imprévues.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Délai maximum de réservation
              </label>
              <select
                value={delaiMaxJours}
                onChange={(e) => setDelaiMaxJours(Number(e.target.value))}
                className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
              >
                <option value={1}>1 jour (aujourd'hui et demain)</option>
                <option value={2}>2 jours à l'avance</option>
                <option value={3}>3 jours à l'avance</option>
                <option value={7}>7 jours (1 semaine)</option>
                <option value={14}>14 jours (2 semaines)</option>
                <option value={30}>30 jours (1 mois - conseillé)</option>
                <option value={60}>60 jours (2 mois)</option>
                <option value={90}>90 jours (3 mois)</option>
              </select>
              <span className="text-[11px] text-muted-foreground block mt-1">
                Horizon maximal visible sur le calendrier public.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Pas des créneaux
              </label>
              <select
                value={pasCreneauMinutes}
                onChange={(e) => setPasCreneauMinutes(Number(e.target.value))}
                className="w-full text-base p-2.5 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
              >
                <option value={15}>Toutes les 15 minutes</option>
                <option value={30}>Toutes les 30 minutes (standard)</option>
                <option value={45}>Toutes les 45 minutes</option>
                <option value={60}>Toutes les 60 minutes (1 heure)</option>
              </select>
              <span className="text-[11px] text-muted-foreground block mt-1">
                Intervalle proposé aux clients (ex: 09:00, 09:30...).
              </span>
            </div>
          </div>
        </div>

        {/* 4. MODÈLE DU MESSAGE DE RAPPEL WHATSAPP */}
        <div className="bg-white rounded-2xl border-2 border-border shadow-hard-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-success" />
            <span>Message de rappel WhatsApp personnalisable</span>
          </h3>

          <p className="text-xs text-muted-foreground">
            Ce message s’ouvrira automatiquement prérempli lorsque vous cliquerez sur le bouton "Rappeler par WhatsApp".
          </p>

          <div>
            <textarea
              rows={3}
              value={messageRappel}
              onChange={(e) => setMessageRappel(e.target.value)}
              className="w-full text-base p-3 rounded-xl border-2 border-border bg-surface-alt focus:bg-surface focus:outline-none focus:border-primary focus:shadow-hard-sm"
            />
          </div>

          <div className="text-[11px] text-muted-foreground bg-surface-alt p-3 rounded-xl border-2 border-border space-y-1">
            <span className="font-bold text-foreground">Variables dynamiques disponibles :</span>
            <div className="flex flex-wrap gap-2 text-muted-foreground pt-1 font-mono text-[10px]">
              <span className="bg-white px-2 py-0.5 rounded border-2 border-border">{`{client}`} (Nom)</span>
              <span className="bg-white px-2 py-0.5 rounded border-2 border-border">{`{service}`} (Prestation)</span>
              <span className="bg-white px-2 py-0.5 rounded border-2 border-border">{`{date}`} (Date en français)</span>
              <span className="bg-white px-2 py-0.5 rounded border-2 border-border">{`{heure}`} (Heure de début)</span>
              <span className="bg-white px-2 py-0.5 rounded border-2 border-border">{`{salon}`} (Nom de votre salon)</span>
            </div>
          </div>
        </div>

        {/* 5. INFRASTRUCTURE & BASE DE DONNÉES SUPABASE
            Outil de développement : jamais affiché aux gérants en production */}
        {(import.meta.env.DEV || !isSupabaseConfigured()) && (
        <div className="bg-surface-alt rounded-2xl border-2 border-border p-6 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <span>Statut du Backend & Base de données</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border-2 border-border">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSupabaseConfigured() ? 'bg-success' : 'bg-primary'
                  }`}
                />
                <h4 className="text-xs font-bold text-foreground">
                  {isSupabaseConfigured()
                    ? 'Connecté à Supabase PostgreSQL & Auth'
                    : 'Mode Démonstration Rapide (Stockage Local Réactif)'}
                </h4>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-xl">
                {isSupabaseConfigured()
                  ? 'Vos données sont sécurisées par Row Level Security (RLS) et la contrainte d’anti double-réservation btree_gist.'
                  : 'Vous pouvez tester 100% des fonctionnalités en direct. Pour brancher votre propre instance PostgreSQL Supabase, ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSql(!showSql)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-xl transition-colors shrink-0"
              >
                <span>{showSql ? 'Masquer le script SQL' : 'Script SQL Supabase (RPC & Droits)'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDemo}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-foreground hover:text-foreground bg-surface-alt hover:bg-surface-alt rounded-xl transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser démo</span>
              </button>
            </div>
          </div>

          {showSql && (
            <div className="bg-foreground rounded-xl p-4 text-background space-y-3 animate-fade-in border-2 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-lime">
                    Script SQL pour Supabase (Fonction de réservation & GRANT)
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Copiez et exécutez ce script dans votre Supabase Dashboard → <strong>SQL Editor</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_RPC_SQL);
                    setCopiedSql(true);
                    success('Script SQL copié dans le presse-papiers !');
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg press bg-primary text-white border-2 border-ink text-xs font-bold transition-all shadow-hard-sm"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copié !' : 'Copier le SQL'}</span>
                </button>
              </div>

              <pre className="text-[11px] font-mono bg-foreground p-3 rounded-lg overflow-x-auto text-lime max-h-60 border-2 border-border">
                {SUPABASE_RPC_SQL}
              </pre>
            </div>
          )}
        </div>
        )}

        {/* BOUTON ENREGISTRER FINAL */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold press bg-primary text-white border-2 border-ink rounded-xl shadow-hard-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer tous les paramètres'}</span>
          </button>
        </div>
      </form>

      {/* MODAL QR CODE */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        publicUrl={publicUrl}
        salonNom={nom}
      />
    </div>
  );
};
