import { Loader2, AlertCircle } from 'lucide-react';
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

export default function StartupScreen({ phase, error }: StartupScreenProps) {
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-gradient p-4">
        <Card className="glass-surface border-white/10 p-8 max-w-md w-full text-center animate-fade-in">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive glow-red" />
          <h2 className="text-xl font-semibold mb-2 text-foreground">Unable to Start</h2>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <Button
            onClick={error.onRetry}
            className="bg-gradient-to-r from-neon-blue to-neon-violet hover:opacity-90 press-feedback"
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
        <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-neon-cyan border-t-transparent mx-auto glow-cyan"></div>
        <p className="text-foreground/80 text-lg font-medium mb-2">Loading Sach Wave...</p>
        <p className="text-muted-foreground text-sm">{phaseLabels[phase]}</p>
      </div>
    </div>
  );
}
