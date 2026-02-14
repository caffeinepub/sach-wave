import { useState } from 'react';
import { useGetCallerUserProfile, useGetAllUsers, useAssignAdminRole, useRemoveAdminRole } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../../components/system/GlassSurface';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Moon, Sun, User, Shield, LogOut, Info, Heart, Crown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import RoleBadge from '../../components/system/RoleBadge';
import { UserRole } from '../../backend';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: allUsers } = useGetAllUsers();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const assignAdmin = useAssignAdminRole();
  const removeAdmin = useRemoveAdminRole();

  const isOwner = userProfile?.role === UserRole.owner;
  const isAdmin = userProfile?.role === UserRole.admin;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleEditProfile = () => {
    if (identity) {
      navigate({ to: `/profile/${identity.getPrincipal().toString()}` });
    }
  };

  const handleAdminPanel = () => {
    navigate({ to: '/admin' });
  };

  const handleToggleAdmin = async (userId: string, currentRole: UserRole) => {
    try {
      if (currentRole === UserRole.admin) {
        await removeAdmin.mutateAsync(userId);
        toast.success('Admin role removed');
      } else {
        await assignAdmin.mutateAsync(userId);
        toast.success('Admin role assigned');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
        Settings
      </h1>

      {/* Profile Section */}
      {userProfile && (
        <GlassCard className="p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 ring-2 ring-neon-cyan/30">
              <AvatarImage src={userProfile.profilePicture?.getDirectURL()} />
              <AvatarFallback className="bg-gradient-to-br from-neon-blue to-neon-violet text-white text-xl">
                {userProfile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{userProfile.name}</h2>
                {(userProfile.role === UserRole.owner || userProfile.role === UserRole.admin) && (
                  <RoleBadge role={userProfile.role === UserRole.owner ? 'owner' : 'admin'} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {userProfile.classInfo.className} • {Number(userProfile.classInfo.year)}
              </p>
            </div>
          </div>
          <Button
            onClick={handleEditProfile}
            variant="outline"
            className="w-full rounded-xl border-white/20 hover:bg-white/5"
          >
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </GlassCard>
      )}

      {/* Appearance */}
      <GlassCard className="p-6 mb-4">
        <h3 className="text-lg font-semibold mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 text-neon-cyan" />
            ) : (
              <Sun className="h-5 w-5 text-neon-cyan" />
            )}
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
            </div>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>
      </GlassCard>

      {/* Owner Control Panel */}
      {isOwner && allUsers && (
        <GlassCard className="p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-amber-300" />
            <h3 className="text-lg font-semibold">Owner Control Panel</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Manage admin roles for users
          </p>
          <Separator className="mb-4" />
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {allUsers
                .filter(u => u.role !== UserRole.banned && u.role !== UserRole.owner)
                .map((user) => (
                  <div key={user.id.toString()} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 ring-2 ring-white/10">
                        <AvatarImage src={user.profilePicture?.getDirectURL()} />
                        <AvatarFallback className="bg-gradient-to-br from-neon-blue to-neon-violet text-white text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{user.name}</p>
                          {user.role === UserRole.admin && (
                            <RoleBadge role="admin" className="scale-75" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.classInfo.className}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={user.role === UserRole.admin}
                      onCheckedChange={() => handleToggleAdmin(user.id.toString(), user.role)}
                      disabled={assignAdmin.isPending || removeAdmin.isPending}
                    />
                  </div>
                ))}
            </div>
          </ScrollArea>
        </GlassCard>
      )}

      {/* Admin Panel Access */}
      {(isAdmin || isOwner) && (
        <GlassCard className="p-6 mb-4">
          <Button
            onClick={handleAdminPanel}
            variant="outline"
            className="w-full rounded-xl border-white/20 hover:bg-white/5"
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin Dashboard
          </Button>
        </GlassCard>
      )}

      {/* App Info */}
      <GlassCard className="p-6 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Info className="h-5 w-5 text-neon-cyan" />
          <h3 className="text-lg font-semibold">About</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Sach Wave - A premium social media platform for your class
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Built with</span>
          <Heart className="h-4 w-4 text-red-400 fill-red-400" />
          <span>using</span>
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-cyan hover:text-neon-violet transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </GlassCard>

      {/* Logout */}
      <GlassCard className="p-6">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full rounded-xl"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </GlassCard>
    </div>
  );
}
