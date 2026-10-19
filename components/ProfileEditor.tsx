"use client";
import {useState} from 'react';
import {Camera, ImagePlus, LoaderCircle, X} from 'lucide-react';
import type {Archive} from '@/lib/archive';
import {films} from '@/lib/catalog';
import {prepareProfileImage} from '@/lib/profile-image';
export default function ProfileEditor({profile,onSave}:{profile:Archive['profile'];onSave:(p:Archive['profile'])=>void}){
  const [draft,setDraft]=useState(profile),[error,setError]=useState(''),[busy,setBusy]=useState(false);
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
    <label>Ubicación<input maxLength={80} placeholder="Opcional" value={draft.location||''} onChange={e=>setDraft(d=>({...d,location:e.target.value}))}/></label>
    <label className="accent-picker">Color de acento<input type="color" value={draft.accent||'#e4e4e7'} onChange={e=>setDraft(d=>({...d,accent:e.target.value}))}/></label>
    <p className="eyebrow">HASTA CUATRO HISTORIAS FAVORITAS</p>
    {Array.from({length:4},(_,i)=><label key={i}>Historia {i+1}<select value={draft.four[i]||''} onChange={e=>{const next=[...draft.four];next[i]=e.target.value;setDraft(d=>({...d,four:next}));}}><option value="">Sin elegir</option>{films.map(f=><option key={f.id} value={f.id} disabled={draft.four.includes(f.id)&&draft.four[i]!==f.id}>{f.title}</option>)}</select></label>)}
    {error&&<p className="form-error" role="alert">{error}</p>}
    <button className="btn primary" disabled={busy} type="submit">{busy?<LoaderCircle className="spin" size={16}/>:null}Guardar cambios</button>
  </form>;
}
