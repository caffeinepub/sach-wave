import { ReactNode, useEffect } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Menu, Search as SearchIcon, Settings } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetUnreadNotificationCount, useUpdateLastSeen } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NavIcon from '../components/system/NavIcon';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: unreadCount } = useGetUnreadNotificationCount();
  const updateLastSeen = useUpdateLastSeen();

  const currentPath = routerState.location.pathname;

  // Update last seen periodically
  useEffect(() => {
    if (!identity) return;

    const interval = setInterval(() => {
      updateLastSeen.mutate();
    }, 60000);

    return () => clearInterval(interval);
  }, [identity]);

  const navItems = [
    { icon: '/assets/generated/nav-icon-home.dim_128x128.png', label: 'Home', path: '/' },
    { icon: '/assets/generated/nav-icon-stories.dim_128x128.png', label: 'Stories', path: '/stories' },
    { icon: '/assets/generated/nav-icon-chat.dim_128x128.png', label: 'Chat', path: '/messages' },
    { icon: '/assets/generated/nav-icon-notifications.dim_128x128.png', label: 'Notifications', path: '/notifications', badge: unreadCount ? Number(unreadCount) : 0 },
    { icon: '/assets/generated/nav-icon-profile.dim_128x128.png', label: 'Profile', path: `/profile/${identity?.getPrincipal().toString()}` },
  ];

  const NavContent = () => (
    <>
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all press-feedback ${
              isActive
                ? 'nav-active text-white'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            <NavIcon 
              src={item.icon} 
              alt={item.label} 
              className={`h-5 w-5 transition-all ${isActive ? 'brightness-0 invert' : 'opacity-60'}`} 
            />
            <span className="font-medium">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <Badge className="ml-auto bg-destructive text-white border-0 shadow-glow-purple text-xs px-2">
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}

      <Link
        to="/search"
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all press-feedback ${
          currentPath === '/search'
            ? 'nav-active text-white'
            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
        }`}
      >
        <SearchIcon className={`h-5 w-5 ${currentPath === '/search' ? '' : 'action-icon'}`} strokeWidth={1.5} />
        <span className="font-medium">Search</span>
      </Link>

      <Link
        to="/settings"
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all press-feedback ${
          currentPath === '/settings'
            ? 'nav-active text-white'
            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
        }`}
      >
        <Settings className={`h-5 w-5 ${currentPath === '/settings' ? '' : 'action-icon'}`} strokeWidth={1.5} />
        <span className="font-medium">Settings</span>
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-40">
        <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto glass-nav border-r border-white/10">
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <img src="/assets/generated/sach-wave-logo-v2.dim_512x512.png" alt="Sach Wave" className="h-10 w-10" />
            <span className="ml-3 text-xl font-bold text-gradient-premium">
              Sach Wave
            </span>
          </div>

          <div className="flex-1 flex flex-col px-4 space-y-2">
            <NavContent />
          </div>

          {userProfile && (
            <div className="flex-shrink-0 flex border-t border-white/10 p-4 mt-4">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-10 w-10 avatar-ring-glow">
                  <AvatarImage src={userProfile.profilePicture?.getDirectURL()} />
                  <AvatarFallback className="bg-accent-gradient text-white font-semibold">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{userProfile.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile.classInfo.className}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 glass-nav px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden press-feedback">
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 glass-surface-elevated border-white/10">
            <div className="flex flex-col h-full pt-6 pb-4">
              <div className="flex items-center flex-shrink-0 px-6 mb-8">
                <img src="/assets/generated/sach-wave-logo-v2.dim_512x512.png" alt="Sach Wave" className="h-10 w-10" />
                <span className="ml-3 text-xl font-bold text-gradient-premium">
                  Sach Wave
                </span>
              </div>

              <div className="flex-1 flex flex-col px-4 space-y-2 overflow-y-auto scrollbar-premium">
                <NavContent />
              </div>

              {userProfile && (
                <div className="flex-shrink-0 flex border-t border-white/10 p-4 mt-4">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-10 w-10 avatar-ring-glow">
                      <AvatarImage src={userProfile.profilePicture?.getDirectURL()} />
                      <AvatarFallback className="bg-accent-gradient text-white font-semibold">
                        {userProfile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{userProfile.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{userProfile.classInfo.className}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <img src="/assets/generated/sach-wave-logo-v2.dim_512x512.png" alt="Sach Wave" className="h-8 w-8" />
          <span className="text-lg font-bold text-gradient-premium">Sach Wave</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Floating */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe">
        <div className="mx-4 mb-4 floating-nav rounded-3xl px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all press-feedback ${
                    isActive ? 'nav-active' : ''
                  }`}
                >
                  <NavIcon 
                    src={item.icon} 
                    alt={item.label} 
                    className={`h-6 w-6 transition-all ${isActive ? 'brightness-0 invert' : 'opacity-60'}`} 
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center shadow-glow-purple">
                      <span className="text-[10px] font-bold text-white">{item.badge}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
