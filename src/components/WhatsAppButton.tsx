import React from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink, formatHeure, formatJour, formatReminderMessage } from '../lib/utils';
import { RendezVous, Salon } from '../types/database';
import { useAuth } from '../context/AuthContext';

interface WhatsAppButtonProps {
  rdv: RendezVous;
  salon?: Salon;
  variant?: 'button' | 'icon' | 'badge';
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  rdv,
  salon: salonProp,
  variant = 'button',
  className = '',
}) => {
  const { salon: authSalon } = useAuth();
  const salon = salonProp || authSalon;

  const clientPhone = rdv.client?.telephone || rdv.client_telephone || '';
  if (!clientPhone || !salon) return null;

  // Heure du salon : le rappel doit annoncer la même heure que l'agenda, où que soit le téléphone
  const dateFormatted = formatJour(rdv.debut);
  const heureFormatted = formatHeure(rdv.debut);

  const defaultTemplate =
    salon.message_rappel ||
    'Bonjour {client}, nous vous rappelons votre rendez-vous pour {service} le {date} à {heure} chez {salon}. Merci de confirmer votre présence.';

  const message = formatReminderMessage(defaultTemplate, {
    client: rdv.client?.nom || rdv.client_nom || 'Cher client',
    service: rdv.service?.nom || 'votre prestation',
    date: dateFormatted,
    heure: heureFormatted,
    salon: salon.nom,
  });

  const url = buildWhatsAppLink(clientPhone, message);

  if (variant === 'icon') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title="Envoyer un rappel par WhatsApp"
        className={`inline-flex items-center justify-center p-2.5 rounded-full bg-success/15 text-success hover:bg-success hover:text-white border border-success/20 transition-colors min-h-[44px] min-w-[44px] cursor-pointer ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
      </a>
    );
  }

  if (variant === 'badge') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-success/15 text-success hover:bg-success hover:text-white transition-colors border border-success/25 min-h-[40px] cursor-pointer ${className}`}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>Rappel WhatsApp</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`press inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-success text-white border-2 border-ink shadow-hard-sm min-h-[44px] cursor-pointer ${className}`}
    >
      <MessageCircle className="w-4 h-4 shrink-0" />
      <span>Rappeler par WhatsApp</span>
    </a>
  );
};
