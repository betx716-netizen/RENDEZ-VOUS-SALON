import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Salon } from '../types/database';
import { repository, accountRepository, isDemoSession, setDemoSession } from '../lib/repository';

interface User {
  id: string;
  email: string;
}

export interface SignUpData {
  nom: string;
  slug: string;
  telephone: string;
  adresse: string;
  ville: string;
}

type Resultat = { success: boolean; error?: string };

interface AuthContextType {
  user: User | null;
  salon: Salon | null;
  /** Le salon n'a pas pu être chargé (réseau, base) : à distinguer d'un compte sans salon */
  salonError: string | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<Resultat>;
  signUp: (email: string, password: string, salonData: SignUpData) => Promise<Resultat & { needsEmailConfirmation?: boolean }>;
  createSalonForCurrentUser: (salonData: SignUpData) => Promise<Resultat>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<Resultat>;
  updatePassword: (password: string) => Promise<Resultat>;
  refreshSalon: () => Promise<void>;
  switchDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = { id: 'usr-demo-001', email: 'contact@ebene-et-or.ci' };
const DEMO_USER_KEY = 'rdv_salon_auth_user';

function lireUtilisateurDemo(): User {
  try {
    const saved = localStorage.getItem(DEMO_USER_KEY);
    if (saved) return JSON.parse(saved) as User;
  } catch {}
  return DEMO_USER;
}

/** Messages Supabase Auth -> français */
function messageAuth(error: AuthError | Error): string {
  const msg = (error.message || '').toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (msg.includes('email not confirmed')) return 'Confirmez d’abord votre adresse email grâce au lien reçu par mail.';
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'Un compte existe déjà avec cet email. Connectez-vous.';
  }
  if (msg.includes('password should be at least')) return 'Mot de passe trop court (6 caractères minimum).';
  if (msg.includes('for security purposes') || msg.includes('rate limit')) {
    return 'Trop de tentatives. Patientez une minute puis réessayez.';
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Connexion impossible. Vérifiez votre réseau puis réessayez.';
  }
  return error.message || 'Erreur inattendue.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [salonError, setSalonError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(isDemoSession());

  // Évite de créer deux fois le salon quand plusieurs événements de session arrivent en même temps
  const salonEnCours = useRef<{ userId: string; promise: Promise<void> } | null>(null);

  const chargerSalon = useCallback((authUser: { id: string; user_metadata?: Record<string, unknown> }) => {
    if (salonEnCours.current?.userId === authUser.id) return salonEnCours.current.promise;

    const promise = (async () => {
      try {
        setSalonError(null);
        let s = await repository.getOwnerSalon(authUser.id);
        // Inscription avec confirmation par email : le salon est créé à la première connexion
        const enAttente = authUser.user_metadata?.salon_en_attente as SignUpData | undefined;
        if (!s && enAttente) {
          s = await accountRepository().createSalon({ ...enAttente, proprietaire_id: authUser.id });
        }
        setSalon(s);
      } catch (err) {
        console.error('Erreur chargement salon :', err);
        setSalon(null);
        setSalonError(err instanceof Error ? err.message : 'Impossible de charger votre salon.');
      } finally {
        salonEnCours.current = null;
      }
    })();
    salonEnCours.current = { userId: authUser.id, promise };
    return promise;
  }, []);

  const appliquerSession = useCallback(
    async (session: Session | null) => {
      const authUser: SupabaseUser | undefined = session?.user;
      if (!authUser) {
        setUser(null);
        setSalon(null);
        setSalonError(null);
        return;
      }
      setUser({ id: authUser.id, email: authUser.email || '' });
      await chargerSalon(authUser);
    },
    [chargerSalon]
  );

