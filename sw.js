
const CACHE_NAME = 'smart-wallet-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap',
  'https://fonts.gstatic.com/s/cairo/v28/SLXGc1j_M5H6rScyOf8n.woff2'
];

// تثبيت الـ Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// تفعيل الـ Service Worker وتنظيف النسخ القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// اعتراض الطلبات وخدمتها من الذاكرة المؤقتة إذا كانت متوفرة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // إذا وجدنا الملف في الكاش، نرجعه، وإلا نطلبه من الشبكة
      return response || fetch(event.request).then((networkResponse) => {
        // نقوم بتخزين الملفات الجديدة التي يتم طلبها (مثل مكتبات esm.sh) تلقائياً
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // في حالة عدم وجود إنترنت وعدم وجود الملف في الكاش
      return caches.match('/');
    })
  );
});
