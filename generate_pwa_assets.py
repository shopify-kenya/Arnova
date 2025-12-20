#!/usr/bin/env python3
"""
Generate PWA assets and validate PWA configuration
"""
import json
from pathlib import Path


def generate_pwa_icons():
    """Generate PWA icons if they don't exist"""
    public_dir = Path("public")

    # Check if icons exist
    required_icons = [
        "icon-192x192.jpg",
        "icon-512x512.jpg",
        "apple-touch-icon.jpg",
    ]

    missing_icons = []
    for icon in required_icons:
        if not (public_dir / icon).exists():
            missing_icons.append(icon)

    if missing_icons:
        icons_str = ", ".join(missing_icons)
        print(f"Missing PWA icons: {icons_str}")
        msg = "Please add these icons to the public/ directory " "for full PWA support"
        print(msg)
        return False

    print("All PWA icons found")
    return True


def validate_manifest():
    """Validate PWA manifest.json"""
    manifest_path = Path("public/manifest.json")

    if not manifest_path.exists():
        print("PWA manifest.json not found")
        return False

    try:
        with open(manifest_path, "r") as f:
            manifest = json.load(f)

        # Check required fields
        required_fields = [
            "name",
            "short_name",
            "start_url",
            "display",
            "icons",
        ]
        missing_fields = [field for field in required_fields if field not in manifest]

        if missing_fields:
            fields_str = ", ".join(missing_fields)
            print(f"Missing required manifest fields: {fields_str}")
            return False

        # Validate icons
        if not manifest.get("icons") or len(manifest["icons"]) == 0:
            print("No icons defined in manifest")
            return False

        print("PWA manifest validated successfully")
        return True

    except json.JSONDecodeError:
        print("Invalid JSON in manifest.json")
        return False


def generate_service_worker():
    """Generate or update service worker"""
    sw_path = Path("public/service-worker.js")

    if sw_path.exists():
        print("Service worker already exists")
        return True

    print("Creating basic service worker...")

    sw_content = """const CACHE_NAME = 'arnova-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.jpg',
  '/icon-512x512.jpg',
  '/apple-touch-icon.jpg',
  '/offline/'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Cache failed:', err))
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request)
          .catch(() => {
            // If both cache and network fail, show offline page
            // for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline/');
            }
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});"""

    with open(sw_path, "w") as f:
        f.write(sw_content)

    print("Service worker created successfully")
    return True


def generate_robots_txt():
    """Generate robots.txt if it doesn't exist"""
    robots_path = Path("public/robots.txt")

    if robots_path.exists():
        print("robots.txt already exists")
        return True

    robots_content = """User-agent: *
Allow: /

Sitemap: https://arnova.com/sitemap.xml"""

    with open(robots_path, "w") as f:
        f.write(robots_content)

    print("robots.txt created")
    return True


def generate_sitemap_xml():
    """Generate basic sitemap.xml if it doesn't exist"""
    sitemap_path = Path("public/sitemap.xml")

    if sitemap_path.exists():
        print("sitemap.xml already exists")
        return True

    sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://arnova.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://arnova.com/new-arrivals/</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://arnova.com/clothing/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://arnova.com/shoes/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://arnova.com/bags/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://arnova.com/accessories/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://arnova.com/sale/</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>"""

    with open(sitemap_path, "w") as f:
        f.write(sitemap_content)

    print("sitemap.xml created")
    return True


def main():
    """Main function to generate all PWA assets"""
    print("Generating PWA assets...")
    print("=" * 40)

    success = True

    # Validate manifest
    if not validate_manifest():
        success = False

    # Generate service worker
    if not generate_service_worker():
        success = False

    # Check PWA icons
    if not generate_pwa_icons():
        success = False

    # Generate SEO files
    generate_robots_txt()
    generate_sitemap_xml()

    print("=" * 40)
    if success:
        print("PWA assets generated successfully!")
        print("Your app is ready for PWA installation")
    else:
        print("PWA setup completed with warnings")
        print("Please address the issues above for full PWA support")

    return success


if __name__ == "__main__":
    main()
