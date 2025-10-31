/* Simple PWA cache */
const CACHE = 'sb-cache-v1';
const ASSETS = [
  '/', '/index.html', '/manifest.webmanifest',
  '/icons/icon-192.png','/icons/icon-256.png','/icons/icon-384.png','/icons/icon-512.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  if(req.method!=='GET') return;
  e.respondWith(
    caches.match(req).then(cached=>{
      const fetchPromise = fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(req, copy));
        return res;
      }).catch(()=>cached || caches.match('/index.html'));
      return cached || fetchPromise;
    })
  );
});
