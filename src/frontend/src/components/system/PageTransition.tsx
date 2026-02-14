import { ReactNode } from 'react';
import { useRouterState } from '@tanstack/react-router';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const routerState = useRouterState();
  const key = routerState.location.pathname;

  return (
    <div key={key} className="animate-fade-in">
      {children}
    </div>
  );
}
