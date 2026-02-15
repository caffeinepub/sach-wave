# Deployment Guide

## Promoting Draft to Live

This guide describes the operational steps to promote the current draft deployment to live and verify the live URL is serving the latest build.

### Pre-Deployment Checklist

1. **Test the Draft Version**
   - Verify all features work as expected in the draft environment
   - Test authentication flows (login/logout)
   - Check that all pages load correctly
   - Verify media uploads and displays work properly
   - Test on both desktop and mobile viewports

2. **Review Service Worker Cache**
   - The service worker cache version is managed in `frontend/public/sw.js`
   - Current cache version: `v2`
   - When making significant changes, increment `CACHE_VERSION` to force cache refresh

### Deployment Steps

1. **Initiate Deployment**
   - Click "Push Draft to Live" in the Caffeine interface
   - Wait for the build process to complete
   - Note the deployment timestamp

2. **Verify Live Deployment**
   - Open the live URL in a new incognito/private window
   - Verify the app loads without errors
   - Check browser console for any errors
   - Confirm the version matches your latest draft

3. **Service Worker Update Behavior**
   - The service worker automatically detects updates
   - When a new version is deployed, the service worker will:
     - Download the new version in the background
     - Activate immediately (skip waiting)
     - Reload the page automatically to serve the new version
   - Users with the app open will see the update within 1 minute

### Troubleshooting

#### Stale Cache Issues

If users report seeing an old version:

1. **Hard Refresh**
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - Safari: `Cmd+Option+R`

2. **Clear Service Worker**
   - Open DevTools → Application → Service Workers
   - Click "Unregister" for the service worker
   - Refresh the page

3. **Clear Cache Storage**
   - Open DevTools → Application → Cache Storage
   - Delete all caches starting with "sach-wave-"
   - Refresh the page

#### Version Verification

To verify which version is running:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for "Service Worker registered" message
4. Check the cache name in Application → Cache Storage
5. Current cache should be `sach-wave-v2`

### Post-Deployment Validation

After deployment, verify:

- [ ] Live URL loads the latest version
- [ ] Authentication works (login/logout)
- [ ] All navigation links work
- [ ] Media uploads and displays work
- [ ] No console errors
- [ ] Service worker is registered successfully
- [ ] Cache version matches expected version

### Rollback Procedure

If issues are discovered after deployment:

1. Revert to the previous draft version in Caffeine
2. Push the reverted version to live
3. Follow the verification steps above
4. Communicate the rollback to users if necessary

### Notes

- Service worker updates happen automatically
- Users don't need to manually refresh after deployment
- The app will reload automatically when a new version is detected
- Cache version increments ensure old assets are cleared
- All updates complete within 1 minute for active users
