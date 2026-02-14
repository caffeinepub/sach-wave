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
import AccessCodeGatePage from './pages/access/AccessCodeGatePage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type { StartupPhase } from './utils/startup';
import { logStartupPhase, logStartupError, classifyStartupError } from './utils/startup';
import { hasCompletedOnboarding } from './utils/onboarding';
import { isAppUnlocked } from './utils/accessCodeGate';
import { registerServiceWorker } from './utils/pwa';

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
const SPLASH_DURATION = 2000; // 2 seconds

export default function App() {
  const queryClient = useQueryClient();
  const { identity, isInitializing, loginStatus, isLoginError } = useInternetIdentity();
  const { actor, isFetching: actorFetching, isError: actorError, error: actorErrorDetails, refetch: refetchActor } = usePatchedActor();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched, error: profileError } = useGetCallerUserProfile();

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [startupPhase, setStartupPhase] = useState<StartupPhase>('initializing-identity');
  const [startupError, setStartupError] = useState<{ message: string; phase: StartupPhase } | null>(null);
  const [actorInitStartTime, setActorInitStartTime] = useState<number>(Date.now());

  const isAuthenticated = !!identity;

  // Register service worker for PWA
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Check access code on mount
  useEffect(() => {
    setIsUnlocked(isAppUnlocked());
  }, []);

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

  // Track startup phases and errors
  useEffect(() => {
    if (isInitializing) {
      setStartupPhase('initializing-identity');
      logStartupPhase('initializing-identity');
    } else if (isLoginError) {
      const phase = 'initializing-identity';
      setStartupPhase('error');
      setStartupError({
        message: 'Failed to initialize authentication. Please check your connection and try again.',
        phase,
      });
      logStartupError({
        phase,
        message: 'Internet Identity initialization failed',
      });
    } else if (!isAuthenticated && !isInitializing) {
      // Not authenticated and not initializing = ready to show auth gate
      setStartupPhase('ready');
      logStartupPhase('ready', 'Ready for authentication');
    } else if (isAuthenticated && actorError) {
      // Actor initialization failed
      const phase = 'connecting-backend';
      const errorClassification = classifyStartupError(actorErrorDetails, phase);
      setStartupPhase('error');
      setStartupError({
        message: errorClassification.userMessage,
        phase,
      });
      logStartupError({
        phase,
        message: errorClassification.devMessage,
        error: actorErrorDetails as Error,
      });
    } else if (isAuthenticated && !actor && !actorError) {
      setStartupPhase('connecting-backend');
      logStartupPhase('connecting-backend');
    } else if (isAuthenticated && actor && profileLoading && !profileFetched) {
      setStartupPhase('loading-profile');
      logStartupPhase('loading-profile');
    } else if (isAuthenticated && actor && profileError) {
      // Profile loading failed (only real errors, not missing profiles)
      const errorMessage = String(profileError);
      const isAuthError = errorMessage.includes('Unauthorized') || errorMessage.includes('permission');
      
      if (!isAuthError) {
        const phase = 'loading-profile';
        const errorClassification = classifyStartupError(profileError, phase);
        setStartupPhase('error');
        setStartupError({
          message: errorClassification.userMessage,
          phase,
        });
        logStartupError({
          phase,
          message: errorClassification.devMessage,
          error: profileError as Error,
        });
      }
    } else if (isAuthenticated && actor && profileFetched) {
      setStartupPhase('ready');
      logStartupPhase('ready', 'Startup complete');
    }
  }, [isInitializing, isLoginError, isAuthenticated, actor, actorError, actorErrorDetails, profileLoading, profileFetched, profileError]);

  // Watchdog for actor initialization timeout
  useEffect(() => {
    if (isAuthenticated && !actor && !actorError && startupPhase === 'connecting-backend') {
      const elapsed = Date.now() - actorInitStartTime;
      if (elapsed > ACTOR_INIT_TIMEOUT) {
        const phase = 'connecting-backend';
        setStartupPhase('error');
        setStartupError({
          message: 'Backend connection timed out. Please check your network and try again.',
          phase,
        });
        logStartupError({
          phase,
          message: 'Actor initialization timeout',
        });
      }
    }
  }, [isAuthenticated, actor, actorError, startupPhase, actorInitStartTime]);

  // Reset actor init start time when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      setActorInitStartTime(Date.now());
    }
  }, [isAuthenticated]);

  const handleRetry = async () => {
    // Clear previous error state
    setStartupError(null);
    setStartupPhase('initializing-identity');
    setActorInitStartTime(Date.now());
    
    // Explicitly refetch actor and profile
    try {
      await refetchActor();
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  // Show access code gate first
  if (!isUnlocked) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AccessCodeGatePage onUnlock={handleUnlock} />
        <Toaster />
      </ThemeProvider>
    );
  }

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
  // Don't show startup screen if not authenticated and not initializing
  const shouldShowStartup = startupError || (startupPhase !== 'ready' && (isInitializing || isAuthenticated));
  if (shouldShowStartup) {
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
