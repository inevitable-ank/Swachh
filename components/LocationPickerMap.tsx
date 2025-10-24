"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet"

const pulseIcon = L.divIcon({
  className: "",
  html: `
    <div class="relative w-4 h-4">
      <div class="absolute inset-0 rounded-full bg-blue-500/80 border-2 border-blue-600 animate-ping"></div>
      <div class="absolute inset-0 rounded-full bg-blue-500/80 border-2 border-blue-600"></div>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function LocationMarker({
  lat,
  lng,
  setLatLng,
  setLocationText,
}: {
  lat: number | null
  lng: number | null
  setLatLng: (lat: number, lng: number) => void
  setLocationText: (text: string) => void
}) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      setLatLng(lat, lng)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          {
            headers: { "User-Agent": "Swachh/1.0" },
          }
        )
        const data = await res.json()
        if (data.display_name) {
          setLocationText(data.display_name)
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err)
      }
    },
  })

  return lat && lng ? <Marker position={[lat, lng]} icon={pulseIcon} /> : null
}

export function LocationPickerMap({
  lat,
  lng,
  setLatLng,
  setLocationText,
  location,
}: {
  lat: number | null
  lng: number | null
  setLatLng: (lat: number, lng: number) => void
  setLocationText: (text: string) => void
  location: string
}) {
  return (
    <div className="h-64 w-full rounded-md overflow-hidden">
      <MapContainer
        center={[lat || 28.6139, lng || 77.2090]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker
          lat={lat}
          lng={lng}
          setLatLng={setLatLng}
          setLocationText={setLocationText}
        />
      </MapContainer>
    </div>
  )
}
