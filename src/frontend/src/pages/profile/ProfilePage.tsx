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
import { ErrorState } from '../../components/system/PageState';

export default function ProfilePage() {
  const { userId } = useParams({ from: '/authenticated/profile/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { 
    data: profile, 
    isLoading: profileLoading, 
    isError: profileError,
    error: profileErrorObj,
    refetch: refetchProfile 
  } = useGetUserProfile(userId);
  const { 
    data: posts, 
    isLoading: postsLoading,
    refetch: refetchPosts 
  } = useGetPostsByUser(userId);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const isOwnProfile = identity?.getPrincipal().toString() === userId;

  const handleMessage = () => {
    navigate({ to: `/messages/${userId}` });
  };

  const handleRetry = async () => {
    await refetchProfile();
    await refetchPosts();
  };

  // Show loading state
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

  // Show error state with retry button
  if (profileError) {
    const errorMessage = profileErrorObj 
      ? String(profileErrorObj).includes('connection') || String(profileErrorObj).includes('network')
        ? 'Unable to connect to the server. Please check your connection and try again.'
        : 'Failed to load profile. Please try again.'
      : 'Failed to load profile. Please try again.';

    return (
      <div className="max-w-4xl mx-auto">
        <ErrorState message={errorMessage} onRetry={handleRetry} />
      </div>
    );
  }

  // Show not found state (only when profile is genuinely null/missing)
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

            {/* Name with Badge */}
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-bold gradient-text">{profile.name}</h1>
              {shouldShowBadge && (
                <RoleBadge role={profile.role === UserRole.owner ? 'owner' : 'admin'} />
              )}
            </div>

            {/* Class Info */}
            <p className="text-muted-foreground mb-1">
              {profile.classInfo.className} • Class of {profile.classInfo.year.toString()}
            </p>

            {/* Bio */}
            {profile.bio && (
              <p className="text-foreground/80 mt-4 max-w-md">{profile.bio}</p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              {isOwnProfile ? (
                <Button
                  onClick={() => setShowEditProfile(true)}
                  className="bg-accent-gradient hover:opacity-90 text-white shadow-glow-blue rounded-2xl px-6"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  onClick={handleMessage}
                  className="bg-accent-gradient hover:opacity-90 text-white shadow-glow-blue rounded-2xl px-6"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 gradient-text">Posts</h2>
          {postsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl bg-white/10" />
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {posts.map((post) => (
                <div
                  key={post.id.toString()}
                  className="aspect-square glass-surface rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-premium"
                >
                  {post.media ? (
                    <MediaPost 
                      mediaUrl={post.media.getDirectURL()} 
                      isVideo={false}
                      alt={`Post by ${profile.name}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 bg-accent-gradient/10">
                      <p className="text-sm text-center line-clamp-6 text-foreground/80">
                        {post.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-surface-elevated rounded-3xl p-8 text-center shadow-premium">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
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
