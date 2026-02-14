import { useState } from 'react';
import { Home, BookOpen, MessageCircle, Bell, User } from 'lucide-react';

interface NavIconProps {
  src: string;
  alt: string;
  className?: string;
}

const fallbackIcons: Record<string, React.ComponentType<any>> = {
  'nav-icon-home': Home,
  'nav-icon-stories': BookOpen,
  'nav-icon-chat': MessageCircle,
  'nav-icon-notifications': Bell,
  'nav-icon-profile': User,
};

export default function NavIcon({ src, alt, className = '' }: NavIconProps) {
  const [hasError, setHasError] = useState(false);

  // Extract icon name from path to determine fallback
  const iconName = src.split('/').pop()?.split('.')[0] || '';
  const FallbackIcon = fallbackIcons[iconName] || Home;

  if (hasError) {
    return <FallbackIcon className={className} strokeWidth={1.5} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
