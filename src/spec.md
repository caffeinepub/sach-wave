# Specification

## Summary
**Goal:** Fix the intermittent startup “Unable to load profile” error so authenticated users can recover via an in-app retry (no full page reload), while keeping unauthenticated auth-gate behavior intact.

**Planned changes:**
- Update the startup/auth bootstrap flow to show a dedicated startup error state only for authenticated users when profile loading fails intermittently, with a working Retry action.
- Make Retry re-run both actor initialization and the current-user profile fetch, clearing the previous error state and allowing recovery when the network/backend is available.
- Harden `useGetCallerUserProfile` to avoid failing solely due to short-lived actor unavailability; keep “missing profile” as a successful `null` result and add a small, limited retry policy for transient/network failures.
- Improve diagnostics: log underlying error details and startup phase in development, and show an English, actionable error message to users that distinguishes connection issues vs profile-load issues without exposing stack traces.

**User-visible outcome:** If profile loading fails at startup, authenticated users see a clear English error with a Retry button that can recover without refreshing; unauthenticated users continue to see the normal sign-in/auth gate flow.
