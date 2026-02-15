# Specification

## Summary
**Goal:** Fix profile pages failing to load by correcting backend authorization/visibility and adding robust frontend error handling.

**Planned changes:**
- Adjust backend authorization so newly signed-up users can load their own profile via `getCallerUserProfile` without Unauthorized traps, while preserving access for existing users after upgrade.
- Update backend profile visibility so authenticated users can load other users’ profiles via `getUserProfile(principal)` without Unauthorized traps, but return a non-trapping “not available” response for banned users.
- Improve the frontend Profile page to handle profile-fetch errors with a clear English error state and a Retry action, while keeping the existing “Profile not found” state for genuine null responses.

**User-visible outcome:** Profiles reliably load for the signed-in user and for other users navigated to from the app; if loading fails due to an error, the Profile page shows an error message with a Retry button instead of appearing stuck.
