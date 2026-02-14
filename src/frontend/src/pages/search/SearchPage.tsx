import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSearchUsers } from '../../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const { data: users, isLoading } = useSearchUsers(debouncedTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-4 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
      </Card>

      {isLoading && debouncedTerm && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && debouncedTerm && users && users.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No students found matching "{debouncedTerm}"</p>
        </Card>
      )}

      {!isLoading && users && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id.toString()} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <Avatar
                  className="h-12 w-12 cursor-pointer"
                  onClick={() => navigate({ to: `/profile/${user.id.toString()}` })}
                >
                  <AvatarImage src={user.profilePicture?.getDirectURL() || '/assets/generated/default-avatar.dim_256x256.png'} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate({ to: `/profile/${user.id.toString()}` })}
                >
                  <p className="font-semibold truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.classInfo.className} • Year {Number(user.classInfo.year)}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => navigate({ to: `/messages/${user.id.toString()}` })}
                  className="rounded-xl"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!debouncedTerm && (
        <Card className="p-8 text-center">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Search for students by name</p>
        </Card>
      )}
    </div>
  );
}
