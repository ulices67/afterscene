"use client";
import { useState } from "react";
import { Clock3, Clapperboard, Tv, CheckCheck } from "lucide-react";
import type { Archive } from "@/lib/archive";
import { films, image, type Film } from "@/lib/catalog";

export default function ActivityDashboard({ archive, openFilm }: { archive: Archive; openFilm: (film: Film) => void }) {
  const [period, setPeriod] = useState("year");
  const now = new Date(), year = now.getFullYear();
  const prefix = period === "all" ? "" : period === "year" ? String(year) : `${year}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const entries = Object.entries(archive.library);
  const completed = entries.filter(([, v]) => v.status === "completed" && (!prefix || v.completedAt?.startsWith(prefix)));
  const watching = entries.filter(([, v]) => v.status === "watching");
  const genres: Record<string, number> = {};
  completed.forEach(([id]) => { const film = films.find(f => f.id === id); if (film) genres[film.genre] = (genres[film.genre] || 0)+1; });
  const minutes = Math.floor(Object.entries(archive.watchTime || {}).filter(([day]) => day.startsWith(prefix)).reduce((sum,[, seconds]) => sum + seconds,0)/60);
  const events = (archive.activity || []).filter(e => e.date.startsWith(prefix));
  const months = Array.from({length:12},(_,i)=>({ label:new Date(year,i,1).toLocaleDateString("es-MX",{month:"short"}), count:entries.filter(([,v])=>v.status==="completed"&&v.completedAt?.startsWith(`${year}-${String(i+1).padStart(2,"0")}`)).length }));
  const max = Math.max(1,...months.map(m=>m.count));
  return <section className="activity-dashboard">
    <div className="person-section-head"><div><span className="eyebrow">TU VIDA ENTRE HISTORIAS</span><h2>Mi año cinematográfico</h2><p>Tu actividad real, a tu ritmo.</p></div><select aria-label="Periodo de actividad" value={period} onChange={e=>setPeriod(e.target.value)}><option value="month">Este mes</option><option value="year">Este año</option><option value="all">Todo el tiempo</option></select></div>
    <div className="activity-stats">{[
      {icon:Clock3,value:minutes,label:"Minutos reproducidos"},
      {icon:Clapperboard,value:completed.filter(([id])=>films.find(f=>f.id===id)?.type==="movie").length,label:"Películas terminadas"},
      {icon:Tv,value:watching.filter(([id])=>films.find(f=>f.id===id)?.type==="tv").length,label:"Series en progreso · actual"},
      {icon:CheckCheck,value:entries.reduce((n,[,v])=>n+(v.episodes?.length||0),0),label:"Episodios marcados · total"}
    ].map(s=><article key={s.label}><s.icon size={20}/><strong>{s.value}</strong><small>{s.label}</small></article>)}</div>
    <p className="settings-note">Los minutos se registran al reproducir tus videos desde esta versión. Las fechas de finalización se registran al marcar un título como terminado.</p>
    <div className="activity-columns"><article className="activity-card"><h3>Tus historias en {year}</h3><div className="activity-chart">{months.map(m=><div key={m.label} title={`${m.label}: ${m.count} títulos`}><b>{m.count}</b><span style={{height:`${Math.max(3,m.count/max*110)}px`}}/><small>{m.label}</small></div>)}</div></article>
    <article className="activity-card"><h3>Géneros más vistos</h3>{Object.entries(genres).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([genre,count])=><div className="genre-meter" key={genre}><span>{genre}</span><b>{count}</b><progress max={Math.max(1,completed.length)} value={count}/></div>)}{!Object.keys(genres).length&&<p>Marca tus próximas historias como terminadas para descubrir tus géneros del periodo.</p>}</article></div>
    <article className="activity-card"><h3>Actividad reciente</h3>{events.length ? <div className="activity-feed">{events.slice(0,20).map(e=>{const f=films.find(f=>f.id===e.film);return <button key={e.id} disabled={!f} onClick={()=>f&&openFilm(f)}>{f&&<img src={image(f)} alt=""/>}<span><b>{f?.title || "Título del archivo"}</b><small>{e.action}</small></span><time>{new Date(e.date).toLocaleDateString("es-MX")}</time></button>;})}</div>:<p>Tus cambios de estado, calificaciones y episodios aparecerán aquí.</p>}</article>
  </section>;
}
