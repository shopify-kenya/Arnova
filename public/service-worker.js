// Minimal service worker for PWA
self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", event => {
  event.waitUntil(clients.claim())
})

self.addEventListener("fetch", event => {
  // Let all requests pass through
  event.respondWith(fetch(event.request))
})
