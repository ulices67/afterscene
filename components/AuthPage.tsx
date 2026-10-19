"use client";
import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,Eye,EyeOff,LoaderCircle,Lock,Mail,UserRound} from 'lucide-react';
import {getSupabase} from '@/lib/archive';
import {getFilm,image} from '@/lib/catalog';
export default function AuthPage({enabled,onBack,announce}:{enabled:boolean;onBack:()=>void;announce:(s:string)=>void}){
  const [mode,setMode]=useState<'login'|'signup'|'forgot'|'reset'>('login');
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  useEffect(()=>{let unsubscribe:(()=>void)|undefined;let active=true;getSupabase().then(c=>{if(!c||!active)return;const l=c.auth.onAuthStateChange(e=>{if(e==='PASSWORD_RECOVERY')setMode('reset');});unsubscribe=()=>l.data.subscription.unsubscribe();if(sessionStorage.getItem('afterscene.passwordRecovery')){setMode('reset');sessionStorage.removeItem('afterscene.passwordRecovery');}});return()=>{active=false;unsubscribe?.();};},[]);
  const film=getFilm('interstellar');
  const titles={login:'Vuelve a tu historia.',signup:'Tu archivo empieza aquí.',forgot:'Recupera tu acceso.',reset:'Elige tu nueva contraseña.'};
  return <main className="auth-page auth-real">
    <div className="auth-art"><img src={image(film,'backdrop')} alt="Fotograma de Interstellar, procedente de TMDB"/><div className="auth-art-shade"/><a className="auth-film-credit" href={`https://www.themoviedb.org/movie/${film.tmdb}`} target="_blank" rel="noreferrer">{film.title} · {film.year}<span>Imagen de TMDB</span></a></div>
    <header><button className="brand" onClick={onBack}>AFTERSCENE</button><button className="auth-explore" onClick={onBack}>Explorar catálogo <ArrowRight size={15}/></button></header>
    <section className="auth-intro"><span className="eyebrow">PARA TODO LO QUE SE QUEDA CONTIGO</span><h1>La historia continúa<br/><em>después de los créditos.</em></h1><p>Tu cine, tus listas, tus recuerdos.<br/>Un lugar para guardar lo que importa.</p><div className="auth-kicker">DESCUBRE <i/> ORGANIZA <i/> RECUERDA</div></section>
    <section className="auth-panel">
      <span className="eyebrow">TU ESPACIO PERSONAL</span><h2>{titles[mode]}</h2><p>{mode==='forgot'?'Te enviaremos un enlace para restablecer tu contraseña.':mode==='signup'?'Crea una cuenta y construye un archivo que sea tuyo.':'Entra para guardar tus historias y personalizar tu perfil.'}</p>
      {['login','signup'].includes(mode)&&<div className="auth-mode"><button className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('');setMessage('');}}>Iniciar sesión</button><button className={mode==='signup'?'active':''} onClick={()=>{setMode('signup');setError('');setMessage('');}}>Crear cuenta</button></div>}
      <form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');setMessage('');try{
        const c=await getSupabase();if(!c)throw Error('El acceso no está disponible en este momento.');
        if(mode==='forgot'){const {error}=await c.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/?recovery=1'});if(error)throw error;setMessage('Si el correo tiene una cuenta, recibirás un enlace para recuperar el acceso.');}
        else if(mode==='reset'){const {error}=await c.auth.updateUser({password});if(error)throw error;setMessage('Contraseña actualizada. Ya puedes continuar.');setMode('login');setPassword('');}
        else {const result=mode==='signup'?await c.auth.signUp({email,password,options:{data:{display_name:name.trim()},emailRedirectTo:window.location.origin+'/'}}):await c.auth.signInWithPassword({email,password});if(result.error)throw result.error;if(!result.data.session)setMessage('Revisa tu correo y confirma tu cuenta para entrar.');else{announce('Bienvenido a tu archivo.');onBack();}}
      }catch(err){const text=(err as Error).message;setError(text==='Invalid login credentials'?'El correo o la contraseña no coinciden.':text==='Email not confirmed'?'Confirma tu correo antes de iniciar sesión.':text);}finally{setBusy(false);}}}>
        {mode==='signup'&&<label><UserRound size={17}/><input required maxLength={45} autoComplete="nickname" aria-label="Tu nombre" placeholder="Tu nombre" value={name} onChange={e=>setName(e.target.value)}/></label>}
        {mode!=='reset'&&<label><Mail size={17}/><input type="email" required autoComplete="email" aria-label="Correo electrónico" placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)}/></label>}
        {mode!=='forgot'&&<label><Lock size={17}/><input type={show?'text':'password'} required minLength={mode==='login'?1:8} autoComplete={mode==='login'?'current-password':'new-password'} aria-label="Contraseña" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" aria-label={show?'Ocultar contraseña':'Mostrar contraseña'} onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></label>}
        {mode==='login'&&<div className="auth-options"><span><Lock size={12}/>Tu archivo es privado</span><button type="button" onClick={()=>{setMode('forgot');setError('');}}>¿Olvidaste tu contraseña?</button></div>}
        {error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="auth-feedback" role="status">{message}</p>}
        <button type="submit" className="auth-primary" disabled={busy||!enabled}>{busy?<LoaderCircle className="spin" size={17}/>:null}{mode==='signup'?'Crear mi cuenta':mode==='forgot'?'Enviar enlace':mode==='reset'?'Actualizar contraseña':'Entrar a AFTERSCENE'}<ArrowRight size={16}/></button>
      </form>
      {['forgot','reset'].includes(mode)&&<button className="auth-return" onClick={()=>{setMode('login');setError('');setMessage('');}}><ArrowLeft size={14}/>Volver a iniciar sesión</button>}
      {!enabled&&<p className="auth-feedback">Conectando con el servicio de cuentas…</p>}
      <div className="auth-note"><Lock size={14}/><p>Tus favoritos, listas y recuerdos pertenecen a tu cuenta. Tú decides qué guardar.</p></div>
    </section>
  </main>;
}
