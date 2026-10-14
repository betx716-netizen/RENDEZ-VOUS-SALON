import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Scissors,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  MapPin,
  Phone,
} from 'lucide-react';
import { publicRepository, ReservationPublique } from '../lib/repository';
import { formatFCFA, formatDateHuman, formatDuree, formatPhoneDisplay } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const CancelBookingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rdvData, setRdvData] = useState<ReservationPublique | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [motif, setMotif] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await publicRepository(token).getReservationByToken(token);
        setRdvData(data);
        if (data && data.statut === 'annule') {
          setCancelled(true);
        }
      } catch (err) {
        console.error('Erreur chargement rendez-vous:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [token]);

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      const res = await publicRepository(token).cancelByToken(token, motif);
      if (res.success) {
        setCancelled(true);
        success('Votre rendez-vous a bien été annulé.');
      } else {
        error(res.message);
      }
    } catch {
      error('Erreur lors de l’annulation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!rdvData) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface p-8 rounded-[18px] shadow-hard-lg text-center border-2 border-border">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h2 className="text-xl font-bold font-display text-foreground">Rendez-vous introuvable</h2>
          <p className="text-xs text-muted-foreground mt-2">
            Le lien de gestion est invalide ou expiré.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center mt-6 px-6 py-2.5 min-h-[44px] rounded-full press bg-primary text-white border-2 border-ink font-semibold text-xs transition-colors shadow-hard-md"
          >
            Accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4 font-sans overflow-x-hidden max-w-full">
      <div className="max-w-lg w-full bg-surface rounded-[18px] shadow-hard-lg border-2 border-border p-6 sm:p-8">
        {cancelled ? (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold font-display text-foreground">
              Rendez-vous annulé
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Votre annulation a bien été transmise à <strong className="text-foreground">{rdvData.salon_nom}</strong>. Le créneau est libéré pour d'autres clientes.
            </p>
            <div className="pt-4">
              <Link
                to={`/s/${rdvData.salon_slug}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full press bg-primary text-white border-2 border-ink text-xs font-semibold shadow-hard-md min-h-[44px]"
              >
                <span>Reprendre un rendez-vous</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmCancel} className="space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold font-display text-foreground">
                Annulation de votre réservation
              </h1>
              <p className="text-xs text-muted-foreground">
                Êtes-vous sûr(e) de vouloir annuler ce rendez-vous ?
              </p>
            </div>

            {/* Récapitulatif du RDV */}
            <div className="bg-surface-alt rounded-[20px] p-5 border-2 border-border space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-primary" />
                  <span>{rdvData.service_nom}</span>
                </span>
                <span className="font-bold tabular-nums text-primary">
                  {formatFCFA(rdvData.prix_fcfa)}
                </span>
              </div>

              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{formatDateHuman(rdvData.debut)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{formatDuree(rdvData.duree_minutes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-foreground font-medium">{rdvData.employe_nom || 'Notre équipe'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{rdvData.salon_nom} ({rdvData.salon_ville || 'Abidjan'})</span>
                </div>
              </div>
            </div>

            {/* Motif facultatif */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">
                Motif de l'annulation <span className="text-muted-foreground font-normal">(facultatif)</span>
              </label>
              <textarea
                rows={2}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex: Empêchement de dernière minute, report souhaité..."
                className="w-full text-base p-3 rounded-[16px] border-2 border-border bg-surface-alt text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:shadow-hard-sm"
              />
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-full bg-destructive hover:opacity-90 text-white font-semibold text-sm shadow-hard-sm min-h-[48px] cursor-pointer transition-all disabled:opacity-50"
              >
                {submitting ? 'Annulation en cours...' : 'Confirmer l\'annulation'}
              </button>

              <Link
                to={`/s/${rdvData.salon_slug}`}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer min-h-[44px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Conserver mon rendez-vous</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
