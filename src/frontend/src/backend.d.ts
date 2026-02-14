import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Comment {
    content: string;
    author: Principal;
    timestamp: bigint;
}
export interface Story {
    id: StoryId;
    content: string;
    author: Principal;
    timestamp: bigint;
    image?: ExternalBlob;
}
export type StoryId = bigint;
export type PostId = bigint;
export interface ClassInfo {
    year: bigint;
    className: string;
}
export type MessageId = bigint;
export interface Notification {
    id: NotificationId;
    content: string;
    read: boolean;
    user: Principal;
    timestamp: bigint;
}
export interface Post {
    id: PostId;
    media?: ExternalBlob;
    content: string;
    author: Principal;
    likes: bigint;
    timestamp: bigint;
    comments: Array<Comment>;
}
export interface Message {
    id: MessageId;
    content: string;
    read: boolean;
    sender: Principal;
    timestamp: bigint;
    receiver: Principal;
}
export type NotificationId = bigint;
export type AnnouncementId = bigint;
export interface Announcement {
    id: AnnouncementId;
    content: string;
    timestamp: bigint;
}
export interface UserProfile {
    id: Principal;
    bio: string;
    firstRegistered: boolean;
    name: string;
    role: UserRole;
    profilePicture?: ExternalBlob;
    classInfo: ClassInfo;
    lastSeen: bigint;
}
export enum UserRole {
    admin = "admin",
    owner = "owner",
    user = "user",
    banned = "banned"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignAdminRole(user: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    banUser(user: Principal): Promise<void>;
    commentOnPost(postId: PostId, content: string): Promise<void>;
    createAnnouncement(content: string): Promise<Announcement>;
    createPost(content: string, media: ExternalBlob | null): Promise<Post>;
    createStory(content: string, image: ExternalBlob | null): Promise<Story>;
    deletePost(postId: PostId): Promise<void>;
    getActiveStories(): Promise<Array<Story>>;
    getActivityStats(): Promise<{
        activeUsers: bigint;
        totalMessages: bigint;
        totalUsers: bigint;
        totalPosts: bigint;
    }>;
    getAllPosts(): Promise<Array<Post>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getAnnouncements(): Promise<Array<Announcement>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getConversation(otherUser: Principal): Promise<Array<Message>>;
    getConversations(): Promise<Array<[Principal, Message]>>;
    getNotifications(): Promise<Array<Notification>>;
    getPostsByUser(user: Principal): Promise<Array<Post>>;
    getRoleBadge(caller: Principal): Promise<UserRole>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUser(user: Principal): Promise<UserProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: PostId): Promise<void>;
    markMessageAsRead(messageId: MessageId): Promise<void>;
    markNotificationAsRead(notificationId: NotificationId): Promise<void>;
    removeAdminRole(user: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(name: string): Promise<Array<UserProfile>>;
    sendMessage(receiver: Principal, content: string): Promise<Message>;
    signup(name: string, className: string, year: bigint): Promise<void>;
    unbanUser(user: Principal): Promise<void>;
    updateLastSeen(): Promise<void>;
}
