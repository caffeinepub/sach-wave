import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { usePatchedActor } from '../../hooks/usePatchedActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [year, setYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !className.trim() || !year.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      toast.error('Please enter a valid year (2020-2030)');
      return;
    }

    if (!actor) {
      toast.error('Backend not available. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      await actor.signup(name.trim(), className.trim(), BigInt(yearNum));
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile created successfully!');
      navigate({ to: '/' });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-start via-background-mid to-background-end p-4">
      <div className="w-full max-w-md">
        <div className="glass-surface rounded-3xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan bg-clip-text text-transparent mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
              Tell us a bit about yourself to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input rounded-2xl border-white/10 focus:border-accent-cyan"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="className" className="text-foreground">
                Class Name
              </Label>
              <Input
                id="className"
                type="text"
                placeholder="e.g., Computer Science"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="glass-input rounded-2xl border-white/10 focus:border-accent-cyan"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-foreground">
                Year
              </Label>
              <Input
                id="year"
                type="number"
                placeholder="e.g., 2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2020"
                max="2030"
                className="glass-input rounded-2xl border-white/10 focus:border-accent-cyan"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan hover:opacity-90 text-white font-semibold py-6 rounded-2xl transition-all duration-300 shadow-glow-blue"
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
