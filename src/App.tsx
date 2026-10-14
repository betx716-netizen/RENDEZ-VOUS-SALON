import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PageTransition } from './components/motion';

// Page d'accueil (chargée immédiatement pour un LCP optimal)
import { LandingPage } from './pages/LandingPage';

// Lazy loading des routes secondaires et de l'espace administration pour alléger le bundle initial
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const PublicBookingPage = lazy(() => import('./pages/PublicBookingPage').then((m) => ({ default: m.PublicBookingPage })));
const CancelBookingPage = lazy(() => import('./pages/CancelBookingPage').then((m) => ({ default: m.CancelBookingPage })));
const OfflinePage = lazy(() => import('./pages/OfflinePage').then((m) => ({ default: m.OfflinePage })));
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage })));

import { SpeedInsights } from '@vercel/speed-insights/react';

// PWA components
import { ReloadPrompt } from './components/pwa/ReloadPrompt';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { LayoutDebugger } from './components/debug/LayoutDebugger';

// Admin / Dashboard App
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AgendaPage = lazy(() => import('./pages/AgendaPage').then((m) => ({ default: m.AgendaPage })));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage').then((m) => ({ default: m.AppointmentsPage })));
const ClientsPage = lazy(() => import('./pages/ClientsPage').then((m) => ({ default: m.ClientsPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

function RouteLoadingFallback() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function AnimatedAppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes location={location} key={location.pathname.startsWith('/app') ? 'app-root' : location.pathname}>
          {/* Page d'accueil SaaS */}
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />

          {/* Authentification Salon */}
          <Route
            path="/connexion"
            element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            }
          />
          <Route
            path="/inscription"
            element={
              <PageTransition>
                <RegisterPage />
              </PageTransition>
            }
          />
          <Route
            path="/mot-de-passe-oublie"
            element={
              <PageTransition>
                <ForgotPasswordPage />
              </PageTransition>
            }
          />
          <Route
            path="/nouveau-mot-de-passe"
            element={
              <PageTransition>
                <ResetPasswordPage />
              </PageTransition>
            }
          />

          {/* Espace Public de Réservation (sans connexion) */}
          <Route
            path="/s/:slug"
            element={
              <PageTransition>
                <PublicBookingPage />
              </PageTransition>
            }
          />
          <Route
            path="/annuler/:token"
            element={
              <PageTransition>
                <CancelBookingPage />
              </PageTransition>
            }
          />
          <Route
            path="/hors-ligne"
            element={
              <PageTransition>
                <OfflinePage />
              </PageTransition>
            }
          />
          <Route
            path="/design"
            element={
              <PageTransition>
                <DesignSystemPage />
              </PageTransition>
            }
          />

          {/* Espace Privé Salon (connexion requise) */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="rendez-vous" element={<AppointmentsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="equipe" element={<TeamPage />} />
            <Route path="parametres" element={<SettingsPage />} />
          </Route>

          {/* Redirection fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SpeedInsights />
          <OfflineIndicator />
          <AnimatedAppRoutes />
          <ReloadPrompt />
          <LayoutDebugger />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
