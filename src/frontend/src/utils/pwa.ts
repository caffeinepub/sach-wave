export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New service worker available, triggering update...');
                  
                  // Request the new worker to skip waiting
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  
                  // Listen for controller change
                  navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('New service worker activated, reloading...');
                    // Reload to get the latest version
                    window.location.reload();
                  });
                }
              });
            }
          });

          // Check if there's a waiting worker on initial load
          if (registration.waiting) {
            console.log('Waiting service worker found, activating...');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              console.log('Service worker updated, reloading...');
              window.location.reload();
            });
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}
