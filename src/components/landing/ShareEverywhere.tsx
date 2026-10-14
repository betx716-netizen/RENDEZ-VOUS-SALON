import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Copy, Check, QrCode, Instagram, MessageCircle, Sparkles, Link2 } from 'lucide-react';

export const ShareEverywhere: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const demoUrl = 'rdv-salon.vercel.app/s/ebene-et-or-abidjan';

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${demoUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* EN-TÊTE */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visibilité maximale</span>
          </div>
          <h2 className="text-4xl sm:text-6xl leading-[0.95] font-bold font-display text-foreground tracking-tight">
            Votre lien, partout où sont vos clientes
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ne perdez plus aucune cliente hésitante : donnez-leur un accès direct pour réserver sans attendre votre réponse.
          </p>
        </div>

        {/* CADRE DU LIEN CENTRAL */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          className="max-w-2xl mx-auto bg-surface rounded-[18px] p-4 sm:p-5 border-2 border-border shadow-hard-md flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto truncate">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-mono text-xs sm:text-sm text-foreground font-semibold truncate select-all">
              {demoUrl}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full press bg-primary text-white border-2 border-ink font-semibold text-xs shadow-hard-md transition-colors min-h-[44px] shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Lien copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier le lien</span>
              </>
            )}
          </button>
        </motion.div>

        {/* 3 CAS D'USAGE VISUELS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Bio Instagram */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-surface rounded-[18px] p-7 border-2 border-border shadow-hard-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                1. Bio Instagram & TikTok
              </span>
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Instagram className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-lg font-bold font-display text-foreground">
              Transformez vos vues en rendez-vous
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Une cliente adore votre dernière photo de tresses ? Elle clique dans votre bio et réserve son créneau en 30 secondes.
            </p>
            <div className="p-3 rounded-[16px] bg-surface-alt border-2 border-border text-xs font-mono text-primary flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 shrink-0" />
              <span>rdv-salon.vercel.app/s/votre-salon</span>
            </div>
          </motion.div>

          {/* 2. Statut WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-surface rounded-[18px] p-7 border-2 border-border shadow-hard-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-success uppercase tracking-wider">
                2. Statuts WhatsApp
              </span>
              <div className="w-9 h-9 rounded-full bg-success/15 text-success flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-lg font-bold font-display text-foreground">
              Partagez en 1 clic dans votre statut
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Publiez votre lien chaque matin : vos contacts découvrent les créneaux encore disponibles pour la journée sans vous appeler.
            </p>
            <div className="p-3 rounded-[16px] bg-surface-alt border-2 border-border text-xs text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span>« Prenez RDV ici pour aujourd’hui »</span>
            </div>
          </motion.div>

          {/* 3. QR Code au Salon */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-surface rounded-[18px] p-7 border-2 border-border shadow-hard-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                3. QR Code dans le Salon
              </span>
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-lg font-bold font-display text-foreground">
              Imprimé sur votre comptoir
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pendant qu’une cliente termine sa coiffure, elle scanne le QR code posé à la caisse pour réserver son prochain passage dans 3 semaines.
            </p>
            <div className="p-3 rounded-[16px] bg-surface-alt border-2 border-border text-xs text-foreground flex items-center justify-between">
              <span className="font-semibold">Format flyer & stickers inclus</span>
              <span className="text-[10px] text-primary font-bold">100% gratuit</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
