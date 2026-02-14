import { useState } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import ProfileSetupPage from './ProfileSetupPage';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function AuthGate() {
  const [showSignup, setShowSignup] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: userProfile, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  
  // Only show profile setup if authenticated and profile fetch is complete and profile is null
  const needsProfileSetup = isAuthenticated && isFetched && userProfile === null;

  if (needsProfileSetup) {
    return <ProfileSetupPage />;
  }

  if (showSignup) {
    return <SignupPage onSwitchToLogin={() => setShowSignup(false)} />;
  }

  return <LoginPage onSwitchToSignup={() => setShowSignup(true)} />;
}
