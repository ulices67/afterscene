"use client";
import { useEffect, useState } from "react";
import { CalendarDays, Bell } from "lucide-react";
import type { Archive } from "@/lib/archive";
import { films, image, registerFilms, type Film } from "@/lib/catalog";
type Release = { key:string;date:string;label:string;film:Film };
export default function ReleaseCalendar({archive,openFilm,compact=false,onCheck}:{archive:Archive;openFilm:(f:Film)=>void;compact?:boolean;onCheck?:(films:Film[])=>void}) {
  const [releases,setReleases]=useState<Release[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[filter,setFilter]=useState("Todo");
  const ids=Object.keys(archive.library).filter(id=>["watching","planned","paused"].includes(archive.library[id].status)).join(",");
  useEffect(()=>{
    const ac=new AbortController();setLoading(true);setError("");
    const load=async()=>{
      const found:Release[]=[], checked:Film[]=[];let failures=0;
      const tracked=ids.split(",").map(id=>films.find(f=>f.id===id)).filter((f):f is Film=>!!f&&!!f.tmdb).slice(0,40);
      for(let i=0;i<tracked.length&&!ac.signal.aborted;i+=4){
        await Promise.all(tracked.slice(i,i+4).map(async f=>{try{
          const r=await fetch(`/api/catalog?action=details&type=${f.type}&id=${f.tmdb}`,{signal:ac.signal});
          if(!r.ok)throw Error();const d=await r.json() as {film:Film};const film=d.film;
          if(film)checked.push(film);
          if(film?.nextEpisode?.date)found.push({key:`episode-${film.id}`,film,date:film.nextEpisode.date,label:`T${film.nextEpisode.season} · E${film.nextEpisode.number} — ${film.nextEpisode.name}`});
        }catch{failures++;}}));
      }
      if(!compact&&!ac.signal.aborted)try{
        const r=await fetch("/api/catalog?action=discover&type=movie&upcoming=true",{signal:ac.signal});if(!r.ok)throw Error();const d=await r.json() as {results:Film[]};
        for(const film of d.results||[])if(film.releaseDate)found.push({key:`release-${film.id}`,film,date:film.releaseDate,label:"Estreno de película · fecha de catálogo"});
      }catch{failures++;}
      if(!ac.signal.aborted){registerFilms([...checked,...found.map(e=>e.film)]);onCheck?.(checked);setReleases(found.sort((a,b)=>a.date.localeCompare(b.date)));setError(failures?"Algunas fechas no se pudieron consultar. Vuelve a abrir el calendario para reintentar.":"");setLoading(false);}
    };void load();return()=>ac.abort();
  },[ids,compact,archive.settings.country]);
  const reminders=Object.entries(archive.library).filter(([,item])=>item.reminder).map(([id,item])=>({film:films.find(f=>f.id===id),date:item.reminder!}));
  return <section className={compact?"release-notifications":"standard-page release-calendar page-intro"}>
    <span className="eyebrow">LO PRÓXIMO EN TU PANTALLA</span><h2>{compact?"Tus avisos":"Calendario de estrenos"}</h2>
    {!compact&&<><p>Próximos episodios de hasta 40 series de tu biblioteca y estrenos de cine. Las fechas pueden cambiar; no indican disponibilidad en streaming.</p><div className="chips">{["Todo","Películas","Series","Anime","K-dramas"].map(c=><button className={`chip ${filter===c?"active":""}`} key={c} onClick={()=>setFilter(c)}>{c}</button>)}</div></>}
    {loading&&<p>Consultando próximas fechas…</p>}{error&&<p role="status">{error}</p>}
    <div className="release-list">{releases.filter(e=>filter==="Todo"||e.film.category===filter).slice(0,compact?5:40).map(e=><button key={e.key} onClick={()=>openFilm(e.film)}>{!compact&&<img src={image(e.film)} alt="" loading="lazy"/>}<time dateTime={e.date}><CalendarDays size={17}/>{new Date(e.date+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short"})}</time><span><b>{e.film.title}</b><small>{e.label}</small></span></button>)}</div>
    {!loading&&!releases.length&&<p>No hay próximas fechas confirmadas para los títulos consultados.</p>}
    <h3>Recordatorios de tu lista</h3>{reminders.length?reminders.map(r=><button className="reminder-row" key={r.film?.id||r.date} onClick={()=>r.film&&openFilm(r.film)}><Bell size={16}/><span>{r.film?.title||"Título guardado"}<small>{r.date}</small></span></button>):<p>Programa un recordatorio desde la ficha de cualquier título.</p>}
    <h3>Cambios de disponibilidad</h3>{(archive.availabilityChanges||[]).filter(e=>e.country===archive.settings.country).slice(0,5).map(e=>{const f=films.find(f=>f.id===e.film);return <button className="reminder-row" key={`${e.film}-${e.date}`} onClick={()=>f&&openFilm(f)}><span>{f?.title||e.film}<small>Las opciones para verla cambiaron en {e.country}. Consulta su ficha.</small></span></button>;})}
    <p className="settings-note">Se comprueban fechas y plataformas al abrir esta sección, para hasta 40 títulos pendientes o en curso. Los cambios se detectan desde la segunda consulta; no son avisos en segundo plano.</p>
    {!compact&&<p className="catalog-source">Fechas: TMDB. Anime de MAL/Kitsu sin vínculo verificado a TMDB no tiene calendario de episodios aquí.</p>}
  </section>;
}
