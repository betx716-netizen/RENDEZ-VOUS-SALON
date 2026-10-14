import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Nettoyage rigoureux de l'URL pour éviter les doubles slashes et suffixes invalides
// qui provoquent l'erreur Supabase PostgREST : "Invalid path specified in request URL"
export function cleanSupabaseUrl(raw: string): string {
  if (!raw) return '';
  let url = raw.trim();
  // Supprime les guillemets éventuels entourant la variable (ex: "https://...")
  url = url.replace(/^["']+|["']+$/g, '').trim();

  // Si l'utilisateur a collé l'URL du tableau de bord Supabase au lieu de l'URL de l'API :
  // ex: https://supabase.com/dashboard/project/abcxyz ou https://app.supabase.com/project/abcxyz
  try {
    if (url.includes('supabase.com/dashboard/project/') || url.includes('app.supabase.com/project/')) {
      const match = url.match(/\/project\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://${match[1]}.supabase.co`;
      }
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      // Pour tout projet Supabase standard, l'URL de base ne doit comporter AUCUN chemin
      // (/rest/v1, /auth/v1, /dashboard, etc. provoquent l'erreur "Invalid path specified in request URL")
      return `${parsed.protocol}//${parsed.host}`;
    }
  } catch {
    // En cas d'échec de parsing d'URL standard, nettoyage regex
  }

  // Nettoyage de secours
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/rest\/?$/, '');
  url = url.replace(/\/auth\/v1\/?$/, '');
  return url;
}

export function cleanSupabaseKey(raw: string): string {
  if (!raw) return '';
  return raw.trim().replace(/^["']+|["']+$/g, '').trim();
}

export const supabaseUrl = cleanSupabaseUrl(rawUrl);
export const supabaseAnonKey = cleanSupabaseKey(rawKey);

// Détection si les vraies clés Supabase ont été configurées
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.length > 0 &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('votre-projet.supabase.co') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 20 &&
    !supabaseAnonKey.includes('votre_cle_anon_publique')
  );
};

// Instance de client Supabase (null si non configuré)
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
