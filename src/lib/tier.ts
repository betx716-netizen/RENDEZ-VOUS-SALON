/**
 * Architecture de performance en 3 paliers
 * - lite : économie de données, matériel contraint, ou préférence d'animation réduite
 * - standard : téléphone / tablette récent (< 1024px)
 * - immersive : grand écran (>= 1024px) avec processeur puissant (>= 8 coeurs)
 */

import { useState, useEffect } from 'react';

export type PerformanceTier = 'lite' | 'standard' | 'immersive';

let cachedTier: PerformanceTier | null = null;

export function getPerformanceTier(): PerformanceTier {
  if (typeof window === 'undefined') return 'standard';
  if (cachedTier) return cachedTier;

  try {
    // 1. Détection des contraintes 'lite'
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
      deviceMemory?: number;
    };

    const saveData = nav.connection?.saveData === true;
    const slowConnection = ['slow-2g', '2g', '3g'].includes(nav.connection?.effectiveType || '');
    const lowCores = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
    const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2;

    if (prefersReducedMotion || saveData || slowConnection || lowCores || lowMemory) {
      cachedTier = 'lite';
      return cachedTier;
    }

    // 2. Détection 'immersive' : écran large >= 1024px avec CPU puissant >= 8 coeurs
    const isWideScreen = window.innerWidth >= 1024;
    const isPowerfulCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency >= 8;

    if (isWideScreen && isPowerfulCpu) {
      cachedTier = 'immersive';
      return cachedTier;
    }

    // 3. Sinon 'standard' (smartphones modernes, laptops 6 coeurs, etc.)
    cachedTier = 'standard';
    return cachedTier;
  } catch {
    cachedTier = 'standard';
    return cachedTier;
  }
}

/**
 * Hook React retournant le palier actuel et s'ajustant au redimensionnement
 */
export function usePerformanceTier(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>(() => getPerformanceTier());

  useEffect(() => {
    const handleResize = () => {
      // Réinitialise le cache si l'écran franchit 1024px
      const current = getPerformanceTier();
      const isWide = window.innerWidth >= 1024;
      if (current === 'immersive' && !isWide) {
        cachedTier = 'standard';
        setTier('standard');
      } else if (current === 'standard' && isWide && (navigator.hardwareConcurrency || 0) >= 8) {
        cachedTier = 'immersive';
        setTier('immersive');
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return tier;
}
