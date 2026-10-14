import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Scissors, MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { accountRepository } from '../lib/repository';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, user, salon, loading: authLoading, createSalonForCurrentUser } = useAuth();
  const { success, error } = useToast();
  // Compte déjà connecté mais sans salon : on ne demande que les infos du salon
  const completion = !!user && !salon;
  const [emailEnvoye, setEmailEnvoye] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Données du salon
  const [nom, setNom] = useState('');
  const [slug, setSlug] = useState('');
  const [telephone, setTelephone] = useState('+225 ');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('Abidjan');

  const [loading, setLoading] = useState(false);

  const handleSlugify = (name: string) => {
    setNom(name);
    const generated = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generated);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!completion && (!email || !password)) || !nom || !slug || !telephone || !adresse) {
      error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!completion && password.length < 6) {
      error('Le mot de passe doit comporter au moins 6 caractères');
      return;
    }

    const cleanSlug = slug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `salon-${Date.now()}`;

    const salonData = {
      nom: nom.trim(),
      slug: cleanSlug,
      telephone: telephone.trim(),
      adresse: adresse.trim(),
      ville: ville.trim(),
    };

    setLoading(true);
    try {
      // Vérifié avant de créer le compte : sinon le lien serait modifié en silence plus tard
      if (!(await accountRepository().isSlugAvailable(cleanSlug))) {
        error('Ce lien de réservation est déjà pris. Choisissez-en un autre.');
        return;
      }

      const res = completion
        ? await createSalonForCurrentUser(salonData)
        : await signUp(email.trim(), password, salonData);

      if (!res.success) {
        error(res.error || "Erreur lors de l'inscription");
        return;
      }
      if ('needsEmailConfirmation' in res && res.needsEmailConfirmation) {
        setEmailEnvoye(email.trim());
        return;
      }
      success('Bienvenue ! Votre salon a été créé avec succès.');
      navigate('/app');
    } catch (err) {
      error(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && user && salon) {
    return <Navigate to="/app" replace />;
  }

  if (emailEnvoye) {
    return (
      <div className="w-full max-w-full min-h-[100dvh] bg-dots flex items-center justify-center p-4 font-sans box-border min-w-0">
        <div className="max-w-md w-full bg-lime rounded-[22px] border-2 border-ink shadow-hard-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-[18px] bg-ink text-lime flex items-center justify-center mx-auto -rotate-6">
            <MailCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold font-display text-ink leading-tight">Vérifiez votre boîte mail</h1>
          <p className="text-sm text-ink">
            Un lien de confirmation a été envoyé à <strong>{emailEnvoye}</strong>. Cliquez dessus : votre salon
            sera créé automatiquement à votre première connexion.
          </p>
          <Link
            to="/connexion"
            className="press inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-surface text-ink border-2 border-ink font-bold text-sm shadow-hard-md min-h-[48px]"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-h-[100dvh] bg-background flex items-center justify-center p-4 font-sans box-border min-w-0">
      <div className="max-w-xl w-full bg-surface rounded-[18px] shadow-hard-lg border-2 border-border p-6 sm:p-9 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-full bg-primary text-white flex items-center justify-center shadow-hard-md mx-auto">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground">
            {completion ? 'Finalisez votre salon' : 'Créer mon salon gratuitement'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {completion
              ? `Connecté(e) avec ${user?.email}. Il ne manque que les informations du salon.`
              : "Commencez à recevoir des réservations en ligne en Côte d'Ivoire en 2 minutes"}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {!completion && (
          <div className="p-4 bg-surface-alt rounded-[20px] border-2 border-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block">
              1. Identifiants de connexion
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">
                  Email du propriétaire *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@mon-salon.ci"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base bg-surface rounded-[14px] border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">
                  Mot de passe (min. 6 car.) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base bg-surface rounded-[14px] border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
                />
              </div>
            </div>
          </div>
          )}

          <div className="p-4 bg-surface-alt rounded-[20px] border-2 border-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block">
              {completion ? 'Informations de votre salon' : '2. Informations de votre salon'}
            </span>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">
                Nom officiel du salon *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Ébène & Or Coiffure"
                value={nom}
                onChange={(e) => handleSlugify(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base bg-surface rounded-[14px] border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">
                Lien de réservation personnalisé *
              </label>
              <div className="flex items-center rounded-[14px] border-2 border-border bg-surface overflow-hidden">
                <span className="pl-3 text-xs text-muted-foreground font-mono truncate">
                  {window.location.host}/s/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-2 py-2.5 text-base font-mono bg-transparent text-primary focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">
                  Numéro WhatsApp du salon *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+225 07 00 00 00 00"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base bg-surface rounded-[14px] border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-foreground">
                  Commune / Ville *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cocody, Plateau, Marcory..."
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base bg-surface rounded-[14px] border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">
                Adresse exacte ou repère *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Angré 8e tranche, face pharmacie..."
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base bg-surface rounded-[14px] border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 min-h-[48px] rounded-full press bg-primary text-white border-2 border-ink font-semibold text-sm shadow-hard-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Création de votre salon...' : 'Créer mon salon gratuitement'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {!completion && (
          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Vous avez déjà un salon ?{' '}
              <Link to="/connexion" className="text-primary font-bold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
