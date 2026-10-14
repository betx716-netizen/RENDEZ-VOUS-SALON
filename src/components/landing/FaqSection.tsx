import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItemData {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  const faqs: FaqItemData[] = [
    {
      question: "Mes clientes ont-elles besoin d'un compte ?",
      answer:
        "Non, absolument pas ! Vos clientes n’ont aucune application à installer ni aucun mot de passe à retenir. Elles ouvrent simplement votre lien, choisissent leur prestation, leur coiffeuse et leur heure, renseignent leur prénom et numéro WhatsApp, et le rendez-vous est immédiatement réservé.",
    },
    {
      question: 'Comment fonctionnent les rappels ?',
      answer:
        "En un simple clic depuis votre agenda le matin ou la veille, l'application génère un message WhatsApp pré-formaté avec le prénom de la cliente, le jour, l'heure exacte et la prestation choisie. Vous n'avez plus qu'à appuyer sur envoyer sur WhatsApp (+225) : cela divise par 4 les oublis et retards.",
    },
    {
      question: 'Puis-je gérer plusieurs coiffeuses ?',
      answer:
        'Oui ! Vous pouvez enregistrer tous les membres de votre équipe (coiffeuses, tresseuses, manucures, barbiers). Chaque collaboratrice a son propre planning, ses horaires de travail, ses pauses et ses prestations associées. La plateforme bloque automatiquement tout doublon.',
    },
    {
      question: 'Mes données sont-elles protégées ?',
      answer:
        'Absolument. Vos informations salon, vos numéros de téléphone clients et votre chiffre d’affaires sont strictement confidentiels. Vos données sont hébergées sur une infrastructure sécurisée avec sauvegardes automatiques permanentes.',
    },
    {
      question: 'Puis-je partager mon lien sur WhatsApp et Instagram ?',
      answer:
        'Oui, c’est exactement son rôle ! Votre lien unique (ex. rdv-salon.vercel.app/s/votre-nom) se colle dans la bio de votre profil Instagram ou TikTok, se diffuse en statut WhatsApp et peut s’imprimer sous forme de QR code à scanner sur votre comptoir ou vos cartes de visite.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(idx);
    }
  };

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* EN-TÊTE */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Foire aux questions</span>
          </div>
          <h2 className="text-4xl sm:text-6xl leading-[0.95] font-bold font-display text-foreground tracking-tight">
            Vos questions, nos réponses
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Tout ce qu’il faut savoir pour démarrer sereinement sur RDV Salon.
          </p>
        </div>

        {/* ACCORDÉON ACCESSIBLE AU CLAVIER */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="bg-surface rounded-[18px] border-2 border-border shadow-hard-sm overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                  className="w-full py-5 px-6 sm:px-7 text-left flex items-center justify-between gap-4 font-display text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary min-h-[56px] cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <div
                    className={`w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-primary text-white' : 'text-foreground'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${idx}`}
                      role="region"
                      aria-labelledby={`faq-question-${idx}`}
                      initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 sm:px-7 pb-6 pt-1 text-sm sm:text-base text-muted-foreground leading-relaxed border-t border-border">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
