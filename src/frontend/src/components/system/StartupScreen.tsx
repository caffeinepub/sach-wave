import { Loader2, AlertCircle, Wifi, Database, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { StartupPhase } from '../../utils/startup';

interface StartupScreenProps {
  phase: StartupPhase;
  error?: {
    message: string;
    onRetry: () => void;
  };
}

const phaseLabels: Record<StartupPhase, string> = {
  'initializing-identity': 'Initializing identity…',
  'connecting-backend': 'Connecting to backend…',
  'loading-profile': 'Loading profile…',
  'ready': 'Ready',
  'error': 'Error',
};

const phaseIcons: Record<StartupPhase, React.ReactNode> = {
  'initializing-identity': <User className="h-6 w-6 text-neon-cyan" />,
  'connecting-backend': <Database className="h-6 w-6 text-neon-blue" />,
  'loading-profile': <User className="h-6 w-6 text-neon-violet" />,
  'ready': null,
  'error': null,
};

export default function StartupScreen({ phase, error }: StartupScreenProps) {
  if (error) {
    // Determine error type for better icon
    const isConnectionError = error.message.toLowerCase().includes('connect') || 
                              error.message.toLowerCase().includes('network') ||
                              error.message.toLowerCase().includes('backend');
    
    return (
      <div className="flex h-screen items-center justify-center bg-dark-gradient p-4">
        <Card className="glass-surface border-white/10 p-8 max-w-md w-full text-center animate-fade-in">
          {isConnectionError ? (
            <Wifi className="h-16 w-16 mx-auto mb-4 text-destructive glow-red" />
          ) : (
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive glow-red" />
          )}
          <h2 className="text-xl font-semibold mb-2 text-foreground">Unable to Start</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{error.message}</p>
          <Button
            onClick={error.onRetry}
            className="bg-gradient-to-r from-neon-blue to-neon-violet hover:opacity-90 press-feedback w-full"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-dark-gradient">
      <div className="text-center animate-fade-in">
        <div className="relative mb-6 mx-auto w-16 h-16">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-neon-cyan border-t-transparent glow-cyan"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {phaseIcons[phase]}
          </div>
        </div>
        <p className="text-foreground/80 text-lg font-medium mb-2">Loading Sach Wave...</p>
        <p className="text-muted-foreground text-sm">{phaseLabels[phase]}</p>
      </div>
    </div>
  );
}
