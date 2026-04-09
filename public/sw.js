const CACHE_NAME = 'habit-museum-v2'

// Only cache truly static assets — never cache HTML pages
const STATIC_ASSETS = ['/manifest.json', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  // Delete ALL old caches (including v1 which was caching HTML pages)
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)

  // Always network-first for navigation (HTML pages) and Supabase
  if (event.request.mode === 'navigate' || url.hostname.includes('supabase')) {
    event.respondWith(fetch(event.request))
    return
  }

  // Cache-first only for static assets
  if (STATIC_ASSETS.some(path => url.pathname === path)) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    )
    return
  }

  // Everything else: network-first
  event.respondWith(fetch(event.request))
})
