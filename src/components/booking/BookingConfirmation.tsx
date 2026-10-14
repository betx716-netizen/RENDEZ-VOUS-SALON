import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, Calendar, Clock, User, MessageCircle, CalendarPlus, Scissors, MapPin } from 'lucide-react';
import { SparkleIllustration } from '../illustrations';
import { Salon, Service } from '../../types/database';
import { formatFCFA, formatDateHuman, formatHeure, downloadCalendarEvent, buildWhatsAppLink } from '../../lib/utils';

interface BookingConfirmationProps {
  salon: Salon;
  service: Service;
  employeNom: string;
  debut: string;
  fin: string;
  token: string;
  clientNom: string;
  clientTelephone: string;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  salon,
  service,
  employeNom,
  debut,
  fin,
  token,
  clientNom,
  clientTelephone,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const handleDownloadCalendar = () => {
    downloadCalendarEvent({
      title: `RDV ${service.nom} - ${salon.nom}`,
      description: `Rendez-vous réservé chez ${salon.nom} avec ${employeNom}. Prestation: ${service.nom} (${formatFCFA(service.prix_fcfa)}). Annulation: ${window.location.origin}/annuler/${token}`,
      location: `${salon.nom}, ${salon.commune || 'Abidjan'}`,
      start: debut,
      end: fin,
    });
  };

  const handleShareWhatsApp = () => {
    const message = `Bonjour ! J'ai bien réservé mon rendez-vous pour *${service.nom}* chez *${salon.nom}* le ${formatDateHuman(debut)} à ${formatHeure(debut)} avec ${employeNom}.`;
    const cleanPhone = salon.telephone.replace(/\s+/g, '').replace('+', '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  return (
    <div className="relative bg-lime rounded-[22px] p-6 sm:p-10 border-2 border-ink shadow-hard-xl space-y-8 text-center overflow-hidden">
      {/* Formes décoratives */}
      <div aria-hidden="true" className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-candy border-2 border-ink" />
      <div aria-hidden="true" className="absolute bottom-10 -right-6 w-16 h-16 bg-sun border-2 border-ink rotate-12" />

      {/* Grande coche animée */}
      <div className="space-y-4 relative">
        <div className="relative inline-block mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: -6 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.2 }
                : { type: 'spring', stiffness: 350, damping: 14 }
            }
            className="w-20 h-20 rounded-[22px] bg-ink text-lime flex items-center justify-center mx-auto shadow-hard-md relative z-10"
          >
            <CheckCircle2 className="w-11 h-11 stroke-[2.5]" />
          </motion.div>
          <div className="absolute -top-4 -right-5 pointer-events-none z-20 animate-wiggle">
            <SparkleIllustration size={34} />
          </div>
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold font-display text-ink leading-[0.95]">
          C'est réservé&nbsp;!
        </h2>
        <p className="text-base text-ink max-w-md mx-auto">
          Merci <strong>{clientNom}</strong>, votre créneau est bloqué chez <strong>{salon.nom}</strong>.
        </p>
      </div>

      {/* Ticket récapitulatif */}
      <div className="relative bg-surface rounded-[18px] border-2 border-ink text-left text-sm -rotate-1 shadow-hard-md">
        <div className="flex items-center justify-between gap-3 p-5 border-b-2 border-dashed border-ink">
          <span className="font-bold text-ink flex items-center gap-2 text-base">
            <Scissors className="w-4 h-4 shrink-0" />
            <span>{service.nom}</span>
          </span>
          <span className="font-bold text-ink bg-sun border-2 border-ink rounded-full px-3 py-0.5 shrink-0">
            {formatFCFA(service.prix_fcfa)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="text-ink font-bold first-letter:uppercase">{formatDateHuman(debut)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="text-ink font-bold">{formatHeure(debut)} <span className="font-normal text-muted-foreground">({service.duree_minutes} min)</span></span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 shrink-0" />
            <span className="text-ink font-medium">{employeNom}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="text-ink font-medium">{salon.commune || 'Abidjan'}</span>
          </div>
        </div>
      </div>

      {/* Boutons d'action : Ajouter au calendrier & Partager WhatsApp */}
      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleDownloadCalendar}
          className="press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-surface text-ink font-bold text-sm border-2 border-ink shadow-hard-md min-h-[48px] cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Ajouter au calendrier</span>
        </button>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-success text-white font-bold text-sm border-2 border-ink shadow-hard-md min-h-[48px] cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Partager sur WhatsApp</span>
        </button>
      </div>

      <p className="relative text-xs text-ink/80 pt-2">
        Un rappel WhatsApp vous sera envoyé avant le rendez-vous. En cas d'imprévu, vous pouvez annuler gratuitement.
      </p>
    </div>
  );
};
