import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreatePostFabProps {
  onClick: () => void;
}

export default function CreatePostFab({ onClick }: CreatePostFabProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 h-16 w-16 rounded-full bg-accent-gradient hover:shadow-glow-blue shadow-premium-lg press-feedback z-30 transition-all hover:scale-110"
      size="icon"
    >
      <Plus className="h-8 w-8 text-white" strokeWidth={2.5} />
    </Button>
  );
}
