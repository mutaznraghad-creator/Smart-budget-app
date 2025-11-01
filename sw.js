const CACHE_VERSION = 'sb-v3-2025-11-01';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => clients.claim());
