/**
 * src/main.tsx
 * ────────────
 * Bootstrap: on every page load, check if Supabase already
 * has a valid session (e.g. user refreshed the page).
 * If yes, hydrate useUserStore so RouteGuard sees the right state.
 *
 * Without this: refreshing the page shows /signin flash
 * or briefly redirects away from the dashboard.
 */

import React       from 'react';
import ReactDOM    from 'react-dom/client';
import App         from './App';
import { BrowserRouter } from 'react-router-dom';
import { supabase }        from './lib/supabase';
import { useUserStore }    from './Store/UseUserStore';
import './index.css';

// ── Bootstrap: restore session on page load ────────────────────────────
// Runs ONCE before React renders anything.
// Reads existing Supabase session from localStorage/cookie,
// sets useUserStore, then renders the app.
// This replaces the need for useAuthStore entirely.
async function bootstrap() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    // Restore identity into Zustand immediately
    useUserStore.setState({
      isAuthenticated: true,
      id:    session.user.id,
      email: session.user.email || '',
    });

    // Sync full profile from DB in the background.
    // RouteGuard reads onboardingComplete from Zustand persist,
    // so the persisted value covers the initial render.
    // syncProfile() will update it if DB has newer data.
    useUserStore.getState().syncProfile().catch(console.error);
  }

  // Listen for auth state changes (logout, token refresh, tab changes)
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      useUserStore.setState({
        isAuthenticated: true,
        id:    session.user.id,
        email: session.user.email || '',
      });
      useUserStore.getState().syncProfile().catch(console.error);
    } else {
      // Session ended — clear auth state but keep persisted profile data
      useUserStore.setState({
        isAuthenticated: false,
        id:    null,
        onboardingComplete: false,
      });
    }
  });
}

// Run bootstrap first, then render the app
bootstrap().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
       <BrowserRouter>
       <App />
       </BrowserRouter>
      
    </React.StrictMode>
  );
});