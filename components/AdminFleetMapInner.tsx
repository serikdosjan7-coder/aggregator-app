"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { FleetVehicle } from "./AdminFleetMap"

/* ─── Type colours (matches main MapView palette) ───────────────────────── */
const TYPE_COLOR: Record<string, { bg: string; symbol: string }> = {
  scooter: { bg: "#e8002b", symbol: "S" },
  ebike:   { bg: "#f59e0b", symbol: "E" },
  bike:    { bg: "#FFFFFF", symbol: "B" },
  moped:   { bg: "#00b0ff", symbol: "M" },
}

/* ─── Status config ─────────────────────────────────────────────────────── */
const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  available:   { label: "Доступен",       color: "#22C55E" },
  free:        { label: "Доступен",       color: "#22C55E" },
  booked:      { label: "Занят",          color: "#f59e0b" },
  busy:        { label: "Занят",          color: "#f59e0b" },
  maintenance: { label: "На обслуживании", color: "#A0A0A0" },
  charging:    { label: "На зарядке",     color: "#00b0ff" },
}

const TYPE_LABEL: Record<string, string> = {
  scooter: "Самокат",
  ebike:   "Электровел",
  bike:    "Велосипед",
  moped:   "Мопед",
}

/* ─── DivIcon factory ───────────────────────────────────────────────────── */
function makeIcon(v: FleetVehicle): L.DivIcon {
  const cfg = TYPE_COLOR[v.type] ?? { bg: "#e8002b", symbol: "?" }
  const isLow = v.battery < 20
  const textColor = v.type === "bike" ? "#000000" : "#FFFFFF"

  const html = `
    <div style="
      width:32px;height:32px;border-radius:50%;
      background:${cfg.bg};
      border:2px solid ${isLow ? "#ff1a1a" : "rgba(255,255,255,0.25)"};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 10px rgba(0,0,0,0.6);
      cursor:pointer;
    ">
      <span style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:800;color:${textColor};line-height:1">${cfg.symbol}</span>
    </div>
    ${isLow ? `<div style="position:absolute;top:-4px;right:-4px;width:10px;height:10px;border-radius:50%;background:#ff1a1a;border:1px solid #0A0A0A"></div>` : ""}
  `

  return L.divIcon({
    html: `<div style="position:relative">${html}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  })
}

/* ─── Leaflet CSS overrides ─────────────────────────────────────────────── */
const MAP_CSS = `
  .leaflet-container {
    background: #000 !important;
    font-family: Inter, system-ui, sans-serif;
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
    width: 32px !important; height: 32px !important; line-height: 32px !important;
    font-size: 16px !important;
    box-shadow: none !important;
    transition: background 150ms !important;
  }
  .leaflet-control-zoom a:hover { background: #1A1A1A !important; }
  .leaflet-control-attribution {
    background: rgba(10,10,10,0.85) !important;
    color: #555 !important; font-size: 9px !important;
    box-shadow: none !important;
  }
  .leaflet-control-attribution a { color: #555 !important; }
  .leaflet-popup-content-wrapper {
    background: #121212 !important;
    color: #FFF !important;
    border: 1px solid #2A2A2A !important;
    border-radius: 4px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.7) !important;
    padding: 0 !important;
  }
  .leaflet-popup-content { margin: 0 !important; }
  .leaflet-popup-tip { background: #121212 !important; }
  .leaflet-popup-close-button { color: #555 !important; padding: 6px 8px 0 0 !important; }
  .leaflet-popup-close-button:hover { color: #FFF !important; }
  .admin-fleet-map-popup { padding: 14px 16px; min-width: 200px; }
`

/* ─── Popup content ─────────────────────────────────────────────────────── */
function VehiclePopup({ v }: { v: FleetVehicle }) {
  const batteryColor = v.battery > 50 ? "#22C55E" : v.battery > 20 ? "#f59e0b" : "#e8002b"
  const status = STATUS_LABEL[v.status] ?? { label: v.status, color: "#A0A0A0" }
  const typeLabel = TYPE_LABEL[v.type] ?? v.type

  return (
    <div className="admin-fleet-map-popup">
      {/* Provider + type */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A0A0A0", marginBottom: 2 }}>
            {typeLabel}
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.02em" }}>
            {v.name}
          </p>
        </div>
        <div style={{
          padding: "3px 8px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid #2A2A2A",
          borderRadius: 4,
          fontSize: 10, fontWeight: 700,
          color: "#A0A0A0",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          {v.provider}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#1A1A1A", marginBottom: 10 }} />

      {/* Battery */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A0A0A0" }}>
            Заряд батареи
          </p>
          <p style={{ fontSize: 15, fontWeight: 800, color: batteryColor, letterSpacing: "-0.02em" }}>
            {v.battery}%
          </p>
        </div>
        <div style={{ height: 3, background: "#1A1A1A", borderRadius: 2 }}>
          <div style={{ width: `${v.battery}%`, height: "100%", background: batteryColor, borderRadius: 2, transition: "width 300ms" }} />
        </div>
        {v.battery < 20 && (
          <p style={{ fontSize: 9, color: "#e8002b", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>
            ⚠ Нужна зарядка
          </p>
        )}
      </div>

      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: status.color, flexShrink: 0 }} />
        <p style={{ fontSize: 11, fontWeight: 600, color: status.color }}>
          {status.label}
        </p>
      </div>
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function AdminFleetMapInner({ vehicles }: { vehicles: FleetVehicle[] }) {
  return (
    <>
      <style>{MAP_CSS}</style>
      <MapContainer
        center={[43.2389, 76.8897]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        zoomControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        {vehicles.map(v => (
          <Marker
            key={v.id}
            position={[v.lat as number, v.lng as number]}
            icon={makeIcon(v)}
          >
            <Popup>
              <VehiclePopup v={v} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  )
}
