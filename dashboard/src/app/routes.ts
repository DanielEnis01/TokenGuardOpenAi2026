import React from 'react';
import { createHashRouter, Outlet, Navigate } from "react-router";
import { useAuth } from './providers/AuthProvider';
import { firebaseConfigurationError } from './lib/firebase';
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Monitor from "./pages/Monitor";
import Guardrails from "./pages/Guardrails";
import History from "./pages/History";
import Tools from "./pages/Tools";
import Settings from "./pages/Settings";
import ErrorPage from "./pages/ErrorPage";

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return React.createElement(
      'div',
      { className: 'flex h-screen w-screen items-center justify-center bg-black text-white' },
      React.createElement(
        'div',
        { className: 'text-center' },
        React.createElement('p', { className: 'animate-pulse text-sm text-gray-400' }, 'Loading...')
      )
    );
  }

  if (!user) {
    // Keep local dashboard work usable before the Firebase project credentials
    // are supplied. Production remains protected by Firebase authentication.
    if (firebaseConfigurationError && import.meta.env.DEV) {
      return React.createElement(Outlet);
    }
    return React.createElement(Navigate, { to: '/auth', replace: true });
  }

  return React.createElement(Outlet);
}

export const router = createHashRouter([
  {
    path: "/",
    Component: Auth,
  },
  {
    path: "/auth",
    Component: Auth,
  },
  {
    Component: ProtectedLayout,
    children: [
      {
        path: "/onboarding",
        Component: Onboarding,
      },
      {
        path: "/monitor",
        Component: Monitor,
      },
      {
        path: "/guardrails",
        Component: Guardrails,
      },
      {
        path: "/history",
        Component: History,
      },
      {
        path: "/tools",
        Component: Tools,
      },
      {
        path: "/settings",
        Component: Settings,
      },
    ],
  },
  {
    path: "*",
    Component: ErrorPage,
  },
]);
