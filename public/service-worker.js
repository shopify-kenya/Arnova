const STATIC_CACHE = "arnova-static-v2"
const DYNAMIC_CACHE = "arnova-dynamic-v2"

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192x192.jpg",
  "/icon-512x512.jpg",
  "/apple-touch-icon.jpg",
  "/favicon.svg",
  "/offline/",
]

// Install event
self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        console.log("Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event
self.addEventListener("fetch", event => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone()
            caches
              .open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone()
          caches
            .open(DYNAMIC_CACHE)
            .then(cache => cache.put(request, responseClone))
          return response
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || caches.match("/offline/")
          })
        })
    )
    return
  }

  // Handle other requests
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse
      }
      return fetch(request).then(response => {
        if (response.ok && request.method === "GET") {
          const responseClone = response.clone()
          caches
            .open(DYNAMIC_CACHE)
            .then(cache => cache.put(request, responseClone))
        }
        return response
      })
    })
  )
})
