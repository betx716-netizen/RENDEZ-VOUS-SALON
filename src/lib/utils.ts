import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { SALON_TIMEZONE, salonCalendarDay, salonToday } from './timezone';

/**
 * Formate un montant en Francs CFA (XOF)
 * Exemple: 15000 -> "15 000 FCFA"
 */
export function formatFCFA(montant: number | undefined | null): string {
  if (montant === undefined || montant === null || isNaN(montant)) {
    return '0 FCFA';
  }
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(montant) + ' FCFA';
}

/**
 * Formate une durée en minutes de façon lisible
 * Exemples: 40 -> "40 min", 120 -> "2 h", 75 -> "1 h 15"
 */
export function formatDuree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

/**
 * Normalise un numéro de téléphone pour la Côte d'Ivoire au format international E.164 (+225...)
 */
export function normalizePhoneCI(phone: string): string {
  if (!phone) return '';
  // Enlever tous les espaces, tirets, parenthèses
  let clean = phone.replace(/[\s\-\(\)\.]/g, '');

  // Si commence par +225, enlever le + pour l'analyse
  if (clean.startsWith('+225')) {
    clean = clean.substring(4);
  } else if (clean.startsWith('00225')) {
    clean = clean.substring(5);
  } else if (clean.startsWith('225') && clean.length > 10) {
    clean = clean.substring(3);
  }

  // En Côte d'Ivoire, les numéros mobiles ont 10 chiffres (commencent souvent par 07, 05, 01)
  // S'il a 10 chiffres et commence par 0, on garde tout
  return `225${clean.replace(/^0+/, '0')}`;
}

/**
 * Formate un numéro pour un affichage lisible (ex: +225 07 12 34 56 78)
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+225') && clean.length === 14) {
    // +225 07 12 34 56 78
    return `+225 ${clean.slice(4, 6)} ${clean.slice(6, 8)} ${clean.slice(8, 10)} ${clean.slice(10, 12)} ${clean.slice(12, 14)}`;
  }
  return phone;
}

/**
 * Génère le lien d'envoi WhatsApp avec message prérempli
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const normPhone = normalizePhoneCI(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${normPhone}?text=${encodedText}`;
}

/**
 * Remplace les variables dynamiques dans le message WhatsApp de rappel
 */
export function formatReminderMessage(
  template: string,
  vars: {
    client: string;
    service: string;
    date: string;
    heure: string;
    salon: string;
  }
): string {
  return template
    .replace(/{client}/g, vars.client)
    .replace(/{service}/g, vars.service)
    .replace(/{date}/g, vars.date)
    .replace(/{heure}/g, vars.heure)
    .replace(/{salon}/g, vars.salon);
}

// Formats affichés à l'heure du salon (voir lib/timezone.ts), pas à celle du téléphone
const heureFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: SALON_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const dateCourteFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: SALON_TIMEZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const dateLongueFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: SALON_TIMEZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const dateJourFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: SALON_TIMEZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const toDate = (isoDate: string | Date) => (typeof isoDate === 'string' ? parseISO(isoDate) : isoDate);

/** Ex : « jeudi 15 octobre 2026 » (jour chez le salon) */
export function formatJour(isoDate: string | Date): string {
  return dateJourFormatter.format(toDate(isoDate));
}

/**
 * Formate une date ISO en chaîne lisible en français
 */
export function formatDateHuman(isoDate: string | Date): string {
  const date = toDate(isoDate);
  const heure = formatHeure(date);
  const ecartJours = differenceInCalendarDays(salonCalendarDay(date), salonToday());
  if (ecartJours === 0) return `Aujourd'hui à ${heure}`;
  if (ecartJours === 1) return `Demain à ${heure}`;
  if (ecartJours === -1) return `Hier à ${heure}`;
  return `${dateLongueFormatter.format(date)} à ${heure}`;
}

export function formatDateShort(isoDate: string | Date): string {
  return dateCourteFormatter.format(toDate(isoDate));
}

export function formatHeure(isoDate: string | Date): string {
  return heureFormatter.format(toDate(isoDate));
}

/**
 * Génère un fichier iCalendar (.ics) téléchargeable
 */
export function downloadCalendarEvent(event: {
  title: string;
  description: string;
  location: string;
  start: Date | string;
  end: Date | string;
}) {
  const startDate = typeof event.start === 'string' ? new Date(event.start) : event.start;
  const endDate = typeof event.end === 'string' ? new Date(event.end) : event.end;

  const formatDateICS = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RDV Salon//CI//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@rdvsalon.ci`,
    `DTSTAMP:${formatDateICS(new Date())}`,
    `DTSTART:${formatDateICS(startDate)}`,
    `DTEND:${formatDateICS(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `rendez-vous-${format(startDate, 'yyyy-MM-dd')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
