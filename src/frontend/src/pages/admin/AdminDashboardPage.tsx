import { useState } from 'react';
import { useGetAllUsers, useGetActivityStats, useBanUser, useUnbanUser, useDeletePost, useCreateAnnouncement, useGetAllPosts } from '../../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Shield, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '../../components/system/GlassSurface';
import RoleBadge from '../../components/system/RoleBadge';
import { UserRole } from '../../backend';

export default function AdminDashboardPage() {
  const { data: users, isLoading: usersLoading } = useGetAllUsers();
  const { data: posts, isLoading: postsLoading } = useGetAllPosts();
  const { data: stats } = useGetActivityStats();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const deletePost = useDeletePost();
  const createAnnouncement = useCreateAnnouncement();

  const [announcementContent, setAnnouncementContent] = useState('');

  const handleBanUser = async (userId: string) => {
    try {
      await banUser.mutateAsync(userId);
      toast.success('User banned successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser.mutateAsync(userId);
      toast.success('User unbanned successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to unban user');
    }
  };

  const handleDeletePost = async (postId: bigint) => {
    try {
      await deletePost.mutateAsync(postId);
      toast.success('Post deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementContent.trim()) {
      toast.error('Please enter announcement content');
      return;
    }

    try {
      await createAnnouncement.mutateAsync(announcementContent.trim());
      toast.success('Announcement created!');
      setAnnouncementContent('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create announcement');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <div className="mb-8 animate-slide-down">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-amber-400" strokeWidth={2} />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground">Manage users, posts, and announcements</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4 border-neon-blue/30">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-neon-blue/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-neon-cyan" strokeWidth={2} />
              </div>
              <div>
                <p className="text-2xl font-bold">{Number(stats.totalUsers)}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-neon-violet/30">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-neon-violet/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-neon-violet" strokeWidth={2} />
              </div>
              <div>
                <p className="text-2xl font-bold">{Number(stats.totalPosts)}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-neon-cyan/30">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-neon-cyan" strokeWidth={2} />
              </div>
              <div>
                <p className="text-2xl font-bold">{Number(stats.totalMessages)}</p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-400" strokeWidth={2} />
              </div>
              <div>
                <p className="text-2xl font-bold">{Number(stats.activeUsers)}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="glass-surface border-white/10 p-1">
          <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-blue data-[state=active]:to-neon-violet data-[state=active]:text-white">
            Users
          </TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-blue data-[state=active]:to-neon-violet data-[state=active]:text-white">
            Posts
          </TabsTrigger>
          <TabsTrigger value="announcements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-blue data-[state=active]:to-neon-violet data-[state=active]:text-white">
            Announcements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            {usersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>User</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id.toString()} className="border-white/10">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 ring-2 ring-white/10">
                              <AvatarImage src={user.profilePicture?.getDirectURL()} />
                              <AvatarFallback className="bg-gradient-to-br from-neon-blue to-neon-violet text-white text-xs">
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.classInfo.className}</TableCell>
                        <TableCell>
                          {user.role === UserRole.owner && <RoleBadge role="owner" />}
                          {user.role === UserRole.admin && <RoleBadge role="admin" />}
                        </TableCell>
                        <TableCell>
                          {user.role === UserRole.banned ? (
                            <span className="text-destructive font-medium">Banned</span>
                          ) : (
                            <span className="text-green-400 font-medium">Active</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.role === UserRole.banned ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(user.id.toString())}
                              disabled={unbanUser.isPending}
                              className="rounded-lg border-white/20 hover:bg-white/5 press-feedback"
                            >
                              Unban
                            </Button>
                          ) : user.role === UserRole.owner ? (
                            <span className="text-xs text-muted-foreground">Owner</span>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBanUser(user.id.toString())}
                              disabled={banUser.isPending}
                              className="rounded-lg press-feedback"
                            >
                              Ban
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="posts">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Post Moderation</h2>
            {postsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
              </div>
            ) : (
              <div className="space-y-4">
                {posts?.map((post) => (
                  <div key={post.id.toString()} className="glass-surface p-4 rounded-xl border-white/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground mb-2">
                          Post ID: {post.id.toString()}
                        </p>
                        <p className="mb-2 leading-relaxed">{post.content}</p>
                        {post.media && (
                          <img
                            src={post.media.getDirectURL()}
                            alt="Post"
                            className="w-32 h-32 object-cover rounded-lg border border-white/10"
                          />
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletePost.isPending}
                        className="rounded-lg press-feedback"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="announcements">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">Create Announcement</h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <Textarea
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                placeholder="Enter announcement content..."
                className="min-h-[120px] rounded-xl bg-white/5 border-white/10 focus:border-neon-cyan/50"
                disabled={createAnnouncement.isPending}
              />
              <Button
                type="submit"
                disabled={createAnnouncement.isPending}
                className="rounded-xl bg-gradient-to-r from-neon-blue to-neon-violet hover:from-neon-cyan hover:to-neon-blue shadow-neon-blue press-feedback"
              >
                {createAnnouncement.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Announcement'
                )}
              </Button>
            </form>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
