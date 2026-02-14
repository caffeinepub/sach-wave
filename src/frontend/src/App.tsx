import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { usePatchedActor } from './hooks/usePatchedActor';
import AuthGate from './pages/auth/AuthGate';
import AppShell from './layout/AppShell';
import HomePage from './pages/home/HomePage';
import SearchPage from './pages/search/SearchPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import MessagesPage from './pages/messages/MessagesPage';
import ConversationPage from './pages/messages/ConversationPage';
import ProfilePage from './pages/profile/ProfilePage';
import StoryViewerPage from './pages/stories/StoryViewerPage';
import StoriesPage from './pages/stories/StoriesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import SettingsPage from './pages/settings/SettingsPage';
import ErrorBoundary from './components/system/ErrorBoundary';
import StartupScreen from './components/system/StartupScreen';
import SplashScreen from './components/system/SplashScreen';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type { StartupPhase } from './utils/startup';
import { logStartupPhase, logStartupError } from './utils/startup';
import { hasCompletedOnboarding } from './utils/onboarding';

const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  ),
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: HomePage,
});

const searchRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/search',
  component: SearchPage,
});

const storiesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/stories',
  component: StoriesPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/messages',
  component: MessagesPage,
});

const conversationRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/messages/$userId',
  component: ConversationPage,
});

const profileRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/profile/$userId',
  component: ProfilePage,
});

const storyViewerRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/stories/$storyId',
  component: StoryViewerPage,
});

const adminRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  authenticatedRoute.addChildren([
    homeRoute,
    searchRoute,
    storiesRoute,
    notificationsRoute,
    messagesRoute,
    conversationRoute,
    profileRoute,
    storyViewerRoute,
    adminRoute,
    settingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const ACTOR_INIT_TIMEOUT = 15000; // 15 seconds
const PROFILE_FETCH_TIMEOUT = 10000; // 10 seconds
const SPLASH_DURATION = 2000; // 2 seconds

export default function App() {
  const queryClient = useQueryClient();
  const { identity, isInitializing, loginStatus, isLoginError } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = usePatchedActor();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched, error: profileError } = useGetCallerUserProfile();

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [startupPhase, setStartupPhase] = useState<StartupPhase>('initializing-identity');
  const [startupError, setStartupError] = useState<{ message: string } | null>(null);
  const [actorInitStartTime, setActorInitStartTime] = useState<number>(Date.now());

  const isAuthenticated = !!identity;

  // Handle splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      // Check onboarding after splash
      if (!hasCompletedOnboarding()) {
        setShowOnboarding(true);
      }
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  // Track startup phases
  useEffect(() => {
    if (isInitializing) {
      setStartupPhase('initializing-identity');
      logStartupPhase('initializing-identity');
    } else if (isLoginError) {
      setStartupPhase('error');
      setStartupError({
        message: 'Failed to initialize authentication. Please check your connection and try again.',
      });
      logStartupError({
        phase: 'initializing-identity',
        message: 'Internet Identity initialization failed',
      });
    } else if (isAuthenticated && !actor) {
      setStartupPhase('connecting-backend');
      logStartupPhase('connecting-backend');
    } else if (isAuthenticated && actor && profileLoading && !profileFetched) {
      setStartupPhase('loading-profile');
      logStartupPhase('loading-profile');
    } else if (isAuthenticated && actor && profileFetched) {
      setStartupPhase('ready');
      logStartupPhase('ready', 'Startup complete');
    }
  }, [isInitializing, isLoginError, isAuthenticated, actor, profileLoading, profileFetched]);

  // Watchdog for actor initialization timeout
  useEffect(() => {
    if (isAuthenticated && !actor && startupPhase === 'connecting-backend') {
      const elapsed = Date.now() - actorInitStartTime;
      if (elapsed > ACTOR_INIT_TIMEOUT) {
        setStartupPhase('error');
        setStartupError({
          message: 'Backend connection timed out. Please check your network and try again.',
        });
        logStartupError({
          phase: 'connecting-backend',
          message: 'Actor initialization timeout',
        });
      }
    }
  }, [isAuthenticated, actor, startupPhase, actorInitStartTime]);

  // Watchdog for profile fetch timeout
  useEffect(() => {
    if (isAuthenticated && actor && profileLoading && !profileFetched && startupPhase === 'loading-profile') {
      const timeout = setTimeout(() => {
        if (profileLoading && !profileFetched) {
          setStartupPhase('error');
          setStartupError({
            message: 'Profile loading timed out. Please try again.',
          });
          logStartupError({
            phase: 'loading-profile',
            message: 'Profile fetch timeout',
          });
        }
      }, PROFILE_FETCH_TIMEOUT);

      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, actor, profileLoading, profileFetched, startupPhase]);

  // Handle profile fetch errors
  useEffect(() => {
    if (profileError && isAuthenticated && actor) {
      setStartupPhase('error');
      setStartupError({
        message: 'Failed to load your profile. Please try again.',
      });
      logStartupError({
        phase: 'loading-profile',
        message: 'Profile fetch error',
        error: profileError as Error,
      });
    }
  }, [profileError, isAuthenticated, actor]);

  // Reset actor init start time when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      setActorInitStartTime(Date.now());
    }
  }, [isAuthenticated]);

  const handleRetry = () => {
    setStartupError(null);
    setStartupPhase('initializing-identity');
    setActorInitStartTime(Date.now());
    
    // Clear all caches and reload
    queryClient.clear();
    window.location.reload();
  };

  // Show splash screen
  if (showSplash) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <SplashScreen />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show onboarding for first-time users
  if (showOnboarding && !isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <OnboardingPage onComplete={() => setShowOnboarding(false)} />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show startup screen during initialization or if there's an error
  if (startupPhase !== 'ready' || startupError) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <StartupScreen
          phase={startupPhase}
          error={startupError ? { message: startupError.message, onRetry: handleRetry } : undefined}
        />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show auth gate if not authenticated or needs profile setup
  const needsProfileSetup = isAuthenticated && profileFetched && userProfile === null;
  if (!isAuthenticated || needsProfileSetup) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthGate />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show main app
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
