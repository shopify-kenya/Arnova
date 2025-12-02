// Arnova PWA Service Worker
const CACHE_VERSION = "v2"
const STATIC_CACHE = `arnova-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `arnova-dynamic-${CACHE_VERSION}`
const RUNTIME_CACHE = `arnova-runtime-${CACHE_VERSION}`

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon-192x192.jpg",
  "/icon-512x512.jpg",
  "/apple-touch-icon.jpg"
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...")
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[Service Worker] Caching static assets")
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, RUNTIME_CACHE]
      return Promise.all(
        cacheNames
          .filter((name) => !validCaches.includes(name))
          .map((name) => {
            console.log("[Service Worker] Deleting old cache:", name)
            return caches.delete(name)
          })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Skip chrome extensions and other protocols
  if (!request.url.startsWith("http")) return

  // Skip API requests for now
  if (url.pathname.startsWith("/api/")) return

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        // For static assets, return cached version and update in background
        if (url.pathname.includes("_next/") || url.pathname.includes(".js") || url.pathname.includes(".css")) {
          return cachedResponse
        }
      }

      return fetch(request)
        .then((response) => {
          // Handle successful responses (200-299) and 304 Not Modified
          if (response && (response.ok || response.status === 304)) {
            // For 304 responses, return the cached version if available
            if (response.status === 304 && cachedResponse) {
              return cachedResponse
            }

            // Only cache successful responses (not 304)
            if (response.ok && response.status === 200) {
              const responseToCache = response.clone()
              const cacheToUse = STATIC_ASSETS.includes(url.pathname) ? STATIC_CACHE : RUNTIME_CACHE
              
              caches.open(cacheToUse).then((cache) => {
                cache.put(request, responseToCache)
              })
            }

            return response
          }

          // For failed responses, return cached version if available
          if (cachedResponse) {
            return cachedResponse
          }

          throw new Error(`Request failed with status ${response.status}`)
        })
        .catch((error) => {
          console.log("[Service Worker] Fetch failed:", error)
          
          // Return cached response if available
          if (cachedResponse) {
            return cachedResponse
          }

          // Return offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/offline")
          }

          // For other requests, return a basic response
          return new Response("Offline", { status: 503, statusText: "Service Unavailable" })
        })
    })
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag)
  if (event.tag === "sync-cart") {
    event.waitUntil(syncCart())
  }
})

async function syncCart() {
  // Sync cart data when back online
  console.log("[Service Worker] Syncing cart data...")
  // Implementation will be handled by Django backend
}

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || "Arnova"
  const options = {
    body: data.body || "New notification from Arnova",
    icon: "/icon-192x192.jpg",
    badge: "/icon-192x192.jpg",
    data: data.url || "/",
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data))
})
