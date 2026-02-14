# Specification

## Summary
**Goal:** Fix missing/broken mobile footer navigation icons, restore unread/role badges, and swap the app logo to the user-provided image.

**Planned changes:**
- Ensure the mobile bottom navigation always renders visible icons for Home, Stories, Chat, Notifications, and Profile with no broken-image placeholders; add a safe fallback icon behavior if an asset fails to load while preserving existing active/invert styling.
- Provide/ensure a complete set of footer icon assets exists at the current referenced paths: nav-icon-home, nav-icon-stories, nav-icon-chat, nav-icon-notifications, nav-icon-profile (all 128x128 PNGs).
- Fix Notifications unread-count badge visibility: show only when unread count > 0 and hide when 0, across both sidebar/nav list and mobile bottom nav.
- Restore Owner role badge display near the username on profile pages using the existing RoleBadge styling rules; ensure backend Owner assignment behavior does not regress.
- Update all UI locations that display the current Sach Wave logo (desktop sidebar header, mobile header, splash screen) to use the newly uploaded logo asset and ensure it renders cleanly on dark backgrounds at small sizes.

**User-visible outcome:** On mobile, the bottom navigation shows five working icons (no broken placeholders), unread notifications display a badge when applicable, Owner users see their Owner badge near their username, and the app displays the new logo everywhere the old logo appeared.
