import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Text "mo:core/Text";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Timestamp helpers
  func now() : Int {
    Time.now();
  };

  // User
  type ClassInfo = {
    className : Text;
    year : Int;
  };

  type UserRole = {
    #owner;
    #admin;
    #user;
    #banned;
  };

  type UserProfile = {
    id : Principal;
    name : Text;
    classInfo : ClassInfo;
    profilePicture : ?Storage.ExternalBlob;
    role : UserRole;
    lastSeen : Int;
    bio : Text;
    firstRegistered : Bool;
  };

  module UserProfile {
    public func compareByName(a : UserProfile, b : UserProfile) : Order.Order {
      Text.compare(a.name, b.name);
    };

    public func compareByLastSeen(a : UserProfile, b : UserProfile) : Order.Order {
      Int.compare(b.lastSeen, a.lastSeen);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Post
  type PostId = Nat;

  type Post = {
    id : PostId;
    author : Principal;
    content : Text;
    media : ?Storage.ExternalBlob;
    timestamp : Int;
    likes : Nat;
    comments : [Comment];
  };

  module Post {
    public func compareByTimestamp(a : Post, b : Post) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };

    public func compareByLikes(a : Post, b : Post) : Order.Order {
      Int.compare(b.likes, a.likes);
    };
  };

  let posts = Map.empty<PostId, Post>();
  var nextPostId = 1;

  // Like tracking
  let postLikes = Map.empty<PostId, [Principal]>();

  // Comment
  type Comment = {
    author : Principal;
    content : Text;
    timestamp : Int;
  };

  // Story
  type StoryId = Nat;

  type Story = {
    id : StoryId;
    author : Principal;
    content : Text;
    image : ?Storage.ExternalBlob;
    timestamp : Int;
  };

  let stories = Map.empty<StoryId, Story>();
  var nextStoryId = 1;

  // Message
  type MessageId = Nat;

  type Message = {
    id : MessageId;
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Int;
    read : Bool;
  };

  let messages = Map.empty<MessageId, Message>();
  var nextMessageId = 1;

  // Notification
  type NotificationId = Nat;

  type Notification = {
    id : NotificationId;
    user : Principal;
    content : Text;
    timestamp : Int;
    read : Bool;
  };

  let notifications = Map.empty<NotificationId, Notification>();
  var nextNotificationId = 1;

  // Announcement
  type AnnouncementId = Nat;

  type Announcement = {
    id : AnnouncementId;
    content : Text;
    timestamp : Int;
  };

  let announcements = Map.empty<AnnouncementId, Announcement>();
  var nextAnnouncementId = 1;

  // Helper function to check if user is banned
  func isUserBanned(user : Principal) : Bool {
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) { profile.role == #banned };
    };
  };

  // Helper function to add notification
  func addNotification(user : Principal, content : Text) {
    let notification : Notification = {
      id = nextNotificationId;
      user;
      content;
      timestamp = now();
      read = false;
    };
    notifications.add(nextNotificationId, notification);
    nextNotificationId += 1;
  };

  // User management - Required by frontend
  public shared ({ caller }) func signup(name : Text, className : Text, year : Int) : async () {
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already exists");
    };

    let isFirstUser = userProfiles.values().toArray().find(func(profile) { profile.firstRegistered }) == null;
    let role : UserRole = if (isFirstUser) { #owner } else { #user };

    let user : UserProfile = {
      id = caller;
      name;
      classInfo = {
        className;
        year;
      };
      profilePicture = null;
      role;
      lastSeen = now();
      bio = "";
      firstRegistered = isFirstUser;
    };

    userProfiles.add(caller, user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (isUserBanned(caller)) {
      Runtime.trap("Unauthorized: Banned users cannot update profiles");
    };
    if (profile.id != caller) {
      Runtime.trap("Unauthorized: Can only update your own profile");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUser(user : Principal) : async UserProfile {
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
  };

  public shared ({ caller }) func updateLastSeen() : async () {
    let user = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
    userProfiles.add(caller, { user with lastSeen = now() });
  };

  // Posts
  public shared ({ caller }) func createPost(content : Text, media : ?Storage.ExternalBlob) : async Post {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    if (isUserBanned(caller)) {
      Runtime.trap("Unauthorized: Banned users cannot create posts");
    };

    let post : Post = {
      id = nextPostId;
      author = caller;
      content;
      media;
      timestamp = now();
      likes = 0;
      comments = [];
    };

    posts.add(nextPostId, post);
    postLikes.add(nextPostId, []);
    nextPostId += 1;
    post;
  };

  public shared ({ caller }) func likePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };
    if (isUserBanned(caller)) {
      Runtime.trap("Unauthorized: Banned users cannot like posts");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };

    let likers = switch (postLikes.get(postId)) {
      case (null) { [] };
      case (?likers) { likers };
    };

    let hasLiked = likers.find<Principal>(func(p) { p == caller }) != null;
    if (hasLiked) {
      let newLikers = likers.filter(func(p) { p != caller });
      postLikes.add(postId, newLikers);
      posts.add(postId, { post with likes = newLikers.size() });
    } else {
      let newLikers = [caller].concat(likers);
      postLikes.add(postId, newLikers);
      posts.add(postId, { post with likes = newLikers.size() });

      if (post.author != caller) {
        let callerProfile = switch (userProfiles.get(caller)) {
          case (null) { "Someone" };
          case (?profile) { profile.name };
        };
        addNotification(post.author, callerProfile # " liked your post");
      };
    };
  };

  public shared ({ caller }) func commentOnPost(postId : PostId, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on posts");
    };
    if (isUserBanned(caller)) {
      Runtime.trap("Unauthorized: Banned users cannot comment on posts");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };

    let comment : Comment = {
      author = caller;
      content;
      timestamp = now();
    };

    let newComments = [comment].concat(post.comments);
    posts.add(postId, { post with comments = newComments });

    if (post.author != caller) {
      let callerProfile = switch (userProfiles.get(caller)) {
        case (null) { "Someone" };
        case (?profile) { profile.name };
      };
      addNotification(post.author, callerProfile # " commented on your post");
    };
  };

  public query ({ caller }) func getAllPosts() : async [Post] {
    posts.values().toArray().sort(Post.compareByTimestamp);
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [Post] {
    let userPosts = posts.values().toArray().filter(func(p) { p.author == user });
    userPosts.sort(Post.compareByTimestamp);
  };

  public query ({ caller }) func searchUsers(name : Text) : async [UserProfile] {
    let filtered = userProfiles.values().toArray().filter(func(user) {
      user.name.contains(#text(name)) and user.role != #banned
    });
    filtered.sort(UserProfile.compareByName);
  };

  // Stories
  public shared ({ caller }) func createStory(content : Text, image : ?Storage.ExternalBlob) : async Story {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create stories");
    };
    if (isUserBanned(caller)) {
      Runtime.trap("Unauthorized: Banned users cannot create stories");
    };

    let story : Story = {
      id = nextStoryId;
      author = caller;
      content;
      image;
      timestamp = now();
    };

    stories.add(nextStoryId, story);
    nextStoryId += 1;
    story;
  };

  public query ({ caller }) func getActiveStories() : async [Story] {
    let currentTime = now();
    let twentyFourHours = 24 * 60 * 60 * 1000000000;
    stories.values().toArray().filter(func(s) {
      (currentTime - s.timestamp <= twentyFourHours)
    });
  };

  // Messaging
  public shared ({ caller }) func sendMessage(receiver : Principal, content : Text) : async Message {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    if (isUserBanned(caller)) {
      Runtime.trap("Unauthorized: Banned users cannot send messages");
    };

    let message : Message = {
      id = nextMessageId;
      sender = caller;
      receiver;
      content;
      timestamp = now();
      read = false;
    };

    messages.add(nextMessageId, message);
    nextMessageId += 1;

    let callerProfile = switch (userProfiles.get(caller)) {
      case (null) { "Someone" };
      case (?profile) { profile.name };
    };
    addNotification(receiver, callerProfile # " sent you a message");

    message;
  };

  public query ({ caller }) func getConversation(otherUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    let conversation = messages.values().toArray().filter(func(m) {
      (m.sender == caller and m.receiver == otherUser) or
      (m.sender == otherUser and m.receiver == caller)
    });
    conversation.sort(func(a, b) { Int.compare(a.timestamp, b.timestamp) });
  };

  public shared ({ caller }) func markMessageAsRead(messageId : MessageId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };

    let message = switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found") };
      case (?message) { message };
    };

    if (message.receiver != caller) {
      Runtime.trap("Unauthorized: Can only mark your own messages as read");
    };

    messages.add(messageId, { message with read = true });
  };

  public query ({ caller }) func getConversations() : async [(Principal, Message)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    let userMessages = messages.values().toArray().filter(func(m) {
      m.sender == caller or m.receiver == caller
    });

    let conversationMap = Map.empty<Principal, Message>();
    for (msg in userMessages.vals()) {
      let otherUser = if (msg.sender == caller) { msg.receiver } else { msg.sender };
      switch (conversationMap.get(otherUser)) {
        case (null) { conversationMap.add(otherUser, msg) };
        case (?existing) {
          if (msg.timestamp > existing.timestamp) {
            conversationMap.add(otherUser, msg);
          };
        };
      };
    };

    conversationMap.entries().toArray();
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    let userNotifications = notifications.values().toArray().filter(func(n) {
      n.user == caller
    });
    userNotifications.sort(func(a, b) { Int.compare(b.timestamp, a.timestamp) });
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : NotificationId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    let notification = switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notification) { notification };
    };

    if (notification.user != caller) {
      Runtime.trap("Unauthorized: Can only mark your own notifications as read");
    };

    notifications.add(notificationId, { notification with read = true });
  };

  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notification count");
    };

    let unread = notifications.values().toArray().filter(func(n) {
      n.user == caller and not n.read
    });
    unread.size();
  };

  // Administrative functions
  public shared ({ caller }) func banUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };

    let userProfile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    userProfiles.add(user, { userProfile with role = #banned });
  };

  public shared ({ caller }) func unbanUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };

    let userProfile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    userProfiles.add(user, { userProfile with role = #user });
  };

  public shared ({ caller }) func deletePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete posts");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?_) {
        posts.remove(postId);
        postLikes.remove(postId);
      };
    };
  };

  public shared ({ caller }) func createAnnouncement(content : Text) : async Announcement {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create announcements");
    };

    let announcement : Announcement = {
      id = nextAnnouncementId;
      content;
      timestamp = now();
    };

    announcements.add(nextAnnouncementId, announcement);
    nextAnnouncementId += 1;
    announcement;
  };

  public query ({ caller }) func getAnnouncements() : async [Announcement] {
    announcements.values().toArray().sort(func(a, b) {
      Int.compare(b.timestamp, a.timestamp)
    });
  };

  public query ({ caller }) func getActivityStats() : async {
    totalUsers : Nat;
    totalPosts : Nat;
    totalMessages : Nat;
    activeUsers : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view activity stats");
    };

    let currentTime = now();
    let oneHour = 60 * 60 * 1000000000;
    let activeUsers = userProfiles.values().toArray().filter(func(u) {
      (currentTime - u.lastSeen <= oneHour)
    }).size();

    {
      totalUsers = userProfiles.size();
      totalPosts = posts.size();
      totalMessages = messages.size();
      activeUsers;
    };
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.values().toArray().sort(UserProfile.compareByName);
  };

  // Owner Control Panel
  public shared ({ caller }) func assignAdminRole(user : Principal) : async () {
    let currentUser = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?u) { u };
    };

    switch (currentUser.role) {
      case (#owner) {};
      case (#admin) {
        if (user != caller) {
          switch (userProfiles.get(user)) {
            case (null) { Runtime.trap("User not found") };
            case (?targetUser) {
              if (targetUser.role == #owner) {
                Runtime.trap("Unauthorized: Admins cannot modify owner role");
              };
            };
          };
        };
      };
      case (_) { Runtime.trap("Unauthorized: Only owner or admins can assign roles") };
    };

    let targetUser = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    if (targetUser.role == #banned) {
      Runtime.trap("Unauthorized: Cannot assign roles to banned users");
    };

    userProfiles.add(user, { targetUser with role = #admin });
  };

  public shared ({ caller }) func removeAdminRole(user : Principal) : async () {
    let currentUser = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?u) { u };
    };

    switch (currentUser.role) {
      case (#owner) {};
      case (#admin) {
        if (user != caller) {
          Runtime.trap("Unauthorized: Admins can only remove their own admin role");
        };
      };
      case (_) { Runtime.trap("Unauthorized: Only owner or admins can remove roles") };
    };

    let targetUser = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    if (targetUser.role == #banned) {
      Runtime.trap("Unauthorized: Cannot modify roles for banned users");
    };
    userProfiles.add(user, { targetUser with role = #user });
  };

  public query ({ caller }) func getRoleBadge(caller : Principal) : async UserRole {
    let user = switch (userProfiles.get(caller)) {
      case (null) { return #user };
      case (?profile) { return profile.role };
    };
    user.role;
  };
};
