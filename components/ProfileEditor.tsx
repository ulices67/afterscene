"use client";
import {useEffect,useState} from 'react';
import {Camera, ImagePlus, LoaderCircle, Search, X} from 'lucide-react';
import type {Archive} from '@/lib/archive';
import {films,image,registerFilms,type Film} from '@/lib/catalog';
import {prepareProfileImage} from '@/lib/profile-image';
import {useCatalog} from '@/lib/useCatalog';
export default function ProfileEditor({profile,onSave}:{profile:Archive['profile'];onSave:(p:Archive['profile'])=>void}){
  const [draft,setDraft]=useState(profile),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [picking,setPicking]=useState<number|null>(null),[category,setCategory]=useState('Películas'),[query,setQuery]=useState(''),[debounced,setDebounced]=useState(''),[page,setPage]=useState(1);
  useEffect(()=>{const timer=setTimeout(()=>{setDebounced(query.trim());setPage(1);},300);return()=>clearTimeout(timer);},[query]);
  const catalog=useCatalog(picking===null?'__disabled__':debounced,category,page);
  const selectFilm=(index:number,film:Film)=>{registerFilms([film]);setDraft(d=>{const four=[...d.four];four[index]=film.id;return {...d,four};});setPicking(null);};
  return <form className="form profile-editor" onSubmit={e=>{e.preventDefault();if(!draft.name.trim())return setError('Escribe tu nombre.');const four=draft.four.filter(Boolean);if(new Set(four).size!==four.length)return setError('Elige historias diferentes.');onSave({...draft,name:draft.name.trim(),bio:draft.bio.trim(),four});}}>
    <div className="profile-editor-preview" style={{backgroundImage:draft.banner?`linear-gradient(0deg,#07090ddd,transparent),url(${draft.banner})`:undefined}}>
      <div className="avatar">{draft.avatar?<img src={draft.avatar} alt="Vista previa de tu foto"/>:<Camera/>}</div><strong>{draft.name}</strong>
    </div>
    <div className="profile-uploads">{(['avatar','banner','background'] as const).map((key,i)=><div className="profile-upload" key={key}>
      <label><ImagePlus size={18}/>{['Foto de perfil','Banner','Imagen de fondo'][i]}<input aria-label={['Foto de perfil','Banner','Imagen de fondo'][i]} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);setError('');try{const data=await prepareProfileImage(file,key==='avatar'?600:1600);setDraft(d=>({...d,[key]:data}));}catch(err){setError((err as Error).message);}finally{setBusy(false);e.target.value='';}}}/></label>
      {draft[key]&&<button type="button" aria-label={`Quitar ${['foto de perfil','banner','imagen de fondo'][i]}`} onClick={()=>setDraft(d=>({...d,[key]:undefined}))}><X size={15}/>Quitar</button>}
    </div>)}</div>
    <small>JPG, PNG o WebP · Hasta 10 MB. Tus imágenes se guardan en tu archivo privado.</small>
    <label>Nombre<input required maxLength={45} value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))}/></label>
    <label>Alias<input maxLength={30} pattern="[a-zA-Z0-9_.-]*" placeholder="Tu alias" value={draft.handle||''} onChange={e=>setDraft(d=>({...d,handle:e.target.value}))}/></label>
    <label>Biografía<textarea rows={3} maxLength={240} value={draft.bio} onChange={e=>setDraft(d=>({...d,bio:e.target.value}))}/></label>
    <fieldset className="genre-choices"><legend>Géneros favoritos</legend><div className="chips">{['Drama','Comedia','Acción','Ciencia ficción','Fantasía','Romance','Animación','Terror','Misterio','Aventura'].map(genre=><button key={genre} type="button" className={`chip ${draft.genres?.includes(genre)?'active':''}`} aria-pressed={draft.genres?.includes(genre)||false} onClick={()=>setDraft(d=>({...d,genres:d.genres?.includes(genre)?d.genres.filter(g=>g!==genre):[...(d.genres||[]),genre]}))}>{genre}</button>)}</div></fieldset>
    <label>Ubicación<input maxLength={80} placeholder="Opcional" value={draft.location||''} onChange={e=>setDraft(d=>({...d,location:e.target.value}))}/></label>
    <label className="accent-picker">Color de acento<input type="color" value={draft.accent||'#e4e4e7'} onChange={e=>setDraft(d=>({...d,accent:e.target.value}))}/></label>
    <p className="eyebrow">HASTA CUATRO HISTORIAS FAVORITAS</p>
    {Array.from({length:4},(_,i)=><div className="profile-story-slot" key={i}>
      <span>Historia {i+1}</span><div className="profile-story-value"><button type="button" onClick={()=>{setPicking(picking===i?null:i);setQuery('');setDebounced('');setPage(1);}}>{draft.four[i]?films.find(f=>f.id===draft.four[i])?.title||'Historia guardada':'Buscar en el catálogo completo'}</button>{draft.four[i]&&<button type="button" aria-label={`Quitar historia ${i+1}`} onClick={()=>setDraft(d=>{const four=[...d.four];four[i]='';return {...d,four};})}><X size={16}/></button>}</div>
      {picking===i&&<div className="profile-story-picker"><div className="profile-story-search"><Search size={16}/><input autoFocus aria-label="Buscar historia favorita" placeholder="Busca cualquier película, serie o anime" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="chips">{['Películas','Series','Anime','K-dramas'].map(c=><button type="button" className={`chip ${category===c?'active':''}`} key={c} onClick={()=>{setCategory(c);setPage(1);}}>{c}</button>)}</div>
        {catalog.loading&&<p className="picker-feedback">Buscando en el catálogo…</p>}{catalog.error&&<p className="picker-feedback" role="alert">{catalog.error}</p>}
        <div className="profile-story-results" aria-label={`Catálogo de ${category}`}>{(catalog.remote||[]).filter(f=>category==='Películas'?f.type==='movie'&&f.category!=='Anime':f.category===category).filter(f=>!draft.four.includes(f.id)||draft.four[i]===f.id).map(f=><button type="button" key={f.id} onClick={()=>selectFilm(i,f)}><img src={image(f)} alt="" loading="lazy"/><span><b>{f.title}</b><small>{f.year||'—'} · {f.category}</small></span></button>)}</div>
        {catalog.remote?.length===0&&!catalog.loading&&!catalog.error&&<p className="picker-feedback">No encontramos resultados. Prueba otro título.</p>}
        {page<catalog.totalPages&&<button type="button" className="btn profile-story-more" onClick={()=>setPage(v=>v+1)}>Cargar más resultados</button>}
        <small>Resultados reales de {catalog.source==='mal'?'MyAnimeList':catalog.source==='kitsu'?'Kitsu':'TMDB'}.</small>
      </div>}
    </div>)}
    {error&&<p className="form-error" role="alert">{error}</p>}
    <button className="btn primary" disabled={busy} type="submit">{busy?<LoaderCircle className="spin" size={16}/>:null}Guardar cambios</button>
  </form>;
}
