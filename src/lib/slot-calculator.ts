import { addMinutes, addDays, isBefore, isAfter, parseISO } from 'date-fns';
import { Employe, HoraireEmploye, Conge, RendezVous, Service, Salon } from '../types/database';
import { salonDateTimeOnDay } from './timezone';
import { formatHeure } from './utils';

// Le calculateur n'a besoin que des plages : la page publique ne reçoit aucune donnée client
export type PlageConge = Pick<Conge, 'employe_id' | 'debut' | 'fin'>;
export type PlageOccupee = Pick<RendezVous, 'employe_id' | 'debut' | 'fin' | 'statut'>;

export interface CalculatedSlot {
  timeStr: string; // "09:00"
  debut: string;   // ISO string
  fin: string;     // ISO string
  employeId: string;
  employeNom: string;
  disponible: boolean;
}

/**
 * Calcule tous les créneaux disponibles pour une date donnée, un service et un employé
 */
export function calculateAvailableSlots(params: {
  date: Date; // Le jour choisi (Date locale à minuit), interprété comme un jour chez le salon
  salon: Salon;
  service: Service;
  employes: Employe[];
  targetEmployeId?: string | null; // null ou 'any' pour n'importe quel employé
  horaires: HoraireEmploye[];
  conges: PlageConge[];
  rendezVous: PlageOccupee[];
}): CalculatedSlot[] {
  const { date, salon, service, employes, targetEmployeId, horaires, conges, rendezVous } = params;

  const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, ... (jour calendaire, identique chez le salon)
  const now = new Date();
  const minLeadMinutes = Math.round(Number(salon.delai_min_heures ?? 0.5) * 60);
  const minBookingTime = addMinutes(now, minLeadMinutes);

  // Vérifier si la date dépasse l'horizon maximal autorisé
  const maxBookingDays = Math.max(1, salon.delai_max_jours ?? 30);
  const maxAllowedDate = addDays(new Date(), maxBookingDays);
  if (isAfter(date, maxAllowedDate)) {
    return [];
  }

  // Filtrer les employés éligibles
  let eligibleEmployes = employes.filter((emp) => {
    if (!emp.actif) return false;
    if (targetEmployeId && targetEmployeId !== 'any' && emp.id !== targetEmployeId) return false;
    // Si l'employé a une liste de services restreinte
    if (emp.services_ids && emp.services_ids.length > 0 && !emp.services_ids.includes(service.id)) {
      return false;
    }
    return true;
  });

  // Si aucun employé n'a ce service explicitement attribué (nouvelle prestation),
  // tous les employés actifs sont éligibles par défaut pour permettre la réservation
  if (eligibleEmployes.length === 0) {
    eligibleEmployes = employes.filter((emp) => {
      if (!emp.actif) return false;
      if (targetEmployeId && targetEmployeId !== 'any' && emp.id !== targetEmployeId) return false;
      return true;
    });
  }

  if (eligibleEmployes.length === 0) {
    return [];
  }

  const slotStep = salon.pas_creneau_minutes || 30;
  const serviceDuration = service.duree_minutes || 45;

  const slotsMap = new Map<string, CalculatedSlot>();

  eligibleEmployes.forEach((employe) => {
    // 1. Vérifier les horaires de l'employé ce jour-là
    let empHoraire = horaires.find(
      (h) => h.employe_id === employe.id && h.jour_semaine === dayOfWeek
    );

    // Si pas d'horaires personnalisés définis pour cet employé, appliquer les horaires standards du salon
    if (!empHoraire) {
      empHoraire = {
        salon_id: salon.id,
        employe_id: employe.id,
        jour_semaine: dayOfWeek,
        est_ouvert: dayOfWeek !== 0, // Ouvert du lundi au samedi
        heure_debut: '08:30',
        heure_fin: '19:00',
        pause_debut: '13:00',
        pause_fin: '14:00',
      };
    }

    // Si jour de fermeture pour cet employé
    if (!empHoraire.est_ouvert) {
      return;
    }

    const [startH, startM] = (empHoraire.heure_debut || '08:30').split(':').map(Number);
    const [endH, endM] = (empHoraire.heure_fin || '19:00').split(':').map(Number);

    // Heures murales du salon, quel que soit le fuseau du téléphone de la cliente
    let currentSlotStart = salonDateTimeOnDay(date, startH, startM);
    const dayEnd = salonDateTimeOnDay(date, endH, endM);

    // Pause déjeuner éventuelle
    let pauseStart: Date | null = null;
    let pauseEnd: Date | null = null;
    if (empHoraire.pause_debut && empHoraire.pause_fin) {
      const [psH, psM] = empHoraire.pause_debut.split(':').map(Number);
      const [peH, peM] = empHoraire.pause_fin.split(':').map(Number);
      pauseStart = salonDateTimeOnDay(date, psH, psM);
      pauseEnd = salonDateTimeOnDay(date, peH, peM);
    }

    // Congés de l'employé
    const empConges = conges.filter((c) => c.employe_id === employe.id);

    // Rendez-vous existants de l'employé ce jour-là
    const empRdv = rendezVous.filter(
      (r) => r.employe_id === employe.id && r.statut !== 'annule'
    );

    // Boucle sur les créneaux possibles
    while (true) {
      const slotEnd = addMinutes(currentSlotStart, serviceDuration);

      // Si le service dépasse l'heure de fermeture du salon
      if (isAfter(slotEnd, dayEnd)) {
        break;
      }

      // Vérifier si le créneau est dans le passé ou viole le délai minimum
      const isPastOrTooSoon = isBefore(currentSlotStart, minBookingTime);

      // Vérifier si le créneau chevauche la pause déjeuner
      let overlapsPause = false;
      if (pauseStart && pauseEnd) {
        if (
          (isBefore(currentSlotStart, pauseEnd) && isAfter(slotEnd, pauseStart)) ||
          currentSlotStart.getTime() === pauseStart.getTime()
        ) {
          overlapsPause = true;
        }
      }

      // Vérifier si l'employé est en congé
      let isInConge = false;
      for (const conge of empConges) {
        const cStart = parseISO(conge.debut);
        const cEnd = parseISO(conge.fin);
        if (isBefore(currentSlotStart, cEnd) && isAfter(slotEnd, cStart)) {
          isInConge = true;
          break;
        }
      }

      // Vérifier si un rendez-vous existant chevauche ce créneau
      let hasCollision = false;
      for (const rdv of empRdv) {
        const rdvStart = parseISO(rdv.debut);
        const rdvEnd = parseISO(rdv.fin);
        // Chevauchement d'intervalles: max(start1, start2) < min(end1, end2)
        if (isBefore(currentSlotStart, rdvEnd) && isAfter(slotEnd, rdvStart)) {
          hasCollision = true;
          break;
        }
      }

      const isAvailable = !isPastOrTooSoon && !overlapsPause && !isInConge && !hasCollision;
      const timeKey = formatHeure(currentSlotStart);

      // Si le créneau est disponible pour cet employé, on l'ajoute ou le garde
      if (isAvailable) {
        if (!slotsMap.has(timeKey)) {
          slotsMap.set(timeKey, {
            timeStr: timeKey,
            debut: currentSlotStart.toISOString(),
            fin: slotEnd.toISOString(),
            employeId: employe.id,
            employeNom: employe.nom,
            disponible: true,
          });
        }
      }

      // Passer au pas de temps suivant
      currentSlotStart = addMinutes(currentSlotStart, slotStep);
    }
  });

  // Trier les créneaux par heure chronologique
  return Array.from(slotsMap.values()).sort((a, b) => a.timeStr.localeCompare(b.timeStr));
}
