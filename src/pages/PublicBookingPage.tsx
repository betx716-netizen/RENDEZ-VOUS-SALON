import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Scissors,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  CalendarDays,
  UserCheck,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { publicRepository } from '../lib/repository';
import { salonToday } from '../lib/timezone';
import {
  calculateAvailableSlots,
  CalculatedSlot,
  PlageConge,
  PlageOccupee,
} from '../lib/slot-calculator';
import {
  Salon,
  Service,
  Employe,
  HoraireEmploye,
} from '../types/database';
import {
  formatFCFA,
  formatDateHuman,
  formatDateShort,
  formatDuree,
  formatHeure,
} from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { addDays, format, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BookingHeader,
  BookingSteps,
  BookingConfirmation,
  BookingStickySummary,
  BookingSkeleton,
} from '../components/booking';

// Pastilles de catégorie : aplats alternés de la palette
const CATEGORY_COLORS = ['bg-lime', 'bg-candy', 'bg-sun'];

const StepTitle: React.FC<{ title: string; backLabel?: string; onBack?: () => void; aside?: React.ReactNode }> = ({
  title,
  backLabel,
  onBack,
  aside,
}) => (
  <div className="flex items-end justify-between gap-3 px-1">
    <h2 className="text-2xl sm:text-3xl font-bold font-display text-ink leading-none">{title}</h2>
    {onBack ? (
      <button
        type="button"
        onClick={onBack}
        className="shrink-0 text-xs font-bold text-ink underline decoration-2 underline-offset-4 decoration-primary flex items-center gap-1 cursor-pointer min-h-[32px]"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>{backLabel}</span>
      </button>
    ) : (
      aside
    )}
  </div>
);

// Carte sélectionnable : blanche au repos, citron quand elle est choisie
const selectableCard = (isSelected: boolean) =>
  `press border-2 border-ink cursor-pointer select-none ${
    isSelected ? 'bg-lime shadow-hard-lg -rotate-1' : 'bg-surface shadow-hard-md'
  }`;

const fieldClass = (hasError = false) =>
  `w-full px-4 py-3 rounded-[14px] bg-surface border-2 text-ink placeholder:text-ink/40 focus:outline-none focus:shadow-hard-sm min-h-[48px] text-base transition-shadow ${
    hasError ? 'border-destructive' : 'border-ink focus:border-primary'
  }`;

