import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassSurfaceProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'nav';
}

export function GlassSurface({ children, className, variant = 'default' }: GlassSurfaceProps) {
  const baseClasses = 'bg-card/40 backdrop-blur-xl border border-white/10';
  
  const variantClasses = {
    default: baseClasses,
    card: `${baseClasses} rounded-2xl shadow-glass`,
    nav: 'bg-card/30 backdrop-blur-2xl border-white/10'
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      {children}
    </div>
  );
}

export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return <GlassSurface variant="card" className={className}>{children}</GlassSurface>;
}
