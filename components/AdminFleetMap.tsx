"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"

export interface FleetVehicle {
  id: string
  name: string
  type: string
  battery: number
  status: string
  provider: string
  lat?: number | null
  lng?: number | null
}

// Leaflet must be loaded client-side only (no SSR)
const AdminFleetMapInner = dynamic(() => import("./AdminFleetMapInner"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0A0A0A",
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A0A0A0" }}>
        Initialising map...
      </p>
    </div>
  ),
})

interface Props {
  vehicles: FleetVehicle[]
  height?: number
}

export default function AdminFleetMap({ vehicles, height = 380 }: Props) {
  const mapped = useMemo(
    () => vehicles.filter(v => v.lat && v.lng && isFinite(v.lat) && isFinite(v.lng)),
    [vehicles],
  )

  return (
    <div style={{
      width: "100%",
      height,
      borderRadius: 4,
      overflow: "hidden",
      border: "1px solid #1A1A1A",
      position: "relative",
    }}>
      <AdminFleetMapInner vehicles={mapped} />
    </div>
  )
}
