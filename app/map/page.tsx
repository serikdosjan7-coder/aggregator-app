"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, AlertTriangle, Battery, Navigation, Clock, Star } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n"
import { VehicleIllustration } from "@/components/VehicleIllustration"

type TransportType = "scooter" | "ebike" | "bike" | "moped"
interface ScooterMarker {
  id: string; lat: number; lng: number; name: string; type: TransportType
  battery: number; pricePerHour: number; pricePerDay: number; distance: number
  provider: string; isVerified: boolean; rating: number; totalRides: number
  features: string[]; status: string
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMarker(row: Record<string, any>): ScooterMarker | null {
  const lat = parseFloat(row.latitude ?? row.lat ?? row.y ?? "")
  const lng = parseFloat(row.longitude ?? row.lng ?? row.x ?? "")
  if (!isFinite(lat)||!isFinite(lng)||lat===0||lng===0) return null
  if (lat<-90||lat>90||lng<-180||lng>180) return null
  const rawType = (row.vehicle_type ?? row.type ?? "scooter") as string
  const type: TransportType =
    rawType==="electric_scooter"||rawType==="scooter" ? "scooter"
    : rawType==="electric_bike"||rawType==="ebike" ? "ebike"
    : rawType==="bicycle"||rawType==="bike" ? "bike"
    : rawType==="moped" ? "moped" : "scooter"
  const battery = Number(row.battery_level ?? row.battery ?? row.charge ?? 100)
  const pricePerHour = Number(row.price_per_hour ?? row.pricePerHour ?? row.price ?? 0)
  let status = "available"
  if (row.status !== undefined) { status = String(row.status) }
  else if (row.is_available !== undefined) {
    status = (row.is_available===true||row.is_available==="true") ? "available" : "booked"
  }
  return {
    id: String(row.id ?? Math.random()), lat, lng,
    name: row.name ?? row.model ?? row.vehicle_name ?? "Vehicle",
    type, battery, pricePerHour,
    pricePerDay: Number(row.price_per_day ?? row.pricePerDay ?? 0),
    distance: Number(row.distance ?? 0),
    provider: row.provider ?? row.company ?? row.operator ?? "---",
    isVerified: Boolean(row.is_verified ?? row.isVerified ?? false),
    rating: Number(row.rating ?? 0),
    totalRides: Number(row.total_rides ?? row.totalRides ?? 0),
    features: Array.isArray(row.features) ? row.features : [],
    status,
  }
}
const MOCK: ScooterMarker[] = [
  { id:"1",lat:43.2389,lng:76.8897,name:"Xiaomi Pro 2",type:"scooter",battery:82,pricePerHour:800,pricePerDay:5000,distance:0.2,provider:"ScootAlmaty",isVerified:true,rating:4.8,totalRides:124,features:["helmet","lock"],status:"available" },
  { id:"2",lat:43.2420,lng:76.8950,name:"Segway E45",type:"ebike",battery:61,pricePerHour:600,pricePerDay:3500,distance:0.6,provider:"BikeCity",isVerified:true,rating:4.6,totalRides:87,features:["lock","basket"],status:"available" },
  { id:"3",lat:43.2350,lng:76.8840,name:"Trek FX 3",type:"bike",battery:100,pricePerHour:400,pricePerDay:2500,distance:1.1,provider:"ScootAlmaty",isVerified:true,rating:4.9,totalRides:203,features:["helmet","lock","basket"],status:"available" },
  { id:"4",lat:43.2460,lng:76.9010,name:"Honda Dio 110",type:"moped",battery:45,pricePerHour:1200,pricePerDay:7000,distance:1.7,provider:"MotoRent",isVerified:false,rating:4.4,totalRides:45,features:["helmet"],status:"booked" },
  { id:"5",lat:43.2310,lng:76.8960,name:"Ninebot Max G30",type:"scooter",battery:33,pricePerHour:900,pricePerDay:5500,distance:0.9,provider:"BikeCity",isVerified:true,rating:4.7,totalRides:156,features:["lock"],status:"available" },
  { id:"6",lat:43.2400,lng:76.8820,name:"Cube Reaction",type:"ebike",battery:78,pricePerHour:1000,pricePerDay:6000,distance:0.4,provider:"ScootAlmaty",isVerified:true,rating:4.9,totalRides:67,features:["helmet","lock"],status:"available" },
  { id:"7",lat:43.2480,lng:76.8870,name:"Kugoo S3 Pro",type:"scooter",battery:91,pricePerHour:750,pricePerDay:4500,distance:1.3,provider:"RideKZ",isVerified:true,rating:4.5,totalRides:98,features:["lock"],status:"available" },
  { id:"8",lat:43.2330,lng:76.9050,name:"Giant Escape 3",type:"bike",battery:100,pricePerHour:350,pricePerDay:2000,distance:2.1,provider:"BikeCity",isVerified:false,rating:4.3,totalRides:34,features:["basket"],status:"available" },
]
function LoadingOverlay({ label }: { label: string }) {
  return (
    <div style={{position:"absolute",inset:0,zIndex:800,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div className="spinner" style={{margin:"0 auto 12px"}} />
        <p style={{fontSize:11,letterSpacing:"0.15em",color:"#A0A0A0",textTransform:"uppercase"}}>{label}</p>
      </div>
    </div>
  )
}
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div style={{flex:1,background:"#000000",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div className="spinner" style={{margin:"0 auto 12px"}} />
        <p style={{fontSize:11,letterSpacing:"0.15em",color:"#A0A0A0",textTransform:"uppercase"}}>INITIALISING MAP...</p>
      </div>
    </div>
  ),
}

export default function MapPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [mounted,setMounted] = useState(false)
  const [transport,setTransport] = useState<ScooterMarker[]>([])
  const [loading,setLoading] = useState(true)
  const [source,setSource] = useState<"supabase"|"mock">("mock")
  const [selected,setSelected] = useState<ScooterMarker|null>(null)
  const [activeFilter,setActiveFilter] = useState<TransportType|"all">("all")
  const [smartFilter,setSmartFilter] = useState<"all"|"econom"|"maxcharge">("all")
  const [filterKey,setFilterKey] = useState(0)
  const [userInitial,setUserInitial] = useState<string|null>(null)
  const [userId,setUserId] = useState<string|null>(null)
  const [isAdmin,setIsAdmin] = useState(false)
  const [searchQuery,setSearchQuery] = useState("")
  const supabase = typeof window!=="undefined" ? createSupabaseBrowserClient() : null
  const [activeBooking,setActiveBooking] = useState<{id:string;name:string;type:TransportType;pricePerHour:number}|null>(null)
  const [bookingTime,setBookingTime] = useState(0)
  const [activeRide,setActiveRide] = useState<{id:string;name:string;type:TransportType;pricePerHour:number;startedAt:number}|null>(null)
  const [rideElapsed,setRideElapsed] = useState(0)
  const [finishing,setFinishing] = useState(false)
  const [toast,setToast] = useState<string|null>(null)
  const [reportOpen,setReportOpen] = useState(false)
  const [reportType,setReportType] = useState("battery")
  const [reportVehicle,setReportVehicle] = useState("")
  const [reportMessage,setReportMessage] = useState("")
  const [reportSending,setReportSending] = useState(false)
  const BOOKING_DURATION = 10*60
  useEffect(()=>{
    if(!activeBooking) return
    const iv=setInterval(()=>{
      setBookingTime(p=>{
        if(p<=1){clearInterval(iv);setActiveBooking(null);showToast("Booking expired.");return 0}
        return p-1
      })
    },1000)
    return ()=>clearInterval(iv)
  },[activeBooking])
  useEffect(()=>{
    if(!activeRide) return
    const iv=setInterval(()=>setRideElapsed(Math.floor((Date.now()-activeRide.startedAt)/1000)),1000)
    return ()=>clearInterval(iv)
  },[activeRide])
  function showToast(msg:string){setToast(msg);setTimeout(()=>setToast(null),4000)}
  function fmtCD(s:number){return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`}
  function fmtEL(s:number){const h=Math.floor(s/3600);const m=Math.floor((s%3600)/60).toString().padStart(2,"0");const sc=(s%60).toString().padStart(2,"0");return h>0?`${h}:${m}:${sc}`:`${m}:${sc}`}
  function reserveVehicle(v:ScooterMarker){
    if(activeBooking||activeRide){showToast(t.map.booking_already);return}
    setActiveBooking({id:v.id,name:v.name,type:v.type,pricePerHour:v.pricePerHour})
    setBookingTime(BOOKING_DURATION);setSelected(null)
    showToast(`${v.name} ${t.map.booking_confirmed}`)
  }
  function startRide(v:ScooterMarker){
    if(activeRide){showToast(t.map.booking_already);return}
    if(activeBooking?.id===v.id){setActiveBooking(null);setBookingTime(0)}
    setActiveRide({id:v.id,name:v.name,type:v.type,pricePerHour:v.pricePerHour,startedAt:Date.now()})
    setRideElapsed(0);setSelected(null)
    showToast(t.map.ride_started??"Ride started!")
  }
  function cancelBooking(){setActiveBooking(null);setBookingTime(0);showToast(t.map.booking_cancelled)}
  async function finishRide(){
    if(!activeRide||finishing) return
    setFinishing(true)
    const dMin=Math.max(1,Math.ceil(rideElapsed/60))
    const cost=Math.round(dMin*(activeRide.pricePerHour/60))
    if(supabase&&userId){
      await supabase.from("user_trips").insert({user_id:userId,vehicle_id:activeRide.id,transport_name:activeRide.name,machine_id:activeRide.id,duration_minutes:dMin,cost,created_at:new Date().toISOString()})
      const {data:w}=await supabase.from("user_wallets").select("balance").eq("user_id",userId).maybeSingle()
      await supabase.from("user_wallets").upsert({user_id:userId,balance:Math.max(0,Number(w?.balance??0)-cost)},{onConflict:"user_id"})
    }
    setActiveRide(null);setRideElapsed(0);setFinishing(false)
    showToast(`${t.map.ride_finished??"Ride finished."} ${cost.toLocaleString("ru-RU")} \u20B8`)
  }
  async function submitReport(){
    if(!reportMessage.trim()) return
    setReportSending(true)
    if(supabase) await supabase.from("system_alerts").insert({type:reportType,vehicle:reportVehicle||null,message:reportMessage.trim(),status:"open",created_at:new Date().toISOString()}).then(()=>{})
    setReportOpen(false);setReportType("battery");setReportVehicle("");setReportMessage("");setReportSending(false)
    showToast(t.map.report_success)
  }
  useEffect(()=>{setMounted(true)},[])
  useEffect(()=>{
    if(typeof window==="undefined") return
    let a=true
    supabase?.auth.getUser().then(({data})=>{
      if(!a) return
      const u=data.user;if(!u) return
      setUserId(u.id)
      const n=u.user_metadata?.full_name??u.email??""
      setUserInitial(n[0]?.toUpperCase()??null)
      const r=u.user_metadata?.role??u.app_metadata?.role??""
      setIsAdmin(r==="admin")
    })
    return ()=>{a=false}
  },[])
  useEffect(()=>{
    if(typeof window==="undefined") return
    let a=true
    async function fetch(){
      setLoading(true)
      try{
        if(!supabase){setTransport(MOCK);setSource("mock");return}
        const {data:vd,error:ve}=await supabase.from("vehicles").select("*")
        if(!a) return
        if(!ve&&vd&&vd.length>0){const v=vd.map(rowToMarker).filter((m):m is ScooterMarker=>m!==null);if(v.length>0){setTransport(v);setSource("supabase");return}}
        const {data:td,error:te}=await supabase.from("transport").select("*")
        if(!a) return
        if(!te&&td&&td.length>0){const v=td.map(rowToMarker).filter((m):m is ScooterMarker=>m!==null);if(v.length>0){setTransport(v);setSource("supabase");return}}
        setTransport(MOCK);setSource("mock")
      }catch{if(a){setTransport(MOCK);setSource("mock")}}
      finally{if(a)setLoading(false)}
    }
    fetch();return ()=>{a=false}
  },[])
  const filtered=transport
    .filter(m=>activeFilter==="all"||m.type===activeFilter)
    .filter(m=>smartFilter==="econom"?m.pricePerHour<700:smartFilter==="maxcharge"?m.battery>80:true)
    .filter(m=>!searchQuery||m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const availableCount=transport.filter(m=>m.status==="available").length
  function setTF(f:TransportType|"all"){setActiveFilter(f);setFilterKey(k=>k+1)}
  function pill(a:boolean):React.CSSProperties{return{padding:"6px 14px",borderRadius:4,fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",border:"1px solid",borderColor:a?"#8B0000":"#1A1A1A",background:a?"#0A0000":"#121212",color:a?"#FFFFFF":"#A0A0A0",cursor:"pointer",transition:"border-color 150ms,color 150ms",whiteSpace:"nowrap" as const}}
  if(!mounted) return(<div style={{height:"100vh",background:"#000000",display:"flex",alignItems:"center",justifyContent:"center"}}><div className="spinner"/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>)
  const isBooked=activeBooking?.id===selected?.id
  return (
    <div suppressHydrationWarning style={{height:"100vh",background:"#000000",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{`@keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(139,0,0,0.5),0 0 40px rgba(139,0,0,0.2)}50%{box-shadow:0 0 40px rgba(139,0,0,0.9),0 0 80px rgba(139,0,0,0.4)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {activeRide&&(
        <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:960,background:"#000000",borderTop:"2px solid #8B0000"}}>
          <div style={{height:2,background:"linear-gradient(90deg,#8B0000,transparent)"}}/>
          <div style={{padding:"16px 20px 20px",maxWidth:900,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{width:10,height:10,borderRadius:"50%",background:"#8B0000",display:"inline-block",animation:"pulse-glow 1.5s ease-in-out infinite"}}/>
                <div>
                  <p style={{fontSize:9,fontWeight:700,letterSpacing:"0.2em",color:"#8B0000",textTransform:"uppercase",marginBottom:2}}>{t.map.ride_active??"ACTIVE RIDE"}</p>
                  <p style={{fontSize:15,fontWeight:700,color:"#FFFFFF",letterSpacing:"0.04em"}}>{activeRide.name}</p>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",color:"#A0A0A0",textTransform:"uppercase",marginBottom:4}}>{t.map.ride_duration??"Duration"}</p>
                <p style={{fontSize:32,fontWeight:800,color:"#FFFFFF",letterSpacing:"0.05em",fontVariantNumeric:"tabular-nums",fontFamily:"'Courier New',monospace",lineHeight:1}}>{fmtEL(rideElapsed)}</p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <p style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",color:"#A0A0A0",textTransform:"uppercase",marginBottom:4}}>{t.map.ride_cost??"Cost"}</p>
                <p style={{fontSize:20,fontWeight:800,color:"#FFFFFF",letterSpacing:"-0.02em"}}>{Math.round(Math.max(1,Math.ceil(rideElapsed/60))*(activeRide.pricePerHour/60)).toLocaleString("ru-RU")} &#8376;</p>
              </div>
              <button onClick={finishRide} disabled={finishing} style={{flex:2,padding:"14px 24px",fontSize:13,fontWeight:800,letterSpacing:"0.15em",textTransform:"uppercase",background:finishing?"#3A0000":"#8B0000",color:"#FFFFFF",border:"1px solid #8B0000",borderRadius:9999,cursor:finishing?"not-allowed":"pointer",fontFamily:"inherit",animation:finishing?"none":"pulse-glow 1.5s ease-in-out infinite",opacity:finishing?0.7:1}}>
                {finishing?(t.map.ride_finishing??"Finishing..."):(t.map.ride_finish??"Finish Ride")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{position:"absolute",top:0,left:0,right:0,zIndex:900,padding:"14px 16px",display:"flex",alignItems:"center",gap:10,pointerEvents:"none"}}>
        <Link href="/" style={{pointerEvents:"auto",display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#0A0A0A",border:"1px solid #1A1A1A",borderRadius:4,color:"#FFFFFF",fontSize:12,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",textDecoration:"none"}}>
          <ArrowLeft size={14} strokeWidth={1.5}/>{t.map.back}
        </Link>
        <input type="text" placeholder={t.map.search_placeholder} value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{pointerEvents:"auto",flex:1,padding:"8px 14px",background:"#0A0A0A",border:"1px solid #1A1A1A",borderRadius:4,color:"#FFFFFF",fontSize:12,fontWeight:600,letterSpacing:"0.08em",outline:"none",fontFamily:"inherit"}} onFocus={e=>(e.currentTarget.style.borderColor="#8B0000")} onBlur={e=>(e.currentTarget.style.borderColor="#1A1A1A")}/>
        <div style={{pointerEvents:"auto",display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:"#0A0A0A",border:"1px solid #1A1A1A",borderRadius:4,whiteSpace:"nowrap"}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#8B0000",display:"inline-block"}}/>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:"#FFFFFF"}}>{availableCount} {t.map.available}</span>
          {source==="supabase"&&<span style={{fontSize:10,color:"#A0A0A0"}}>· {t.map.live}</span>}
        </div>
        {isAdmin&&(<Link href="/admin" style={{pointerEvents:"auto",display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"#0A0000",border:"1px solid #8B0000",borderRadius:4,color:"#8B0000",fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",textDecoration:"none",flexShrink:0}}>Control</Link>)}
        <button onClick={()=>setReportOpen(true)} style={{pointerEvents:"auto",display:"flex",alignItems:"center",gap:5,padding:"8px 12px",background:"#0A0A0A",border:"1px solid #1A1A1A",borderRadius:4,color:"#A0A0A0",fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",flexShrink:0,fontFamily:"inherit"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#8B0000";e.currentTarget.style.color="#FFFFFF"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#1A1A1A";e.currentTarget.style.color="#A0A0A0"}}>
          <AlertTriangle size={13} strokeWidth={1.5}/>{t.map.report_issue}
        </button>
        <button onClick={()=>router.push("/profile")} style={{pointerEvents:"auto",width:36,height:36,background:"#0A0A0A",border:"1px solid #1A1A1A",borderRadius:4,color:"#FFFFFF",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}} onMouseEnter={e=>(e.currentTarget.style.borderColor="#8B0000")} onMouseLeave={e=>(e.currentTarget.style.borderColor="#1A1A1A")}>
          {userInitial??<User size={16} strokeWidth={1.5}/>}
        </button>
      </div>

      <div style={{position:"absolute",top:64,left:16,zIndex:900,display:"flex",gap:6,pointerEvents:"auto",flexWrap:"wrap"}}>
        {(["all","scooter","ebike","bike","moped"] as const).map(tp=>(
          <button key={tp} onClick={()=>setTF(tp)} style={pill(activeFilter===tp)}>
            {tp==="all"?t.map.filter_all:t.map[`type_${tp}` as keyof typeof t.map]}
          </button>
        ))}
        <div style={{width:1,background:"#1A1A1A",margin:"0 4px"}}/>
        {(["all","econom","maxcharge"] as const).map(id=>(
          <button key={id} onClick={()=>{setSmartFilter(id);setFilterKey(k=>k+1)}} style={pill(smartFilter===id)}>
            {id==="all"?t.map.filter_all_prices:id==="econom"?t.map.filter_econom:t.map.filter_charge}
          </button>
        ))}
      </div>

      <div style={{position:"absolute",bottom:activeRide?220:selected?240:activeBooking?100:20,left:16,zIndex:900,pointerEvents:"none"}}>
        <p style={{fontSize:10,letterSpacing:"0.15em",color:"#A0A0A0",textTransform:"uppercase"}}>{t.map.status}</p>
      </div>

      <div style={{flex:1,position:"relative",overflow:"hidden"}}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <MapView markers={filtered as any} onSelect={(m:any)=>setSelected(m)} selected={selected as any} filterKey={filterKey} bookedId={activeBooking?.id??activeRide?.id??null}/>
        {loading&&<LoadingOverlay label={t.map.loading_vehicles}/>}
      </div>

      {selected&&!activeRide&&(()=>{
        const v=selected
        const bc=v.battery>60?"#22C55E":v.battery>30?"#F59E0B":"#8B0000"
        const rng=Math.round(v.battery*0.6)
        const pm=Math.round(v.pricePerHour/60)
        const av=v.status==="available"
        return(
          <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:950,background:"#0A0A0A",borderTop:"1px solid #1A1A1A"}}>
            <div style={{height:2,background:"linear-gradient(90deg,#8B0000,transparent)"}}/>
            <div style={{display:"grid",gridTemplateColumns:"auto 1fr",maxWidth:900,margin:"0 auto"}}>
              <div style={{padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"center",borderRight:"1px solid #1A1A1A",background:"rgba(139,0,0,0.03)",minWidth:160}}>
                <VehicleIllustration type={v.type} size={130} color={av?"#FFFFFF":"#555555"}/>
              </div>
              <div style={{padding:"18px 20px 20px",display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                  <div style={{minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <p style={{fontSize:9,fontWeight:700,letterSpacing:"0.2em",color:"#8B0000",textTransform:"uppercase"}}>{t.map[`type_${v.type}` as keyof typeof t.map]}</p>
                      {v.isVerified&&<span style={{fontSize:8,fontWeight:700,letterSpacing:"0.1em",color:"#22C55E",textTransform:"uppercase",border:"1px solid rgba(34,197,94,0.3)",borderRadius:2,padding:"1px 5px"}}>{t.map.panel_verified}</span>}
                    </div>
                    <p style={{fontSize:20,fontWeight:700,letterSpacing:"0.02em",color:"#FFFFFF",textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.name}</p>
                    <p style={{fontSize:11,color:"#A0A0A0",marginTop:2}}>{v.provider}</p>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{width:28,height:28,flexShrink:0,background:"transparent",border:"1px solid #1A1A1A",borderRadius:4,color:"#A0A0A0",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}} onMouseEnter={e=>(e.currentTarget.style.borderColor="#8B0000")} onMouseLeave={e=>(e.currentTarget.style.borderColor="#1A1A1A")}>&#x2715;</button>
                </div>
                <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:4,minWidth:80}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <Battery size={12} strokeWidth={1.5} color={bc}/>
                      <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",color:"#A0A0A0",textTransform:"uppercase"}}>{t.map.panel_battery}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:18,fontWeight:800,color:bc,letterSpacing:"-0.02em"}}>{v.battery}%</span>
                      <div style={{width:36,height:4,background:"#1A1A1A",borderRadius:2}}>
                        <div style={{width:`${v.battery}%`,height:"100%",background:bc,borderRadius:2}}/>
                      </div>
                    </div>
                  </div>
                  {v.type!=="bike"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <Navigation size={12} strokeWidth={1.5} color="#A0A0A0"/>
                        <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",color:"#A0A0A0",textTransform:"uppercase"}}>{t.map.panel_range}</span>
                      </div>
                      <span style={{fontSize:18,fontWeight:800,color:"#FFFFFF",letterSpacing:"-0.02em"}}>{rng} <span style={{fontSize:11,fontWeight:400,color:"#A0A0A0"}}>{t.map.panel_km}</span></span>
                    </div>
                  )}
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <Clock size={12} strokeWidth={1.5} color="#A0A0A0"/>
                      <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",color:"#A0A0A0",textTransform:"uppercase"}}>{t.map.panel_rate}</span>
                    </div>
                    <span style={{fontSize:18,fontWeight:800,color:"#FFFFFF",letterSpacing:"-0.02em"}}>{pm} <span style={{fontSize:11,fontWeight:400,color:"#A0A0A0"}}>{t.map.panel_price_min}</span></span>
                  </div>
                  {v.rating>0&&(
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <Star size={12} strokeWidth={1.5} color="#A0A0A0"/>
                        <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",color:"#A0A0A0",textTransform:"uppercase"}}>{t.map.panel_rating}</span>
                      </div>
                      <span style={{fontSize:18,fontWeight:800,color:"#FFFFFF",letterSpacing:"-0.02em"}}>{v.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center",marginTop:4}}>
                  {isBooked?(
                    <button onClick={cancelBooking} style={{flex:1,padding:"11px 20px",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",background:"transparent",color:"#8B0000",border:"1px solid #8B0000",borderRadius:9999,cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>(e.currentTarget.style.background="rgba(139,0,0,0.1)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                      {t.map.btn_cancel_booking} &middot; {fmtCD(bookingTime)}
                    </button>
                  ):av?(
                    <>
                      <button onClick={()=>reserveVehicle(v)} style={{flex:1,padding:"11px 16px",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",background:"rgba(255,255,255,0.04)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",color:"#FFFFFF",border:"1px solid rgba(255,255,255,0.15)",borderRadius:9999,cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#8B0000";e.currentTarget.style.background="rgba(139,0,0,0.08)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.background="rgba(255,255,255,0.04)"}}>
                        {t.map.btn_book_reserve}
                      </button>
                      <button onClick={()=>startRide(v)} style={{flex:2,padding:"12px 24px",fontSize:12,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",background:"#8B0000",color:"#FFFFFF",border:"1px solid #8B0000",borderRadius:9999,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 0 20px rgba(139,0,0,0.4),0 0 40px rgba(139,0,0,0.15)"}} onMouseEnter={e=>{e.currentTarget.style.background="#A30000";e.currentTarget.style.boxShadow="0 0 32px rgba(139,0,0,0.6),0 0 60px rgba(139,0,0,0.25)"}} onMouseLeave={e=>{e.currentTarget.style.background="#8B0000";e.currentTarget.style.boxShadow="0 0 20px rgba(139,0,0,0.4),0 0 40px rgba(139,0,0,0.15)"}}>
                        {t.map.btn_start_ride}
                      </button>
                    </>
                  ):(
                    <button disabled style={{flex:1,padding:"12px 24px",fontSize:12,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",background:"#1A1A1A",color:"#555555",border:"1px solid #1A1A1A",borderRadius:9999,cursor:"not-allowed",fontFamily:"inherit"}}>
                      {t.map.btn_unavailable}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {activeBooking&&!selected&&!activeRide&&(
        <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:940,background:"#0A0000",borderTop:"1px solid #8B0000",padding:"14px 20px",display:"flex",alignItems:"center",gap:16}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#8B0000",display:"inline-block",flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:10,letterSpacing:"0.12em",color:"#A0A0A0",textTransform:"uppercase",marginBottom:2}}>{t.map.booking_active}</p>
            <p style={{fontSize:14,fontWeight:700,color:"#FFFFFF",letterSpacing:"0.04em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{activeBooking.name}</p>
          </div>
          <span style={{fontSize:20,fontWeight:800,color:"#FFFFFF",fontVariantNumeric:"tabular-nums",flexShrink:0,fontFamily:"'Courier New',monospace"}}>{fmtCD(bookingTime)}</span>
          <button onClick={cancelBooking} className="btn-secondary" style={{padding:"8px 14px",fontSize:11,flexShrink:0}}>{t.map.booking_cancel}</button>
        </div>
      )}

      {reportOpen&&(
        <>
          <div onClick={()=>setReportOpen(false)} style={{position:"absolute",inset:0,zIndex:1050,background:"rgba(0,0,0,0.75)"}}/>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:1060,width:"min(420px,calc(100vw - 32px))",background:"#121212",border:"1px solid #1A1A1A",borderRadius:4,padding:"28px 24px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <p style={{fontSize:9,fontWeight:700,letterSpacing:"0.2em",color:"#8B0000",textTransform:"uppercase",marginBottom:4}}>RideHub</p>
                <h2 style={{fontSize:16,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:"#FFFFFF"}}>{t.map.report_title}</h2>
              </div>
              <button onClick={()=>setReportOpen(false)} style={{width:28,height:28,background:"transparent",border:"1px solid #1A1A1A",borderRadius:4,color:"#A0A0A0",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}} onMouseEnter={e=>(e.currentTarget.style.borderColor="#8B0000")} onMouseLeave={e=>(e.currentTarget.style.borderColor="#1A1A1A")}>&#x2715;</button>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#A0A0A0",marginBottom:6}}>{t.map.report_type}</label>
              <select value={reportType} onChange={e=>setReportType(e.target.value)} style={{width:"100%",padding:"9px 12px",background:"#0A0A0A",border:"1px solid #1A1A1A",borderRadius:4,color:"#FFFFFF",fontSize:12,outline:"none",fontFamily:"inherit",cursor:"pointer"}} onFocus={e=>(e.currentTarget.style.borderColor="#8B0000")} onBlur={e=>(e.currentTarget.style.borderColor="#1A1A1A")}>
                <option value="battery">{t.map.report_type_battery}</option>
                <option value="damage">{t.map.report_type_damage}</option>
                <option value="location">{t.map.report_type_location}</option>
                <option value="other">{t.map.report_type_other}</option>
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#A0A0A0",marginBottom:6}}>{t.map.report_vehicle}</label>
              <input type="text" value={reportVehicle} onChange={e=>setReportVehicle(e.target.value)} placeholder={selected?.name??"e.g. Xiaomi Pro 2"} style={{width:"100%",padding:"9px 12px",background:"#0A0A0A",border:"1px solid #1A1A1A",borderRadius:4,color:"#FFFFFF",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}} onFocus={e=>(e.currentTarget.style.borderColor="#8B0000")} onBlur={e=>(e.currentTarget.style.borderColor="#1A1A1A")}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#A0A0A0",marginBottom:6}}>{t.map.report_message}</label>
              <textarea value={reportMessage} onChange={e=>setReportMessage(e.target.value)} placeholder={t.map.report_placeholder} rows={3} style={{width:"100%",padding:"9px 12px",background:"#0A0A0A",border:"1px solid #1A1A1A",borderRadius:4,color:"#FFFFFF",fontSize:12,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}} onFocus={e=>(e.currentTarget.style.borderColor="#8B0000")} onBlur={e=>(e.currentTarget.style.borderColor="#1A1A1A")}/>
            </div>
            <button onClick={submitReport} disabled={reportSending||!reportMessage.trim()} className="btn-primary" style={{width:"100%",padding:"12px",fontSize:12}}>
              {reportSending?t.map.report_submitting:t.map.report_submit}
            </button>
          </div>
        </>
      )}

      {toast&&(
        <div style={{position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",zIndex:1100,pointerEvents:"none"}}>
          <div style={{padding:"8px 18px",background:"#121212",border:"1px solid #1A1A1A",borderRadius:4,color:"#FFFFFF",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{toast}</div>
        </div>
      )}
    </div>
  )
}

