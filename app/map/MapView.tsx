"use client"

import { useEffect, useRef, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

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
  features: string[]
  status: string
}

interface MapViewProps {
  markers: ScooterMarker[]
  selected: ScooterMarker | null
  onSelect: (m: ScooterMarker) => void
  filterKey: number
  bookedId: string | null
}

/* ─── Category config ──────────────────────────────────────────────────── */
const TYPE_CONFIG: Record<TransportType, { symbol: string; bg: string; ring: string }> = {
  scooter: { symbol: "S", bg: "#8B0000", ring: "#A30000" },
  ebike:   { symbol: "E", bg: "#B45309", ring: "#D97706" },
  bike:    { symbol: "B", bg: "#FFFFFF", ring: "#D4D4D4" },
  moped:   { symbol: "M", bg: "#0F766E", ring: "#14B8A6" },
}

/* ─── Custom divIcon with category badge ───────────────────────────────── */
function makeIcon(
  marker: ScooterMarker,
  isSelected: boolean,
  isBooked: boolean,
): L.DivIcon {
  const cfg = TYPE_CONFIG[marker.type] ?? TYPE_CONFIG.scooter
  const size = isSelected ? 40 : 30
  const fontSize = isSelected ? 16 : 12
  const fill = isBooked ? "#B45309" : cfg.bg
  const ring = isBooked ? "#D97706" : cfg.ring
  const textColor = marker.type === "bike" ? "#000000" : "#FFFFFF"
  const pulse = isSelected
    ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${ring};opacity:0.6;animation:marker-pulse 1.5s ease-in-out infinite"></div>`
    : ""

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;">
      ${pulse}
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${fill};border:2px solid ${ring};
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.5);
        transition:transform 150ms;
      ">
        <span style="font-family:'Inter',system-ui,sans-serif;font-size:${fontSize}px;font-weight:800;color:${textColor};line-height:1;letter-spacing:-0.02em">${cfg.symbol}</span>
      </div>
      ${isSelected ? `<div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid ${ring}"></div>` : ""}
    </div>
  `

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

/* ─── Leaflet control overrides (automotive palette) ────────────────────── */
const MAP_STYLE = `
  @keyframes marker-pulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 0.2; }
  }
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
  .leaflet-popup-content-wrapper {
    background: #121212 !important;
    color: #FFFFFF !important;
    border: 1px solid #1A1A1A !important;
    border-radius: 4px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
    padding: 0 !important;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .leaflet-popup-tip {
    background: #121212 !important;
    border: 1px solid #1A1A1A !important;
    box-shadow: none !important;
  }
  .leaflet-popup-close-button {
    color: #A0A0A0 !important;
    font-size: 18px !important;
    padding: 6px 8px 0 0 !important;
  }
  .leaflet-popup-close-button:hover {
    color: #FFFFFF !important;
  }
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

/* ─── Auto-open popup on selection ──────────────────────────────────────── */
function PopupAutoOpen({ selectedId }: { selectedId: string | null }) {
  const map = useMap()
  const prevIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedId || selectedId === prevIdRef.current) return
    prevIdRef.current = selectedId

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const ll = layer.getLatLng()
        map.eachLayer((inner) => {
          if (inner instanceof L.Marker && inner !== layer) return
        })
      }
    })

    const markers: L.Marker[] = []
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) markers.push(layer)
    })
    const target = markers.find((m) => {
      const el = m.getElement()
      return el?.querySelector(`[data-marker-id="${selectedId}"]`)
    })
    if (target) {
      setTimeout(() => target.openPopup(), 400)
    }
  }, [selectedId, map])

  return null
}

/* ─── MapView ───────────────────────────────────────────────────────────── */
export default function MapView({ markers, selected, onSelect, filterKey, bookedId }: MapViewProps) {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map())

  const setMarkerRef = useCallback(
    (id: string, marker: L.Marker | null) => {
      if (marker) {
        markerRefs.current.set(id, marker)
        if (selected?.id === id) {
          setTimeout(() => marker.openPopup(), 400)
        }
      } else {
        markerRefs.current.delete(id)
      }
    },
    [selected],
  )

  const validMarkers = markers.filter(
    (m) =>
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
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        <FlyTo marker={selected} />

        {validMarkers.map((m) => {
          const bc = m.battery > 60 ? "#22C55E" : m.battery > 30 ? "#D97706" : "#8B0000"
          const av = m.status === "available"
          return (
            <Marker
              key={`${filterKey}-${m.id}`}
              ref={(ref) => setMarkerRef(m.id, ref)}
              position={[m.lat, m.lng]}
              icon={makeIcon(m, selected?.id === m.id, bookedId === m.id)}
              eventHandlers={{ click: () => onSelect(m) }}
            >
              <Popup>
                <div data-marker-id={m.id} style={{ padding: "12px 14px", minWidth: 180 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: TYPE_CONFIG[m.type]?.bg ?? "#8B0000", textTransform: "uppercase", marginBottom: 4 }}>
                    {m.type}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.02em", marginBottom: 2 }}>
                    {m.name}
                  </p>
                  <p style={{ fontSize: 11, color: "#A0A0A0", marginBottom: 10 }}>{m.provider}</p>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: "#A0A0A0", letterSpacing: "0.1em", textTransform: "uppercase" }}>Battery</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: bc }}>{m.battery}%</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: "#A0A0A0", letterSpacing: "0.1em", textTransform: "uppercase" }}>Rate</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: "#FFFFFF" }}>{Math.round(m.pricePerHour / 60)} <span style={{ fontSize: 10, color: "#A0A0A0" }}>₸/m</span></p>
                    </div>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: "#A0A0A0", letterSpacing: "0.1em", textTransform: "uppercase" }}>Status</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: av ? "#22C55E" : "#A0A0A0" }}>{av ? "OK" : "--"}</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </>
  )
}
