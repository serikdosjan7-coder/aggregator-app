"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

/* ─── Fix Leaflet default icon paths in Next.js ─────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

/* ─── Types ─────────────────────────────────────────────────────────────── */
type TransportType = "scooter" | "ebike" | "bike" | "moped"

interface ScooterMarker {
  id: string
  lat: number
  lng: number
  name: string
  type: TransportType
  battery: number
  pricePerHour: number
  pricePerDay: number
  distance: number
  provider: string
  isVerified: boolean
  rating: number
  totalRides: number
}

interface MapViewProps {
  markers: ScooterMarker[]
  selected: ScooterMarker | null
  onSelect: (m: ScooterMarker) => void
  filterKey: number
  bookedId: string | null
}

/* ─── Automotive colour map ─────────────────────────────────────────────── */
export const TYPE_COLORS: Record<TransportType, string> = {
  scooter: "#8B0000",  // Accent Red
  bike:    "#FFFFFF",  // White
  ebike:   "#F59E0B",  // Amber
  moped:   "#A855F7",  // Purple
}

/* ─── Geometric circle marker ───────────────────────────────────────────── */
export function makeIcon(
  marker: ScooterMarker,
  isSelected: boolean,
  isBooked: boolean,
): L.DivIcon {
  const fill  = isBooked ? "#F59E0B" : TYPE_COLORS[marker.type]
  const size  = isSelected ? 18 : 12
  const ring  = isSelected ? 3 : 2

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${fill};
      border: ${ring}px solid #000000;
      cursor: pointer;
    "></div>
  `

  return L.divIcon({
    html,
    className: "",
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

/* ─── Leaflet control overrides (automotive palette) ────────────────────── */
const MAP_STYLE = `
  .leaflet-container {
    background: #000000 !important;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .leaflet-control-zoom {
    border: 1px solid #1A1A1A !important;
    border-radius: 4px !important;
    overflow: hidden;
    box-shadow: none !important;
  }
  .leaflet-control-zoom a {
    background: #0A0A0A !important;
    color: #FFFFFF !important;
    border-bottom: 1px solid #1A1A1A !important;
    width: 36px !important;
    height: 36px !important;
    line-height: 36px !important;
    font-size: 18px !important;
    transition: background-color 150ms !important;
    box-shadow: none !important;
  }
  .leaflet-control-zoom a:hover { background: #1A1A1A !important; }
  .leaflet-control-attribution {
    background: #0A0A0A !important;
    color: #A0A0A0 !important;
    font-size: 10px !important;
    box-shadow: none !important;
  }
  .leaflet-control-attribution a { color: #A0A0A0 !important; }
`

/* ─── Fly-to helper ─────────────────────────────────────────────────────── */
function FlyTo({ marker }: { marker: ScooterMarker | null }) {
  const map = useMap()
  useEffect(() => {
    if (
      marker &&
      isFinite(marker.lat) && isFinite(marker.lng) &&
      marker.lat !== 0 && marker.lng !== 0
    ) {
      map.flyTo([marker.lat, marker.lng], 16, { duration: 0.8 })
    }
  }, [marker, map])
  return null
}

/* ─── MapView ───────────────────────────────────────────────────────────── */
export default function MapView({ markers, selected, onSelect, filterKey, bookedId }: MapViewProps) {
  const validMarkers = markers.filter(m =>
    m.lat != null && m.lng != null &&
    isFinite(m.lat) && isFinite(m.lng) &&
    m.lat >= -90 && m.lat <= 90 &&
    m.lng >= -180 && m.lng <= 180,
  )

  return (
    <>
      <style>{MAP_STYLE}</style>
      <MapContainer
        center={[43.2389, 76.8897]}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        {/* CartoDB Dark Matter tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        <FlyTo marker={selected} />

        {validMarkers.map((m) => (
          <Marker
            key={`${filterKey}-${m.id}`}
            position={[m.lat, m.lng]}
            icon={makeIcon(m, selected?.id === m.id, bookedId === m.id)}
            eventHandlers={{ click: () => onSelect(m) }}
          />
        ))}
      </MapContainer>
    </>
  )
}
