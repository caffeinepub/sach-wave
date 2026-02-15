import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePatchedActor } from './usePatchedActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Post, Story, Message, Notification, UserProfile, Announcement } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = usePatchedActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      // Don't throw if actor isn't ready yet - just return early
      if (!actor || !identity) {
        return null;
      }
      
      try {
        const profile = await actor.getCallerUserProfile();
        // Missing profile is a valid state (null), not an error
        return profile;
      } catch (error: any) {
        const errorMessage = String(error);
        
        // Authorization errors are expected for new users - treat as null profile
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) {
          return null;
        }
        
        // For other errors, rethrow to trigger retry logic
        throw error;
      }
    },
    // Only enable when authenticated - anonymous users don't have profiles
    enabled: !!actor && !actorFetching && !!identity,
    // Retry transient failures with short delay
    retry: (failureCount, error) => {
      const errorMessage = String(error);
      
      // Don't retry authorization errors
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) {
        return false;
      }
      
      // Retry network/agent errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 3000),
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useGetUserProfile(userId: string) {
  const { actor, isFetching } = usePatchedActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      
      try {
        const profile = await actor.getUserProfile(Principal.fromText(userId));
        // null is a valid response (user not found or banned)
        return profile;
      } catch (error: any) {
        const errorMessage = String(error);
        
        // If user is banned or doesn't exist, backend returns null (not an error)
        // Only network/agent errors should be thrown
        if (errorMessage.includes('not found') || errorMessage.includes('Invalid principal')) {
          return null;
        }
        
        // Rethrow other errors for retry logic
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!userId,
    // Limit automatic retries - user can manually retry via UI
    retry: 1,
    retryDelay: 1000,
  });
}

export function useUpdateProfile() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

export function useUpdateLastSeen() {
  const { actor } = usePatchedActor();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !identity) return;
      await actor.updateLastSeen();
    },
  });
}

export function useSearchUsers(searchTerm: string) {
  const { actor, isFetching } = usePatchedActor();

  return useQuery<UserProfile[]>({
    queryKey: ['searchUsers', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchUsers(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

// Admin Check
export function useIsCallerAdmin() {
  const { actor, isFetching } = usePatchedActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Post Queries
export function useGetAllPosts() {
  const { actor, isFetching } = usePatchedActor();
  const { identity } = useInternetIdentity();

  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 30000,
  });
}

export function useGetPostsByUser(userId: string) {
  const { actor, isFetching } = usePatchedActor();

  return useQuery<Post[]>({
    queryKey: ['posts', 'user', userId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPostsByUser(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useCreatePost() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, media }: { content: string; media?: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(content, media || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useLikePost() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likePost(postId);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData<Post[]>(['posts']);

      if (previousPosts) {
        queryClient.setQueryData<Post[]>(['posts'], (old) =>
          old?.map((post) =>
            post.id === postId
              ? { ...post, likes: post.likes + BigInt(1) }
              : post
          )
        );
      }

      return { previousPosts };
    },
    onError: (err, postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useCommentOnPost() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.commentOnPost(postId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      console.error('Delete post error:', error);
    },
  });
}

// Story Queries
export function useGetActiveStories() {
  const { actor, isFetching } = usePatchedActor();
  const { identity } = useInternetIdentity();

  return useQuery<Story[]>({
    queryKey: ['stories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveStories();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 60000,
  });
}

export function useCreateStory() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, image }: { content: string; image?: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStory(content, image || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

// Message Queries
export function useGetConversations() {
  const { actor, isFetching } = usePatchedActor();
  const { identity } = useInternetIdentity();

  return useQuery<[Principal, Message][]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversations();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 10000,
  });
}

export function useGetConversation(otherUserId: string) {
  const { actor, isFetching } = usePatchedActor();
  const { identity } = useInternetIdentity();

  return useQuery<Message[]>({
    queryKey: ['conversation', otherUserId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversation(Principal.fromText(otherUserId));
    },
    enabled: !!actor && !isFetching && !!identity && !!otherUserId,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiver, content }: { receiver: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(Principal.fromText(receiver), content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });
}

export function useMarkMessageAsRead() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markMessageAsRead(messageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Notification Queries
export function useGetNotifications() {
  const { actor, isFetching } = usePatchedActor();
  const { identity } = useInternetIdentity();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 15000,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

export function useGetUnreadNotificationCount() {
  const { actor, isFetching } = usePatchedActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ['unreadNotificationCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUnreadNotificationCount();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 15000,
  });
}

// Admin Queries
export function useGetAllUsers() {
  const { actor, isFetching } = usePatchedActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserProfile[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useBanUser() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.banUser(Principal.fromText(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useUnbanUser() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unbanUser(Principal.fromText(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useGetActivityStats() {
  const { actor, isFetching } = usePatchedActor();
  const { identity } = useInternetIdentity();

  return useQuery<{
    totalUsers: bigint;
    totalPosts: bigint;
    totalMessages: bigint;
    activeUsers: bigint;
  }>({
    queryKey: ['activityStats'],
    queryFn: async () => {
      if (!actor) return {
        totalUsers: BigInt(0),
        totalPosts: BigInt(0),
        totalMessages: BigInt(0),
        activeUsers: BigInt(0),
      };
      return actor.getActivityStats();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 30000,
  });
}

export function useGetAnnouncements() {
  const { actor, isFetching } = usePatchedActor();

  return useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnnouncements();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

export function useCreateAnnouncement() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAnnouncement(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useAssignAdminRole() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.assignAdminRole(Principal.fromText(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useRemoveAdminRole() {
  const { actor } = usePatchedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeAdminRole(Principal.fromText(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}
