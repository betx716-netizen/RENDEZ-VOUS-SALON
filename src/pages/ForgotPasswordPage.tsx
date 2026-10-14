import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Scissors } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { success, error } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);

    if (res.success) {
      setSent(true);
      success('Lien envoyé par email !');
    } else {
      error(res.error || 'Erreur lors de la réinitialisation');
    }
  };

  return (
    <div className="w-full max-w-full min-h-[100dvh] bg-background flex items-center justify-center p-4 font-sans box-border min-w-0">
      <div className="max-w-md w-full bg-surface rounded-[18px] shadow-hard-lg border-2 border-border p-7 sm:p-9 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-full bg-primary text-white flex items-center justify-center shadow-hard-md mx-auto">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground">Mot de passe oublié</h1>
          <p className="text-xs text-muted-foreground">
            Saisissez votre email pour recevoir les instructions de réinitialisation
          </p>
        </div>

        {sent ? (
          <div className="p-6 bg-success/10 rounded-[20px] border border-success/20 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
            <h2 className="font-bold text-foreground text-sm">Vérifiez votre boîte mail</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Un lien de réinitialisation sécurisé a été envoyé à <strong>{email}</strong>.
            </p>
            <div className="pt-2">
              <Link
                to="/connexion"
                className="inline-flex items-center justify-center min-h-[44px] text-xs font-semibold text-primary hover:underline"
              >
                Retour à la page de connexion
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="votre-email@salon.ci"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-base bg-surface-alt rounded-[16px] border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-hard-sm min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 min-h-[48px] flex items-center justify-center rounded-full press bg-primary text-white border-2 border-ink font-semibold text-sm shadow-hard-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-border">
          <Link
            to="/connexion"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la connexion</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
