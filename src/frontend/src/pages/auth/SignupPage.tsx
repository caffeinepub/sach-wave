import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

export default function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  const { login, loginStatus, loginError } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-gradient p-4">
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url(/assets/generated/wave-pattern.dim_1600x900.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass-card p-8 border-white/10 shadow-glass">
          <div className="text-center mb-8">
            <img 
              src="/assets/generated/sach-wave-logo.dim_512x512.png" 
              alt="Sach Wave" 
              className="h-20 w-20 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
              Join Sach Wave
            </h1>
            <p className="text-muted-foreground mt-2">
              Create your account to get started
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 glass-surface border-destructive/30 rounded-xl text-destructive text-sm">
              {loginError.message}
            </div>
          )}

          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet hover:from-neon-cyan hover:to-neon-blue shadow-neon-blue press-feedback"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign up with Internet Identity'
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-neon-cyan font-semibold hover:text-neon-violet transition-colors"
              >
                Login
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          A private social network for students
        </p>
      </div>
    </div>
  );
}
