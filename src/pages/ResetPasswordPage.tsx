import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Page d'arrivée du lien « mot de passe oublié » : Supabase ouvre une session de récupération
export const ResetPasswordPage: React.FC = () => {
  const { user, loading: authLoading, updatePassword } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      error('Le mot de passe doit comporter au moins 6 caractères');
      return;
    }
    if (password !== confirmation) {
      error('Les deux mots de passe ne sont pas identiques');
      return;
    }
    setLoading(true);
    const res = await updatePassword(password);
    setLoading(false);
    if (res.success) {
      success('Mot de passe modifié');
      navigate('/app');
    } else {
      error(res.error || 'Modification impossible');
    }
  };

  const fieldClass =
    'w-full px-4 py-3 text-base bg-surface rounded-[14px] border-2 border-ink text-ink placeholder:text-ink/40 focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[48px]';

  return (
    <div className="w-full max-w-full min-h-[100dvh] bg-dots flex items-center justify-center p-4 font-sans box-border min-w-0">
      <div className="max-w-md w-full bg-surface rounded-[18px] shadow-hard-lg border-2 border-ink p-7 sm:p-9 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-[16px] bg-sun border-2 border-ink text-ink flex items-center justify-center mx-auto -rotate-6">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold font-display text-ink">Nouveau mot de passe</h1>
        </div>

        {!authLoading && !user ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.
            </p>
            <Link
              to="/mot-de-passe-oublie"
              className="press inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-white border-2 border-ink font-bold text-sm shadow-hard-md min-h-[48px]"
            >
              Recevoir un nouveau lien
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="nouveau-mdp" className="block text-sm font-bold text-ink">
                Nouveau mot de passe (6 caractères min.)
              </label>
              <input
                id="nouveau-mdp"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirmation-mdp" className="block text-sm font-bold text-ink">
                Confirmez le mot de passe
              </label>
              <input
                id="confirmation-mdp"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className={fieldClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading || authLoading}
              className="press w-full py-3.5 min-h-[52px] rounded-full bg-lime text-ink border-2 border-ink font-bold text-base shadow-hard-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
