import { useState, FormEvent, KeyboardEvent } from 'react';
import { GlassCard } from '../../components/system/GlassSurface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { validateAccessCode, unlockApp } from '../../utils/accessCodeGate';

interface AccessCodeGatePageProps {
  onUnlock: () => void;
}

export default function AccessCodeGatePage({ onUnlock }: AccessCodeGatePageProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (validateAccessCode(code)) {
      unlockApp();
      onUnlock();
    } else {
      setError('Incorrect access code. Please try again.');
      setCode('');
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0A0F1C] via-[#020617] to-[#0A0F1C]">
      <div className="w-full max-w-md">
        <GlassCard className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-neon-blue to-neon-violet flex items-center justify-center mb-4 shadow-glow-blue">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent mb-2">
              Access Required
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              Enter the access code to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="access-code" className="text-sm font-medium">
                Access Code
              </Label>
              <Input
                id="access-code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter code"
                className="rounded-2xl border-white/20 bg-white/5 focus:border-accent-cyan focus:ring-accent-cyan"
                disabled={isSubmitting}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-400 mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !code}
              className="w-full rounded-2xl bg-gradient-to-r from-neon-blue to-neon-violet hover:shadow-glow-blue transition-all"
            >
              {isSubmitting ? 'Unlocking...' : 'Unlock'}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
