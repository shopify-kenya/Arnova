"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface UserLocation {
  user: string
  city: string
  country: string
  lat: number
  lng: number
  orders: number
  last_login: string | null
}

interface UserLocationsMapProps {
  locations: UserLocation[]
}

export function UserLocationsMap({ locations }: UserLocationsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix for default markers in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      // Clear existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Create map
      const map = L.map(mapRef.current!).setView([20, 0], 2)

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      // Add markers for each user location
      locations.forEach(location => {
        const marker = L.marker([location.lat, location.lng]).addTo(map)

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-sm">${location.user}</h3>
            <p class="text-xs text-gray-600">${location.city}, ${location.country}</p>
            <p class="text-xs">Orders: ${location.orders}</p>
            ${location.last_login ? `<p class="text-xs">Last login: ${new Date(location.last_login).toLocaleDateString()}</p>` : ""}
          </div>
        `

        marker.bindPopup(popupContent)
      })

      // Fit map to show all markers
      if (locations.length > 0) {
        const group = L.featureGroup(
          locations.map(loc => L.marker([loc.lat, loc.lng]))
        )
        map.fitBounds(group.getBounds().pad(0.1))
      }

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [locations])

  if (locations.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No user locations available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        ref={mapRef}
        className="h-96 w-full rounded-lg border border-border"
        style={{ minHeight: "400px" }}
      />

      {/* Location Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location, index) => (
          <div key={index} className="p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {location.city}, {location.country}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              User: {location.user}
            </p>
            <p className="text-sm text-muted-foreground">
              Orders: {location.orders}
            </p>
            <p className="text-xs text-muted-foreground">
              Coords: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
            {location.last_login && (
              <p className="text-xs text-muted-foreground">
                Last login: {new Date(location.last_login).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
