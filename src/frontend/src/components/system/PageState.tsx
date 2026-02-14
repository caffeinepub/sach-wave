import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <Card className="p-8 text-center">
      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
      <p className="text-destructive mb-4">{message || 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Retry
        </Button>
      )}
    </Card>
  );
}

export function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <Card className="p-8 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <p className="text-muted-foreground">{message}</p>
    </Card>
  );
}

export function CardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </Card>
  );
}
