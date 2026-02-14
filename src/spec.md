# Specification

## Summary
**Goal:** Fix the app startup hang on “Connecting to backend…” for logged-in users by removing the frontend’s call to the missing backend admin initialization method.

**Planned changes:**
- Add a new (non-immutable) actor hook that creates anonymous and authenticated actors without calling `actor._initializeAccessControlWithSecret(...)`, returning `{ actor, isFetching }` in the same shape the app expects.
- Update editable frontend modules (including `frontend/src/App.tsx` and `frontend/src/hooks/useQueries.ts`) to import and use the new actor hook instead of the immutable `useActor`.
- Remove/avoid any remaining references to `_initializeAccessControlWithSecret` and related unused admin-token utilities to prevent TypeScript build errors.

**User-visible outcome:** When logged in, the app no longer gets stuck on “Connecting to backend…” and proceeds into the main app routes as expected; anonymous behavior remains unchanged.
