"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { UserRound, UsersRound, Search, ArrowUpRight } from "lucide-react";
import { getSupabase, type Archive } from "@/lib/archive";
import { films, image } from "@/lib/catalog";
type SharedTitle = {id:string;title:string;poster:string;route:string};
type PublicProfile = {id:string;name:string;bio:string;avatar:string;banner:string;background:string;genres:string[];is_public:boolean;collections:{id:string;name:string;titles:SharedTitle[]}[];activity:{id:string;title:string;action:string;date:string}[]};
type Review = {id:string;film_id:string;display_name:string;rating:number;body:string;created_at:string};
const profileSchema = z.object({
  id:z.string(),name:z.string(),bio:z.string(),avatar:z.string(),banner:z.string(),background:z.string(),is_public:z.boolean(),
  genres:z.array(z.string()).catch([]),
  collections:z.array(z.object({id:z.string(),name:z.string(),titles:z.array(z.object({id:z.string(),title:z.string(),poster:z.string(),route:z.string()}))})).catch([]),
  activity:z.array(z.object({id:z.string(),title:z.string(),action:z.string(),date:z.string()})).catch([]),
});
const safeImage = (url:string) => /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url) || /^https:\/\/(?:image\.tmdb\.org|cdn\.myanimelist\.net|media\.kitsu\.app|media\.kitsu\.io)\//.test(url) || url.startsWith("/posters/") ? url : undefined;
export function PublishProfile({archive,userId,navigate}:{archive:Archive;userId?:string;navigate:(s:string)=>void}) {
  const [publicMode,setPublicMode]=useState(false),[shareLists,setShareLists]=useState(false),[shareActivity,setShareActivity]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  useEffect(()=>{let alive=true;if(userId)getSupabase().then(async c=>{const r=await c?.from("community_profiles").select("is_public,collections,activity").eq("id",userId).maybeSingle();if(alive&&r?.data){setPublicMode(r.data.is_public);setShareLists(Array.isArray(r.data.collections)&&r.data.collections.length>0);setShareActivity(Array.isArray(r.data.activity)&&r.data.activity.length>0);}}).catch(()=>{if(alive)setMessage("No se pudo consultar tu configuración pública.");});return()=>{alive=false;};},[userId]);
  const save=async()=>{
    if(!userId)return navigate("login");
    setBusy(true);setMessage("");
    try{const c=await getSupabase();if(!c)throw Error("Inicia sesión para publicar tu perfil.");
      const {error}=await c.from("community_profiles").upsert({
        id:userId,name:archive.profile.name,bio:archive.profile.bio,avatar:archive.profile.avatar||"",banner:archive.profile.banner||"",background:archive.profile.background||"",genres:archive.profile.genres||[],is_public:publicMode,
        collections:shareLists?archive.collections.map(col=>({id:col.id,name:col.name,titles:col.films.flatMap(id=>{const f=films.find(f=>f.id===id);return f?[{id:f.id,title:f.title,poster:image(f),route:`titulo/${f.type}/${f.id}`}]:[];})})):[],
        activity:shareActivity?(archive.activity||[]).slice(0,20).map(e=>({...e,title:films.find(f=>f.id===e.film)?.title||"Título del archivo"})):[],
        updated_at:new Date().toISOString(),
      });if(error)throw error;setMessage(publicMode?"Perfil público actualizado. Puedes compartir su enlace.":"Tu perfil social es privado.");
    }catch{setMessage("No se pudo guardar el perfil público. Comprueba tu sesión y vuelve a intentar.");}finally{setBusy(false);}
  };
  return <section className="activity-card publish-profile"><span className="eyebrow">TU ESPACIO EN LA COMUNIDAD</span><h2>Perfil social</h2><p>Elige qué compartir. Publicar incluye tu nombre, fotos, biografía, géneros y reseñas ya publicadas.</p><label><input type="checkbox" checked={publicMode} onChange={e=>setPublicMode(e.target.checked)}/>Perfil visible para todos</label><label><input type="checkbox" checked={shareLists} onChange={e=>setShareLists(e.target.checked)}/>Compartir mis colecciones</label><label><input type="checkbox" checked={shareActivity} onChange={e=>setShareActivity(e.target.checked)}/>Compartir mis últimas 20 actividades</label><p className="settings-note">Se publica una copia al guardar. Actualízala después de cambiar tu perfil o tus colecciones.</p><div className="chips"><button className="btn primary" disabled={busy} onClick={save}>{busy?"Guardando…":"Guardar publicación"}</button>{userId&&<button className="btn" onClick={()=>navigate(`usuario/${userId}`)}>Ver mi perfil social</button>}<button className="btn" onClick={()=>navigate("comunidad")}>Explorar comunidad</button></div>{message&&<p role="status">{message}</p>}</section>;
}
export default function Community({profileId,userId,navigate}:{profileId?:string;userId?:string;navigate:(s:string)=>void}) {
  const [profiles,setProfiles]=useState<PublicProfile[]>([]),[query,setQuery]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(true),[reviews,setReviews]=useState<Review[]>([]),[following,setFollowing]=useState(false),[followers,setFollowers]=useState<number|null>(null),[busy,setBusy]=useState(false);
  useEffect(()=>{let active=true;const timer=setTimeout(async()=>{
    setLoading(true);setError("");setReviews([]);setFollowing(false);setFollowers(null);
    try{const c=await getSupabase();if(!c)throw Error();
      let request=c.from("community_profiles").select("*").order("updated_at",{ascending:false}).limit(30);
      if(profileId)request=request.eq("id",profileId);else request=request.eq("is_public",true).ilike("name",`%${query.replace(/[%_]/g,"")}%`);
      const {data,error}=await request;if(error)throw error;if(!active)return;setProfiles((data||[]).flatMap(row=>{const parsed=profileSchema.safeParse(row);return parsed.success?[parsed.data]:[];}));
      if(profileId){const r=await c.rpc("community_reviews",{profile_id:profileId});if(active)setReviews(r.data||[]);
        if(userId){const result=await c.from("community_follows").select("follower",{count:"exact"}).eq("following",profileId);if(active&&!result.error){setFollowers(result.count||0);setFollowing(!!result.data?.some(x=>x.follower===userId));}}
      }
    }catch{if(active)setError("La comunidad no está disponible ahora. Vuelve a intentar más tarde.");}finally{if(active)setLoading(false);}
  },250);return()=>{active=false;clearTimeout(timer);};},[profileId,query,userId]);
  const follow=async()=>{if(!userId)return navigate("login");setBusy(true);try{const c=await getSupabase();if(!c||!profileId)throw Error();const r=following?await c.from("community_follows").delete().eq("follower",userId).eq("following",profileId):await c.from("community_follows").insert({follower:userId,following:profileId});if(r.error)throw r.error;setFollowers(v=>(v||0)+(following?-1:1));setFollowing(v=>!v);}catch{setError("No se pudo cambiar el seguimiento.");}finally{setBusy(false);}};
  const p=profiles[0];
  return <div className="standard-page community-page page-intro"><span className="eyebrow">HISTORIAS QUE NOS CONECTAN</span><h1>{profileId?"Perfil de la comunidad":"Comunidad"}</h1>{!profileId&&<div className="people-search"><Search size={18}/><input aria-label="Buscar miembros" placeholder="Buscar personas de la comunidad" value={query} onChange={e=>setQuery(e.target.value)}/></div>}
    {loading&&<p>Cargando perfiles…</p>}{error&&<p role="alert">{error}</p>}
    {!loading&&!error&&!profiles.length&&<div className="empty-state"><UsersRound/><h3>{profileId?"Este perfil es privado o todavía no se ha publicado.":"Todavía no hay perfiles que coincidan."}</h3><button className="btn" onClick={()=>navigate("perfil")}>Configurar mi perfil</button></div>}
    {profileId&&p&&!loading?<><section className="social-hero" style={{backgroundImage:safeImage(p.banner)?`linear-gradient(0deg,#050608,transparent),url(${safeImage(p.banner)})`:undefined}}>{safeImage(p.avatar)?<img className="social-avatar" src={safeImage(p.avatar)} alt={p.name}/>:<UserRound size={60}/>}<h2>{p.name}</h2><p>{p.bio}</p><div className="chips">{p.genres.map(g=><span className="chip" key={g}>{g}</span>)}</div><div className="chips">{followers!==null&&<span>{followers} seguidores</span>}{userId!==p.id&&p.is_public&&<button className="btn primary" disabled={busy} onClick={follow}>{following?"Dejar de seguir":"Seguir"}</button>}<button className="btn" onClick={async()=>{try{await navigator.clipboard.writeText(location.href);}catch{setError("No se pudo copiar el enlace.");}}}>Copiar enlace</button></div></section>
      <section className="social-content" style={{backgroundImage:safeImage(p.background)?`linear-gradient(#050608e8,#050608e8),url(${safeImage(p.background)})`:undefined}}>
      <h2>Reseñas publicadas</h2>{reviews.map(r=><article className="activity-card" key={r.id}><b>{films.find(f=>f.id===r.film_id)?.title||r.film_id} · {r.rating}/10</b><p>{r.body||"Calificación publicada"}</p><time>{new Date(r.created_at).toLocaleDateString("es-MX")}</time></article>)}{!reviews.length&&<p>Aún no hay reseñas publicadas.</p>}
      <h2>Colecciones compartidas</h2>{p.collections.map(col=><article className="activity-card" key={col.id}><h3>{col.name}</h3><div className="shared-titles">{col.titles.map(f=><button key={f.id} onClick={()=>/^[a-zA-Z0-9/-]+$/.test(f.route)&&navigate(f.route)}>{safeImage(f.poster)&&<img src={safeImage(f.poster)} alt="" loading="lazy"/>}<span>{f.title}</span></button>)}</div></article>)}{!p.collections.length&&<p>No hay colecciones compartidas.</p>}
      <h2>Actividad compartida</h2>{p.activity.map(a=><p key={a.id}><b>{a.title}</b> · {a.action} <small>{new Date(a.date).toLocaleDateString("es-MX")}</small></p>)}</section>
    </>:!profileId&&<div className="people-results">{profiles.map(p=><button key={p.id} onClick={()=>navigate(`usuario/${p.id}`)}><div>{safeImage(p.avatar)?<img src={safeImage(p.avatar)} alt=""/>:<UserRound/>}</div><span><b>{p.name}</b><small>{p.bio}</small></span><ArrowUpRight size={18}/></button>)}</div>}
  </div>;
}