  useEffect(() => {
    // 1. Démo : utilisateur fictif, données dans le navigateur
    if (isDemoMode || !supabase) {
      const demoUser = lireUtilisateurDemo();
      setUser(demoUser);
      chargerSalon(demoUser).finally(() => setLoading(false));
      return;
    }

    // 2. Production : session Supabase
    let actif = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await appliquerSession(session);
      if (actif) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return;
      // Différé : appeler Supabase directement dans ce callback peut bloquer le client
      setTimeout(() => {
        if (actif) appliquerSession(session);
      }, 0);
    });

    return () => {
      actif = false;
      subscription.unsubscribe();
    };
  }, [isDemoMode, appliquerSession, chargerSalon]);

  const refreshSalon = async () => {
    if (!user) return;
    if (isDemoMode || !supabase) {
      await chargerSalon(user);
      return;
    }
    const { data } = await supabase.auth.getUser();
    await chargerSalon(data.user ?? user);
  };

  const signIn = async (email: string, password: string): Promise<Resultat> => {
    // Démo pure (aucune base configurée) : n'importe quel identifiant ouvre le salon de démo
    if (!isSupabaseConfigured() || !supabase) {
      const demoUser = { id: DEMO_USER.id, email };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      await chargerSalon(demoUser);
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { success: false, error: messageAuth(error) };
    // Une vraie connexion quitte toujours la démo (drapeau d'abord : il oriente les lectures)
    setDemoSession(false);
    await appliquerSession(data.session);
    setIsDemoMode(false);
    return { success: true };
  };

  const signUp = async (email: string, password: string, salonData: SignUpData) => {
    if (!isSupabaseConfigured() || !supabase) {
      const newUser = { id: `usr-${Date.now()}`, email };
      const newSalon = await accountRepository().createSalon({ ...salonData, proprietaire_id: newUser.id });
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
      setSalon(newSalon);
      return { success: true };
    }

    setDemoSession(false);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Conservé côté compte pour créer le salon dès la première connexion
        data: { salon_en_attente: salonData },
        emailRedirectTo: `${window.location.origin}/connexion`,
      },
    });
    if (error) return { success: false, error: messageAuth(error) };

    // Supabase ne renvoie pas d'erreur pour un email déjà inscrit quand la confirmation est active
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { success: false, error: 'Un compte existe déjà avec cet email. Connectez-vous.' };
    }

    if (!data.session) {
      setIsDemoMode(false);
      return { success: true, needsEmailConfirmation: true };
    }

    await appliquerSession(data.session);
    setIsDemoMode(false);
    return { success: true };
  };

  const createSalonForCurrentUser = async (salonData: SignUpData): Promise<Resultat> => {
    if (!user) return { success: false, error: 'Connectez-vous d’abord.' };
    try {
      const s = await repository.createSalon({ ...salonData, proprietaire_id: user.id });
      setSalon(s);
      setSalonError(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Création du salon impossible.' };
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      setDemoSession(false);
      localStorage.removeItem(DEMO_USER_KEY);
    }
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSalon(null);
    setSalonError(null);
    setIsDemoMode(isDemoSession());
  };

  const resetPassword = async (email: string): Promise<Resultat> => {
    if (!supabase) return { success: true };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
    });
    if (error) return { success: false, error: messageAuth(error) };
    return { success: true };
  };

  const updatePassword = async (password: string): Promise<Resultat> => {
    if (!supabase) return { success: true };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: messageAuth(error) };
    return { success: true };
  };

  const switchDemoUser = () => {
    setDemoSession(true);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEMO_USER));
    // Chargement affiché jusqu'à ce que le salon de démo soit prêt (sinon redirection vers l'inscription)
    setLoading(true);
    setSalon(null);
    setUser(DEMO_USER);
    if (isDemoMode) {
      chargerSalon(DEMO_USER).finally(() => setLoading(false));
    } else {
      setIsDemoMode(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        salon,
        salonError,
        loading,
        isDemoMode,
        signIn,
        signUp,
        createSalonForCurrentUser,
        signOut,
        resetPassword,
        updatePassword,
        refreshSalon,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
