import { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfileSetupPage() {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [year, setYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { actor } = useActor();
  const queryClient = useQueryClient();

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
      toast.error('Backend not available');
      return;
    }

    setIsSubmitting(true);
    try {
      await actor.signup(name.trim(), className.trim(), BigInt(yearNum));
      toast.success('Profile created successfully!');
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Tell us a bit about yourself
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-2 h-12 rounded-xl bg-white/5 border-white/10 focus:border-neon-cyan/50"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="className" className="text-sm font-medium">Class</Label>
              <Input
                id="className"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., 10th Grade A"
                className="mt-2 h-12 rounded-xl bg-white/5 border-white/10 focus:border-neon-cyan/50"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="year" className="text-sm font-medium">Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 2024"
                className="mt-2 h-12 rounded-xl bg-white/5 border-white/10 focus:border-neon-cyan/50"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet hover:from-neon-cyan hover:to-neon-blue shadow-neon-blue press-feedback"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating profile...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