export const PublicBookingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { success, error } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [horaires, setHoraires] = useState<HoraireEmploye[]>([]);
  const [conges, setConges] = useState<PlageConge[]>([]);
  const [rendezVous, setRendezVous] = useState<PlageOccupee[]>([]);
  const [loading, setLoading] = useState(true);

  // Étapes du tunnel de réservation (1 à 4, confirmation)
  const [step, setStep] = useState<number>(1);
  const touchStartX = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    touchStartX.current = null;

    if (deltaX < -60 && canContinue && step < 4) {
      nextStep();
    } else if (deltaX > 60 && step > 1) {
      prevStep();
    }
  };

  // Sélections utilisateur
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  // La cliente ne choisit pas sa coiffeuse : tout créneau où au moins une coiffeuse est libre est proposé
  const selectedEmployeId = 'any';
  const [selectedDate, setSelectedDate] = useState<Date>(salonToday());
  const [availableSlots, setAvailableSlots] = useState<CalculatedSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<CalculatedSlot | null>(null);

  // Coordonnées client
  const [clientNom, setClientNom] = useState('');
  const [clientTelephone, setClientTelephone] = useState('+225 ');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // Erreurs de formulaire
  const [formErrors, setFormErrors] = useState<{ nom?: string; telephone?: string }>({});

  // État de confirmation
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedData, setConfirmedData] = useState<{
    token: string;
    debut: string;
    fin: string;
    employeNom: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Chargement des données du salon
  useEffect(() => {
    const loadSalonData = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        // En production, un lien inconnu renvoie null => écran « Salon introuvable »
        const data = await publicRepository(slug).getPublicBookingData(slug || 'demo');
        if (data) {
          setSalon(data.salon);
          setServices(data.services);
          setEmployes(data.employes);
          setHoraires(data.horaires);
          setConges(data.conges);
          setRendezVous(data.rendezVous);
        }
      } catch (err) {
        console.error('Erreur chargement salon:', err);
        setLoadError(err instanceof Error ? err.message : 'Impossible de charger le salon.');
      } finally {
        setLoading(false);
      }
    };
    loadSalonData();
  }, [slug]);

  // Recalcul des créneaux
  useEffect(() => {
    if (!salon || !selectedService) return;

    const slots = calculateAvailableSlots({
      date: selectedDate,
      salon,
      service: selectedService,
      employes,
      targetEmployeId: selectedEmployeId === 'any' ? null : selectedEmployeId,
      horaires,
      conges,
      rendezVous,
    });

    setAvailableSlots(slots);
    if (selectedSlot && !slots.some((s) => s.debut === selectedSlot.debut)) {
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedService, selectedEmployeId, salon, employes, horaires, conges, rendezVous]);

  // État de chargement en squelettes (aucun texte "Chargement...")
  if (loading) {
    return <BookingSkeleton />;
  }

  if (!salon) {
    return (
      <div className="min-h-[100dvh] bg-dots flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface p-8 rounded-[18px] shadow-hard-lg text-center border-2 border-ink">
          <div className="w-14 h-14 rounded-[14px] bg-candy border-2 border-ink flex items-center justify-center mx-auto mb-4 -rotate-6">
            <AlertCircle className="w-7 h-7 text-ink" />
          </div>
          <h2 className="text-2xl font-bold font-display text-ink">
            {loadError ? 'Page indisponible' : 'Salon introuvable'}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {loadError || "Le lien de réservation semble incorrect ou le salon n'est plus actif."}
          </p>
          {loadError ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="press inline-flex items-center justify-center mt-6 px-6 py-2.5 min-h-[48px] rounded-full bg-primary text-white border-2 border-ink font-bold text-sm shadow-hard-md cursor-pointer"
            >
              Réessayer
            </button>
          ) : (
            <Link
              to="/"
              className="press inline-flex items-center justify-center mt-6 px-6 py-2.5 min-h-[48px] rounded-full bg-primary text-white border-2 border-ink font-bold text-sm shadow-hard-md"
            >
              Retour à l'accueil
            </Link>
          )}
        </div>
      </div>
    );
  }

  const maxDays = salon ? Math.max(1, Math.min(salon.delai_max_jours ?? 30, 90)) : 14;
  const dateOptions = Array.from({ length: maxDays }, (_, i) => addDays(salonToday(), i));

  // Validation du formulaire
  const validateForm = () => {
    const errs: { nom?: string; telephone?: string } = {};
    if (!clientNom.trim()) {
      errs.nom = 'Le prénom et nom sont requis';
    }
    const cleanTel = clientTelephone.replace(/\s+/g, '');
    if (cleanTel.length < 8) {
      errs.telephone = 'Numéro de téléphone invalide (ex: +225 07 00 00 00 00)';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Soumission de la réservation
  const handleConfirmBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedService || !selectedSlot) return;

    if (!validateForm()) {
      error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setBookingError(null);
    setSubmitting(true);
    try {
      const res = await publicRepository(slug).bookPublicAppointment({
        salonId: salon.id,
        serviceId: selectedService.id,
        employeId: selectedSlot.employeId,
        debut: selectedSlot.debut,
        clientNom: clientNom.trim(),
        clientTelephone: clientTelephone.trim(),
        clientEmail: clientEmail.trim() || undefined,
        notes: clientNotes.trim() || undefined,
      });

      if (!res.success) {
        const errMsg = res.error || 'Erreur lors de la réservation';
        setBookingError(errMsg);
        error(errMsg);
        setSubmitting(false);
        return;
      }

      setBookingError(null);
      setBookingConfirmed(true);
      setConfirmedData({
        token: res.token_annulation || '',
        debut: selectedSlot.debut,
        fin: selectedSlot.fin,
        employeNom: res.employe_nom || selectedSlot.employeNom,
      });

      // Confettis festifs
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C6F432', '#FF8AD8', '#FFD23F', '#6A4CF5', '#111111'],
      });

      success('Rendez-vous réservé avec succès !');
    } catch (err: any) {
      console.error('Erreur réservation:', err);
      const msg = err.message || 'Une erreur est survenue';
      setBookingError(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Étapes : 1 prestation, 3 date & heure, 4 coordonnées (l'étape 2, choix de la coiffeuse, n'existe plus)
  const nextStep = () => {
    if (step === 1 && selectedService) setStep(3);
    else if (step === 3 && selectedSlot) setStep(4);
    else if (step === 4) handleConfirmBooking();
  };

  const prevStep = () => {
    if (step === 4) setStep(3);
    else if (step === 3) setStep(1);
  };

  const canContinue =
    (step === 1 && !!selectedService) ||
    (step === 3 && !!selectedSlot) ||
    step === 4;

  return (
    <div className="w-full max-w-full min-h-[100dvh] bg-dots text-foreground px-4 sm:px-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] sm:pb-16 box-border min-w-0">
      <div className="max-w-2xl mx-auto space-y-6 w-full min-w-0">
        {/* EN-TÊTE DU SALON */}
        <BookingHeader salon={salon} />

        {/* SI CONFIRMÉ : AFFICHER LA PAGE DE CONFIRMATION */}
        {bookingConfirmed && confirmedData && selectedService ? (
          <BookingConfirmation
            salon={salon}
            service={selectedService}
            employeNom={confirmedData.employeNom}
            debut={confirmedData.debut}
            fin={confirmedData.fin}
            token={confirmedData.token}
            clientNom={clientNom}
            clientTelephone={clientTelephone}
          />
        ) : (
          <>
            {/* BARRE DE PROGRESSION EN 4 ÉTAPES */}
            <BookingSteps
              currentStep={step === 1 ? 1 : step === 3 ? 2 : 3}
              onStepClick={(s) => setStep(s === 1 ? 1 : 3)}
            />

            {/* CONTENU ANIMÉ DE L'ÉTAPE COURANTE (GLISSEMENT DOUX & SWIPE TACTILE) */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="touch-pan-y"
            >
              <AnimatePresence mode="wait">
              {/* ÉTAPE 1 : CHOIX DE LA PRESTATION */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="space-y-5"
                >
                  <StepTitle
                    title="Quelle prestation ?"
                    aside={
                      <span className="shrink-0 text-xs font-bold text-ink px-2.5 py-1 rounded-full border-2 border-ink bg-surface">
                        {services.length} au menu
                      </span>
                    }
                  />

                  {Object.entries(
                    services.reduce<Record<string, Service[]>>((acc, srv) => {
                      (acc[srv.categorie || 'Autres'] ||= []).push(srv);
                      return acc;
                    }, {})
                  ).map(([categorie, srvs], catIdx) => (
                    <section key={categorie} className="space-y-3">
                      <h3
                        className={`inline-block text-sm font-bold text-ink px-3 py-1 rounded-full border-2 border-ink ${
                          CATEGORY_COLORS[catIdx % CATEGORY_COLORS.length]
                        } ${catIdx % 2 === 0 ? '-rotate-2' : 'rotate-1'}`}
                      >
                        {categorie}
                      </h3>
                      {srvs.map((srv) => {
                        const isSelected = selectedService?.id === srv.id;
                        return (
                          <div
                            key={srv.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            onClick={() => setSelectedService(srv)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedService(srv);
                              }
                            }}
                            className={`w-full text-left p-5 rounded-[18px] flex items-center justify-between gap-4 ${selectableCard(isSelected)}`}
                          >
                            <div className="space-y-2 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-ink font-display leading-tight">
                                  {srv.nom}
                                </span>
                                {isSelected && (
                                  <span className="w-6 h-6 rounded-full bg-ink text-lime flex items-center justify-center shrink-0">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              {srv.description && (
                                <p className="text-sm text-ink/70 line-clamp-2">
                                  {srv.description}
                                </p>
                              )}
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink px-2.5 py-0.5 rounded-full border-2 border-ink bg-surface">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{formatDuree(srv.duree_minutes)}</span>
                              </span>
                            </div>

                            <span className="shrink-0 font-bold text-sm sm:text-base text-ink bg-sun border-2 border-ink rounded-full px-3 py-1 whitespace-nowrap">
                              {formatFCFA(srv.prix_fcfa)}
                            </span>
                          </div>
                        );
                      })}
                    </section>
                  ))}
                </motion.div>
              )}

              {/* ÉTAPE 3 : DATE ET HEURE (CRÉNEAUX EN GRANDES PASTILLES DE 48 PX) */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  <StepTitle title="Quand ?" backLabel="Retour" onBack={prevStep} />

                  {/* SÉLECTEUR RAPIDE DE JOURS */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider block px-1">
                      Date souhaitée
                    </label>
                    {/* Marge interne pour que les ombres dures ne soient pas rognées par le défilement */}
                    <div className="flex gap-3 overflow-x-auto pt-1 pb-3 pl-1 pr-2 scrollbar-none">
                      {dateOptions.map((date) => {
                        const isSelected = isSameDay(date, selectedDate);
                        const isDayToday = isSameDay(date, salonToday());
                        return (
                          <button
                            key={date.toISOString()}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedDate(date)}
                            className={`flex flex-col items-center justify-center min-w-[72px] sm:min-w-[80px] py-2.5 px-2 rounded-[16px] border-2 border-ink shrink-0 cursor-pointer min-h-[76px] transition-transform ${
                              isSelected
                                ? 'bg-ink text-lime shadow-hard-sm -rotate-2'
                                : 'bg-surface text-ink shadow-hard-sm hover:-translate-y-0.5'
                            }`}
                          >
                            <span className={`text-[10px] uppercase font-bold ${isSelected ? 'text-lime' : 'text-ink/60'}`}>
                              {isDayToday ? "Auj." : format(date, 'EEE', { locale: fr })}
                            </span>
                            <span className="text-2xl font-bold leading-none my-0.5">
                              {format(date, 'd')}
                            </span>
                            <span className={`text-[10px] font-medium ${isSelected ? 'text-lime' : 'text-ink/60'}`}>
                              {format(date, 'MMM', { locale: fr })}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* GRILLE DES CRÉNEAUX GROUPÉS PAR MATIN / APRÈS-MIDI / SOIR */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-xs font-bold text-ink uppercase tracking-wider">
                        Créneaux libres ({availableSlots.length})
                      </label>
                      <span className="text-xs font-bold text-ink px-2.5 py-0.5 rounded-full border-2 border-ink bg-surface">
                        Durée : {selectedService ? formatDuree(selectedService.duree_minutes) : ''}
                      </span>
                    </div>

                    {availableSlots.length === 0 ? (
                      <div className="bg-surface rounded-[18px] p-8 text-center border-2 border-ink border-dashed space-y-3">
                        <div className="w-14 h-14 rounded-[14px] bg-sun border-2 border-ink flex items-center justify-center mx-auto rotate-6">
                          <CalendarDays className="w-7 h-7 text-ink" />
                        </div>
                        <h4 className="font-bold text-lg text-ink">
                          Rien de libre ce jour-là
                        </h4>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Tous les horaires sont complets ou le salon est fermé. Essayez une autre date ci-dessus.
                        </p>
                      </div>
                    ) : (
                      (() => {
                        const morningSlots = availableSlots.filter((slot) => {
                          const hour = parseInt(formatHeure(slot.debut).split(':')[0] || '0', 10);
                          return hour < 12;
                        });
                        const afternoonSlots = availableSlots.filter((slot) => {
                          const hour = parseInt(formatHeure(slot.debut).split(':')[0] || '0', 10);
                          return hour >= 12 && hour < 17;
                        });
                        const eveningSlots = availableSlots.filter((slot) => {
                          const hour = parseInt(formatHeure(slot.debut).split(':')[0] || '0', 10);
                          return hour >= 17;
                        });

                        const groups = [
                          { label: 'Matin', period: '08h - 12h', icon: Sun, slots: morningSlots },
                          { label: 'Après-midi', period: '12h - 17h', icon: Sunset, slots: afternoonSlots },
                          { label: 'Soirée', period: '17h et +', icon: Moon, slots: eveningSlots },
                        ].filter((g) => g.slots.length > 0);

                        return (
                          <div className="space-y-5">
                            {groups.map((group) => {
                              const GroupIcon = group.icon;
                              return (
                                <div key={group.label} className="space-y-2.5">
                                  <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2 text-sm font-bold text-ink">
                                      <GroupIcon className="w-4 h-4" />
                                      <span>{group.label}</span>
                                      <span className="text-xs font-normal text-muted-foreground">({group.period})</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">
                                      {group.slots.length} créneau{group.slots.length > 1 ? 'x' : ''}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {group.slots.map((slot) => {
                                      const isSelected = selectedSlot?.debut === slot.debut;
                                      return (
                                        <button
                                          key={slot.debut}
                                          type="button"
                                          aria-pressed={isSelected}
                                          onClick={() => setSelectedSlot(slot)}
                                          className={`press h-12 min-h-[48px] rounded-[14px] border-2 border-ink text-center text-base font-bold flex items-center justify-center cursor-pointer select-none ${
                                            isSelected
                                              ? 'bg-primary text-white shadow-hard-md -rotate-2'
                                              : 'bg-surface text-ink shadow-hard-sm'
                                          }`}
                                        >
                                          <span>{formatHeure(slot.debut)}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()
                    )}
                  </div>
                </motion.div>
              )}

              {/* ÉTAPE 4 : COORDONNÉES CLIENT */}
              {step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="space-y-5"
                >
                  <StepTitle title="Vos coordonnées" backLabel="Modifier l'horaire" onBack={prevStep} />

                  <form onSubmit={handleConfirmBooking} className="bg-surface rounded-[18px] p-6 sm:p-8 border-2 border-ink shadow-hard-lg space-y-5">
                    {/* Prénom et Nom */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-ink block">
                        Prénom et Nom <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={clientNom}
                        onChange={(e) => {
                          setClientNom(e.target.value);
                          if (formErrors.nom) setFormErrors({ ...formErrors, nom: undefined });
                        }}
                        placeholder="Ex: Aminata Koné"
                        className={fieldClass(!!formErrors.nom)}
                      />
                      {formErrors.nom && (
                        <p className="text-xs font-bold text-destructive mt-1">{formErrors.nom}</p>
                      )}
                    </div>

                    {/* Téléphone WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-ink block">
                        Numéro WhatsApp (pour le rappel) <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={clientTelephone}
                        onChange={(e) => {
                          setClientTelephone(e.target.value);
                          if (formErrors.telephone) setFormErrors({ ...formErrors, telephone: undefined });
                        }}
                        placeholder="+225 07 00 00 00 00"
                        className={fieldClass(!!formErrors.telephone)}
                      />
                      {formErrors.telephone && (
                        <p className="text-xs font-bold text-destructive mt-1">{formErrors.telephone}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Vous recevrez un message de confirmation sans frais.
                      </p>
                    </div>

                    {/* Email optionnel */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-ink block">
                        Adresse e-mail <span className="text-muted-foreground font-normal">(optionnel)</span>
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="aminata@example.com"
                        className={fieldClass()}
                      />
                    </div>

                    {/* Remarques / Précisions */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-ink block">
                        Précision sur vos cheveux ou votre demande <span className="text-muted-foreground font-normal">(optionnel)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                        placeholder="Ex: Longueur mi-dos, cheveux défrisés..."
                        className={fieldClass()}
                      />
                    </div>

                    {bookingError && (
                      <div role="alert" className="p-3.5 rounded-[14px] bg-candy border-2 border-ink text-ink text-sm font-medium">
                        {bookingError}
                      </div>
                    )}

                    {/* Bouton de confirmation Desktop */}
                    <div className="pt-2 hidden sm:block">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="press w-full py-4 px-6 rounded-full bg-lime text-ink border-2 border-ink font-bold text-lg shadow-hard-md min-h-[56px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>{submitting ? 'Validation en cours...' : 'Confirmer mon rendez-vous'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            </div>

            {/* BOUTON CONTINUER POUR DESKTOP */}
            {step < 4 && (
              <div className="hidden sm:flex items-center justify-between pt-4">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={prevStep}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-ink underline decoration-2 underline-offset-4 disabled:opacity-30 disabled:no-underline cursor-pointer min-h-[44px]"
                >
                  Précédent
                </button>

                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={nextStep}
                  className="press inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white border-2 border-ink font-bold text-base shadow-hard-md min-h-[52px] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* RÉSUMÉ COLLANT MOBILE AVEC BOUTON CONTINUER */}
            <BookingStickySummary
              service={selectedService}
              slot={selectedSlot}
              step={step}
              onNext={nextStep}
              canContinue={canContinue}
              submitting={submitting}
            />
          </>
        )}
      </div>
    </div>
  );
};
