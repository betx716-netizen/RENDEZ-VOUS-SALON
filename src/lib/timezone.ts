// Toutes les heures affichées et saisies sont celles du salon, quel que soit le fuseau du téléphone.
// (Une cliente à Paris qui réserve 09:00 réserve 09:00 à Abidjan, pas 09:00 à Paris.)
export const SALON_TIMEZONE = 'Africa/Abidjan';

export interface SalonParts {
  year: number;
  month: number; // 0-11, comme Date
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 = dimanche, comme Date.getDay()
}

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SALON_TIMEZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

/** Date et heure murale du salon pour un instant donné */
export function salonParts(instant: Date | string): SalonParts {
  const d = typeof instant === 'string' ? new Date(instant) : instant;
  const p = Object.fromEntries(partsFormatter.formatToParts(d).map((x) => [x.type, x.value]));
  const year = Number(p.year);
  const month = Number(p.month) - 1;
  const day = Number(p.day);
  return {
    year,
    month,
    day,
    hour: Number(p.hour),
    minute: Number(p.minute),
    weekday: new Date(Date.UTC(year, month, day)).getUTCDay(),
  };
}

/** Instant correspondant à une heure murale du salon (année, mois 0-11, jour, heure, minute) */
export function salonDateTime(year: number, month: number, day: number, hour: number, minute: number): Date {
  const guess = Date.UTC(year, month, day, hour, minute);
  const p = salonParts(new Date(guess));
  const offset = Date.UTC(p.year, p.month, p.day, p.hour, p.minute) - guess;
  return new Date(guess - offset);
}

/**
 * Un « jour calendaire » est représenté côté interface par une Date locale à minuit
 * (ce que produisent startOfToday / addDays). Ces helpers font le pont avec le salon.
 */
export function salonDateTimeOnDay(calendarDay: Date, hour: number, minute: number): Date {
  return salonDateTime(calendarDay.getFullYear(), calendarDay.getMonth(), calendarDay.getDate(), hour, minute);
}

/** Aujourd'hui chez le salon, sous forme de jour calendaire local */
export function salonToday(): Date {
  const p = salonParts(new Date());
  return new Date(p.year, p.month, p.day);
}

/** Jour calendaire (chez le salon) d'un instant */
export function salonCalendarDay(instant: Date | string): Date {
  const p = salonParts(instant);
  return new Date(p.year, p.month, p.day);
}

/** L'instant tombe-t-il ce jour-là chez le salon ? */
export function isSameSalonDay(instant: Date | string, calendarDay: Date): boolean {
  const p = salonParts(instant);
  return p.year === calendarDay.getFullYear() && p.month === calendarDay.getMonth() && p.day === calendarDay.getDate();
}

/** Champs <input type="date"> + <input type="time"> (heure du salon) -> ISO */
export function salonInputToIso(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);
  return salonDateTime(y, m - 1, d, h, min).toISOString();
}

/** ISO -> valeurs pour <input type="date"> et <input type="time"> (heure du salon) */
export function isoToSalonInputs(iso: string | Date): { date: string; time: string } {
  const p = salonParts(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return { date: `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`, time: `${pad(p.hour)}:${pad(p.minute)}` };
}
