import { cn } from '@/lib/utils';
import { Crown, Shield } from 'lucide-react';

interface RoleBadgeProps {
  role: 'admin' | 'owner';
  className?: string;
}

export default function RoleBadge({ role, className }: RoleBadgeProps) {
  if (role === 'owner') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold',
          'bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20',
          'text-amber-300 border border-amber-400/50',
          'animate-pulse-glow shadow-glow-gold',
          className
        )}
      >
        <Crown className="h-3.5 w-3.5" strokeWidth={2.5} />
        Owner
      </span>
    );
  }

  if (role === 'admin') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold',
          'bg-gradient-to-r from-accent-blue/20 to-accent-purple/20',
          'text-accent-cyan border border-accent-cyan/50',
          'shadow-glow-blue',
          className
        )}
      >
        <Shield className="h-3.5 w-3.5" strokeWidth={2.5} />
        Admin
      </span>
    );
  }

  return null;
}
