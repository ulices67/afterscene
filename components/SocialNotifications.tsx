"use client";
import {useEffect,useState} from "react";
import {getSupabase} from "@/lib/archive";
import {films} from "@/lib/catalog";
type Notice={id:string;film_id:string;message:string;read_at:string|null;created_at:string};
export default function SocialNotifications({userId,navigate}:{userId?:string;navigate:(route:string)=>void}){
  const [items,setItems]=useState<Notice[]>([]),[error,setError]=useState("");
  useEffect(()=>{let active=true;if(userId)getSupabase().then(async c=>{if(!c)return;const r=await c.from("member_notifications").select("*").order("created_at",{ascending:false}).limit(20);if(active){if(r.error)setError("No se pudieron cargar las respuestas.");else setItems(r.data||[]);}});return()=>{active=false;};},[userId]);
  if(!userId)return null;
  return <div className="social-notifications"><h3>Conversaciones</h3>{error&&<p>{error}</p>}{!items.length&&!error&&<p>No tienes respuestas nuevas a tus reseñas.</p>}{items.map(n=><button className="reminder-row" key={n.id} onClick={async()=>{const c=await getSupabase();await c?.from("member_notifications").update({read_at:new Date().toISOString()}).eq("id",n.id);const f=films.find(f=>f.id===n.film_id);const type=f?.type||(n.film_id.startsWith("tv-")?"tv":"movie");navigate(`titulo/${type}/${n.film_id}`);}}><span><b>{!n.read_at?"● ":""}{n.message}</b><small>{new Date(n.created_at).toLocaleDateString("es-MX")}</small></span></button>)}</div>;
}
