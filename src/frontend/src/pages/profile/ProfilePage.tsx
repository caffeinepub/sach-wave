import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetUserProfile, useGetPostsByUser } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Edit } from 'lucide-react';
import EditProfileDialog from '../../components/profile/EditProfileDialog';
import MediaPost from '../../components/posts/MediaPost';
import RoleBadge from '../../components/system/RoleBadge';
import { UserRole } from '../../backend';

export default function ProfilePage() {
  const { userId } = useParams({ from: '/authenticated/profile/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile(userId);
  const { data: posts, isLoading: postsLoading } = useGetPostsByUser(userId);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const isOwnProfile = identity?.getPrincipal().toString() === userId;

  const handleMessage = () => {
    navigate({ to: `/messages/${userId}` });
  };

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-surface-elevated rounded-3xl p-8 shadow-premium-lg">
          <div className="flex flex-col items-center text-center">
            <Skeleton className="h-40 w-40 rounded-full bg-white/10 mb-6 animate-shimmer" />
            <Skeleton className="h-8 w-48 bg-white/10 mb-2" />
            <Skeleton className="h-4 w-32 bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-surface-elevated rounded-3xl p-8 text-center shadow-premium">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const shouldShowBadge = profile.role === UserRole.owner || profile.role === UserRole.admin;

  return (
    <>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Profile Header - Premium Glass Panel */}
        <div className="glass-surface-elevated rounded-3xl p-8 mb-6 shadow-premium-lg gradient-border">
          <div className="flex flex-col items-center text-center">
            {/* Large Avatar with Glowing Ring */}
            <div className="relative mb-6 animate-scale-in">
              <div className="absolute inset-0 rounded-full bg-accent-gradient opacity-30 blur-xl animate-ring-pulse" />
              <Avatar className="h-40 w-40 relative border-4 border-transparent shadow-glow-blue">
                <AvatarImage src={profile.profilePicture?.getDirectURL()} />
                <AvatarFallback className="bg-accent-gradient text-white text-6xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name and Role Badge */}
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{profile.name}</h1>
              {shouldShowBadge && (
                <RoleBadge role={profile.role === UserRole.owner ? 'owner' : 'admin'} />
              )}
            </div>
            
            <p className="text-muted-foreground mb-4 text-lg">
              {profile.classInfo.className} • {Number(profile.classInfo.year)}
            </p>

            {profile.bio && (
              <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                <Button
                  onClick={() => setShowEditProfile(true)}
                  className="rounded-2xl bg-accent-gradient hover:shadow-glow-blue transition-all press-feedback px-6 py-6 text-base font-semibold"
                >
                  <Edit className="h-5 w-5 mr-2" strokeWidth={2} />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  onClick={handleMessage}
                  className="rounded-2xl bg-accent-gradient hover:shadow-glow-blue transition-all press-feedback px-6 py-6 text-base font-semibold"
                >
                  <MessageCircle className="h-5 w-5 mr-2" strokeWidth={2} />
                  Message
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Posts</h2>
          {postsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl bg-white/10 animate-shimmer" />
              ))}
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="glass-surface-elevated rounded-3xl p-8 text-center shadow-premium">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post.id.toString()} className="aspect-square rounded-2xl overflow-hidden glass-surface border border-white/10 hover:shadow-glow-blue transition-all press-feedback">
                  {post.media ? (
                    <MediaPost
                      mediaUrl={post.media.getDirectURL()}
                      isVideo={post.media.getDirectURL().includes('video')}
                      alt="Post"
                    />
                  ) : (
                    <div className="w-full h-full bg-accent-gradient flex items-center justify-center p-4">
                      <p className="text-white text-center text-sm line-clamp-4 font-medium">{post.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && profile && (
        <EditProfileDialog
          open={showEditProfile}
          onOpenChange={setShowEditProfile}
          currentProfile={profile}
        />
      )}
    </>
  );
}
