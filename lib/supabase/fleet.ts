import { supabase } from "./client"

/* ─────────────────────────────────────────────────────────────
   Column name aliases — supports both naming conventions
───────────────────────────────────────────────────────────── */
function pick(row: Record<string, any>, ...keys: string[]) {
  for (const k of keys) if (row[k] !== undefined && row[k] !== null) return row[k]
  return null
}

export type Vehicle = {
  id: string
  name: string
  type: "scooter" | "bike" | "moped" | string
  status: "free" | "busy" | "charging" | string
  battery: number        // 0–100
  district: string
  lat: number | null
  lng: number | null
  created_at?: string
}

export function normaliseVehicle(row: Record<string, any>): Vehicle {
  return {
    id:         String(pick(row, "id") ?? ""),
    name:       pick(row, "name", "model", "title") ?? "Unknown",
    type:       pick(row, "type", "vehicle_type", "kind") ?? "scooter",
    status:     pick(row, "status", "state") ?? "free",
    battery:    Number(pick(row, "battery", "battery_level", "charge") ?? 0),
    district:   pick(row, "district", "zone", "area", "location") ?? "—",
    lat:        Number(pick(row, "lat", "latitude")  ?? 0) || null,
    lng:        Number(pick(row, "lng", "longitude") ?? 0) || null,
    created_at: pick(row, "created_at"),
  }
}

/* ── Active table name (tries vehicles first, falls back to transport) ── */
let _table: string | null = null

export async function getActiveTable(): Promise<string> {
  if (_table) return _table
  const { data, error } = await supabase.from("vehicles").select("id").limit(1)
  if (!error && data) { _table = "vehicles"; return _table }
  _table = "transport"
  return _table
}

/* ── Load all vehicles ── */
export async function loadFleet(): Promise<Vehicle[]> {
  const table = await getActiveTable()
  const { data, error } = await supabase.from(table).select("*")
  if (error || !data) {
    console.error("[fleet] loadFleet error", error)
    return []
  }
  return data.map(normaliseVehicle)
}

/* ── Load with filter ── */
export type FleetFilter = {
  status?: string[]
  type?: string[]
  search?: string
  district?: string
}

export async function loadFleetFiltered(filter: FleetFilter): Promise<Vehicle[]> {
  const table = await getActiveTable()
  let q = supabase.from(table).select("*")

  if (filter.status?.length) q = q.in("status", filter.status)
  if (filter.type?.length)   q = q.in("type", filter.type)
  if (filter.district)       q = q.ilike("district", `%${filter.district}%`)

  const { data, error } = await q
  if (error || !data) return []

  let rows = data.map(normaliseVehicle)

  // client-side search fallback
  if (filter.search) {
    const q2 = filter.search.toLowerCase()
    rows = rows.filter(v =>
      v.id.toLowerCase().includes(q2) ||
      v.name.toLowerCase().includes(q2) ||
      v.district.toLowerCase().includes(q2)
    )
  }
  return rows
}

/* ── Measure DB latency (ms) ── */
export async function measureLatency(): Promise<number> {
  const t0 = performance.now()
  const table = await getActiveTable()
  await supabase.from(table).select("id").limit(1)
  return Math.round(performance.now() - t0)
}

/* ── Fleet stats ── */
export function fleetStats(vehicles: Vehicle[]) {
  return {
    total:    vehicles.length,
    free:     vehicles.filter(v => v.status === "free").length,
    busy:     vehicles.filter(v => v.status === "busy").length,
    charging: vehicles.filter(v => v.status === "charging").length,
    avgBattery: vehicles.length
      ? Math.round(vehicles.reduce((s, v) => s + v.battery, 0) / vehicles.length)
      : 0,
  }
}

/* ── Operator logs ── */
export type ActivityLog = {
  id: string
  action: string
  vehicle_id?: string
  district?: string
  created_at: string
}

export async function loadOperatorLogs(userId?: string, limit = 20): Promise<ActivityLog[]> {
  const tables = ["operator_logs", "logs", "activity_logs"]
  for (const t of tables) {
    let q = supabase.from(t).select("*").order("created_at", { ascending: false }).limit(limit)
    if (userId) q = (q as any).eq("user_id", userId)
    const { data, error } = await q
    if (!error && data?.length) return data as ActivityLog[]
  }
  return []
}

/* ── User trip stats ── */
export async function loadUserTripStats(userId: string) {
  const { data } = await supabase
    .from("user_trips")
    .select("distance_km, created_at")
    .eq("user_id", userId)

  if (!data || !data.length) return { trips: 0, distanceKm: 0 }
  return {
    trips: data.length,
    distanceKm: Math.round(data.reduce((s: number, r: any) => s + (Number(r.distance_km) || 0), 0)),
  }
}
