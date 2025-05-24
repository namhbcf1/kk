const CACHE_NAME = 'tpc-builder-cache-v2';
const STATIC_CACHE = 'tpc-static-cache-v2';
const DYNAMIC_CACHE = 'tpc-dynamic-cache-v2';

// Danh sách tài nguyên tĩnh cần cache ngay khi cài đặt
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/buildsan.css',
  '/modal-styles.css',
  '/buildsan.js',
  '/enums.js',
  '/modal-handler.js',
  '/component-connector.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Danh sách domain cần cache
const CACHE_DOMAINS = [
  'cdn.sheetjs.com',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
  'unpkg.com'
];

// Cài đặt service worker
self.addEventListener('install', event => {
  event.waitUntil(
    // Cache tất cả tài nguyên tĩnh
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Xử lý các yêu cầu fetch
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Xử lý yêu cầu API khác nhau so với tài nguyên tĩnh
  if (event.request.method !== 'GET') {
    return;
  }

  // Chiến lược cache-first cho tài nguyên tĩnh
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.startsWith('/images/') || 
      CACHE_DOMAINS.some(domain => url.hostname.includes(domain))) {
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    // Chiến lược network-first cho các tài nguyên động
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// Kích hoạt service worker và xóa cache cũ
self.addEventListener('activate', event => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            console.log('Deleting old cache:', cacheToDelete);
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Chiến lược cache-first (ưu tiên cache)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Fetch failed:', error);
    // Có thể trả về một trang lỗi hoặc nội dung dự phòng
    return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
  }
}

// Chiến lược network-first (ưu tiên mạng)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Fetch failed, falling back to cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Trả về lỗi nếu không có trong cache
    return new Response('Network error and no cache available', { 
      status: 504, 
      headers: { 'Content-Type': 'text/plain' } 
    });
  }
} 