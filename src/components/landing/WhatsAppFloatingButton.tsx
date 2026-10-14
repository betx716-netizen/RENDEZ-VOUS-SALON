import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  // Lien officiel de contact WhatsApp (numéro par défaut configuré)
  const whatsappUrl =
    'https://wa.me/2250759358662?text=Bonjour%2C%20je%20veux%20cr%C3%A9er%20mon%20salon%20sur%20RDV%20Salon';

  return (
    <aside aria-label="Assistance WhatsApp" className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40">
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discuter sur WhatsApp avec l'équipe RDV Salon"
        whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-success hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-hard-lg border border-white/20 transition-all min-h-[48px] focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline">Discuter sur WhatsApp</span>
        <span className="sm:hidden font-medium">Aide</span>
      </motion.a>
    </aside>
  );
};
