import React from 'react';
import { Scissors, Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { Salon } from '../../types/database';

interface BookingHeaderProps {
  salon: Salon;
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({ salon }) => {
  const cleanPhone = salon.telephone.replace(/\s+/g, '');
  const waUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=Bonjour%20${encodeURIComponent(salon.nom)}%2C%20je%20souhaite%20des%20renseignements.`;
  const horairesTxt = salon.heure_ouverture && salon.heure_fermeture
    ? `${salon.heure_ouverture} - ${salon.heure_fermeture}`
    : '08h30 - 19h00';

  return (
    <header className="relative overflow-hidden bg-surface rounded-[22px] p-5 sm:p-7 border-2 border-ink shadow-hard-lg">
      {/* Formes décoratives */}
      <div aria-hidden="true" className="absolute -top-12 -right-12 w-28 h-28 sm:-top-10 sm:-right-10 sm:w-36 sm:h-36 rounded-full bg-candy border-2 border-ink" />
      <div aria-hidden="true" className="absolute top-6 right-24 w-7 h-7 bg-lime border-2 border-ink rotate-12 hidden sm:block" />

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {salon.logo_url ? (
            <img
              src={salon.logo_url}
              alt={salon.nom}
              className="w-14 h-14 rounded-[14px] object-cover shrink-0 border-2 border-ink shadow-hard-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-[14px] bg-sun text-ink flex items-center justify-center shrink-0 border-2 border-ink shadow-hard-sm -rotate-6">
              <Scissors className="w-6 h-6" />
            </div>
          )}
          <div className="min-w-0 sm:pr-24">
            <h1 className="text-[2.1rem] sm:text-5xl font-bold font-display text-ink leading-[0.95] break-words">
              {salon.nom}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-bold text-ink">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-lime border-2 border-ink">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{salon.commune || salon.ville || 'Abidjan'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border-2 border-ink">
                <Clock className="w-3.5 h-3.5" />
                <span>{horairesTxt}</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface border-2 border-ink">
                Prix en FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Boutons Appeler / WhatsApp */}
        <div className="flex items-center gap-3">
          <a
            href={`tel:${cleanPhone}`}
            className="press flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-surface text-ink text-sm font-bold border-2 border-ink shadow-hard-sm min-h-[44px] cursor-pointer"
            title="Appeler le salon"
          >
            <Phone className="w-4 h-4" />
            <span>Appeler</span>
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-success text-white text-sm font-bold border-2 border-ink shadow-hard-sm min-h-[44px] cursor-pointer"
            title="Écrire sur WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
};
