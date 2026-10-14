import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Lock, Mail, Sparkles, Scissors, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, switchDemoUser, user, salon, loading: authLoading, isDemoMode } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Déjà connecté (ex : retour du lien de confirmation par email) : direction l'espace gérant
  if (!authLoading && !isDemoMode && user && salon) {
    return <Navigate to="/app" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);

    if (res.success) {
      success('Connexion réussie !');
      navigate('/app');
    } else {
      error(res.error || 'Identifiants incorrects');
    }
  };

  const handleQuickDemoLogin = () => {
    switchDemoUser();
    success('Connecté en tant que propriétaire du salon démo Ébène & Or Beauté !');
    navigate('/app');
  };

  return (
    <div className="w-full max-w-full min-h-[100dvh] bg-background flex items-center justify-center p-4 font-sans box-border min-w-0">
      <div className="max-w-md w-full bg-surface rounded-[18px] shadow-hard-lg border-2 border-border p-7 sm:p-9 space-y-6">
        {/* LOGO */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-hard-md mx-auto">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground">RDV Salon</h1>
          <p className="text-xs text-muted-foreground">
            Espace gérant pour salons de coiffure & instituts de beauté en Côte d'Ivoire
          </p>
        </div>

        {/* BOUTON TEST DIRECT DÉMO */}
        <div className="p-4 bg-surface-alt border-2 border-border rounded-[20px]">
          <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Découverte instantanée</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
            Testez l’espace complet du salon "Ébène & Or Beauté Abidjan" en 1 clic sans mot de passe :
          </p>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 min-h-[44px] rounded-full bg-accent hover:opacity-90 text-white font-semibold text-xs shadow-hard-sm transition-all cursor-pointer"
          >
            <span>Accéder au salon de démonstration</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* FORMULAIRE CLASSIQUE */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5" />
              <input
                type="email"
                required
                placeholder="salon@ebene-et-or.ci"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-base bg-surface-alt rounded-[16px] border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground">
                Mot de passe
              </label>
              <Link
                to="/mot-de-passe-oublie"
                className="text-[11px] text-primary hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-base bg-surface-alt rounded-[16px] border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 min-h-[48px] rounded-full press bg-primary text-white border-2 border-ink font-semibold text-sm shadow-hard-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Vous n'avez pas encore de compte ?{' '}
            <Link to="/inscription" className="text-primary font-bold hover:underline">
              Créer mon salon
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
