"use client"
import { useState, useEffect, useCallback } from "react"
import {
  loadFleet, loadFleetFiltered, measureLatency,
  getActiveTable, normaliseVehicle,
  type Vehicle, type FleetFilter,
} from "@/lib/supabase/fleet"
import { supabase } from "@/lib/supabase/client"

export function useFleet(filter?: FleetFilter) {
  const [vehicles, setVehicles]   = useState<Vehicle[]>([])
  const [loading, setLoading]     = useState(true)
  const [latency, setLatency]     = useState<number | null>(null)
  const [error, setError]         = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [data, ms] = await Promise.all([
        filter ? loadFleetFiltered(filter) : loadFleet(),
        measureLatency(),
      ])
      setVehicles(data)
      setLatency(ms)
      setError(null)
    } catch (e: any) {
      setError(e.message ?? "Load error")
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filter)])

  useEffect(() => { fetch() }, [fetch])

  /* ── Realtime ── */
  useEffect(() => {
    let sub: ReturnType<typeof supabase.channel> | null = null
    getActiveTable().then(table => {
      sub = supabase
        .channel(`fleet-realtime-${table}`)
        .on(
          "postgres_changes" as any,
          { event: "*", schema: "public", table },
          (payload: any) => {
            const { eventType, new: newRow, old: oldRow } = payload
            setVehicles(prev => {
              if (eventType === "INSERT") return [...prev, normaliseVehicle(newRow)]
              if (eventType === "DELETE") return prev.filter(v => v.id !== String(oldRow.id))
              if (eventType === "UPDATE") return prev.map(v => v.id === String(newRow.id) ? normaliseVehicle(newRow) : v)
              return prev
            })
          }
        )
        .subscribe()
    })
    return () => { sub?.unsubscribe() }
  }, [])

  return { vehicles, loading, latency, error, refetch: fetch }
}

/* ── useAuth ── */
export function useAuth() {
  const [user, setUser]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signIn, signOut }
}
