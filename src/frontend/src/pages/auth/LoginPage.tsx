import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoginPageProps {
  onSwitchToSignup: () => void;
}

export default function LoginPage({ onSwitchToSignup }: LoginPageProps) {
  const navigate = useNavigate();
  const { login, loginStatus } = useInternetIdentity();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await login();
      navigate({ to: '/' });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
    }
  };

  const isLoading = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-gradient px-4">
      <div className="w-full max-w-md">
        <div className="glass-surface-elevated rounded-3xl p-8 shadow-premium-lg animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-2xl bg-accent-gradient opacity-40 animate-pulse-glow" />
              <img
                src="/assets/generated/sach-wave-logo-v2.dim_512x512.png"
                alt="Sach Wave"
                className="relative h-24 w-24 drop-shadow-2xl"
              />
            </div>
            <h1 className="text-3xl font-bold text-gradient-premium mb-2">
              Welcome to Sach Wave
            </h1>
            <p className="text-muted-foreground text-center">
              Connect with your classmates and share your moments
            </p>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full rounded-2xl bg-accent-gradient hover:shadow-glow-blue transition-all press-feedback py-6 text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              'Login with Internet Identity'
            )}
          </Button>

          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Switch to Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-accent-cyan font-semibold hover:text-accent-purple transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Secure authentication powered by Internet Identity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
