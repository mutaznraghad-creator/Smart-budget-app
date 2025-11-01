// sw.js
const CACHE_NAME = 'sb-cache-v1';
const ASSETS = [
  '/', '/index.html',
  '/icons/icon-16.png','/icons/icon-32.png','/icons/icon-64.png',
  '/icons/icon-128.png','/icons/icon-192.png','/icons/icon-256.png','/icons/icon-512.png',
  '/Manifest.webmanifest'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method!=='GET'){ return; }
  e.respondWith(
    caches.match(req).then(res=> res || fetch(req).then(network=>{
      // Cache-first then update (optional)
      if(network.ok){
        const copy = network.clone();
        caches.open(CACHE_NAME).then(c=> c.put(req, copy));
      }
      return network;
    }).catch(()=> caches.match('/index.html')))
  );
});

// استقبال جدولة من الصفحة (best-effort)
self.addEventListener('message', e=>{
  const data = e.data || {};
  if(data.type==='schedule' && data.payload){
    const { title, body, fireAt } = data.payload;
    const delay = Math.max(0, (fireAt||Date.now()) - Date.now());
    // تحذير: قد يتم إيقاف الـSW قبل التنفيذ. هذا best-effort فقط.
    setTimeout(()=>{
      self.registration.showNotification(title || 'Reminder', {
        body: body || 'It is time.',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-128.png'
      });
    }, Math.min(delay, 5*60*1000)); // حد أقصى 5 دقائق لتجنب الانتظار الطويل داخل SW
  }
});

// النقر على الإشعار
self.addEventListener('notificationclick', event=>{
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list=>{
      const url = '/';
      for(const client of list){ if(client.url.includes(url)) return client.focus(); }
      return clients.openWindow(url);
    })
  );
});
