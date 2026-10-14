// Point d'entrée de la couche de données.
// Deux implémentations séparées, jamais mélangées :
// - supabaseRepository : production (vrais salons)
// - localRepository    : démo, dans le navigateur
import { isSupabaseConfigured } from '../supabase';
import { localRepository, DEMO_SALON_SLUG } from './local';
import { supabaseRepository } from './supabase';
import type { Repository } from './types';

export * from './types';
export { DEMO_SALON_SLUG } from './local';

const DEMO_SESSION_KEY = 'rdv_salon_demo_session';

/**
 * Session de démonstration : pas de Supabase configuré, ou visite du salon de démo
 * lancée depuis la page de connexion (« Accéder au salon de démonstration »).
 */
export function isDemoSession(): boolean {
  if (!isSupabaseConfigured()) return true;
  try {
    return localStorage.getItem(DEMO_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function setDemoSession(active: boolean): void {
  try {
    if (active) localStorage.setItem(DEMO_SESSION_KEY, '1');
    else localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {}
}

const courant = (): Repository => (isDemoSession() ? localRepository : supabaseRepository);

/** Espace gérant : démo ou production selon la session en cours */
export const repository: Repository = new Proxy({} as Repository, {
  get(_target, prop) {
    const impl = courant();
    const value = impl[prop as keyof Repository];
    return typeof value === 'function' ? value.bind(impl) : value;
  },
});

/** Création de compte et vraie connexion : jamais la démo quand Supabase est configuré */
export const accountRepository = (): Repository => (isSupabaseConfigured() ? supabaseRepository : localRepository);

/**
 * Pages publiques (réservation, annulation) : le salon de démonstration reste consultable
 * en production, tous les autres liens passent par Supabase.
 */
export function publicRepository(slugOuToken?: string): Repository {
  if (!isSupabaseConfigured()) return localRepository;
  if (slugOuToken === 'demo' || slugOuToken === DEMO_SALON_SLUG || slugOuToken?.startsWith('tok-')) {
    return localRepository;
  }
  return supabaseRepository;
}
