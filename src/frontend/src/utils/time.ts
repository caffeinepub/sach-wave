export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatLastSeen(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 1000 / 60);

  if (diffMins < 5) return 'Online';
  if (diffMins < 60) return `Active ${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Active ${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `Active ${diffDays}d ago`;
}

export function isOnline(timestamp: bigint): boolean {
  const date = new Date(Number(timestamp) / 1000000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 1000 / 60);
  return diffMins < 5;
}
