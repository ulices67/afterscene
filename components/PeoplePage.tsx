"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Film as FilmIcon, LoaderCircle, Search, UserRound } from 'lucide-react';
import { registerFilms, type Film } from '@/lib/catalog';

export type PersonSummary = { id: number; name: string; knownFor: string; photo: string };
type Credit = { id: number; type: 'movie' | 'tv'; title: string; year: number; character: string; job: string; poster: string };
type Person = PersonSummary & { biography: string; birthday: string; placeOfBirth: string; department: string; images: string[]; credits: Credit[]; sourceUrl: string };

export default function PeoplePage({ personId, initialQuery, onOpenPerson, onOpenFilm, onBack }: {
  personId?: string; initialQuery?: string; onOpenPerson: (id: number) => void;
  onOpenFilm: (film: Film) => void; onBack: () => void;
}) {
  const [query, setQuery] = useState(initialQuery || '');
  const [debounced, setDebounced] = useState(query);
  const [people, setPeople] = useState<PersonSummary[]>([]);
  const [person, setPerson] = useState<Person | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'Todo' | 'Películas' | 'Series'>('Todo');
  useEffect(() => { setQuery(initialQuery || ''); setPage(1); }, [initialQuery]);
  useEffect(() => { const t = setTimeout(() => setDebounced(query.trim()), 300); return () => clearTimeout(t); }, [query]);
  useEffect(() => {
    const ac = new AbortController(); setPerson(null); setError('');
    if (personId) {
      setLoading(true);
      fetch(`/api/people?action=details&id=${personId}`, { signal: ac.signal })
        .then(async r => { const d: any = await r.json(); if (!r.ok) throw Error(d.error); return d; })
        .then(d => { if (!ac.signal.aborted) setPerson(d.person); })
        .catch(e => { if (!ac.signal.aborted) setError(e.message || 'No se pudo cargar esta persona.'); })
        .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    } else if (debounced.length >= 2) {
      setLoading(true);
      fetch(`/api/people?action=search&q=${encodeURIComponent(debounced)}&page=${page}`, { signal: ac.signal })
        .then(async r => { const d: any = await r.json(); if (!r.ok) throw Error(d.error); return d; })
        .then(d => { if (!ac.signal.aborted) { setPeople(p => page === 1 ? d.results : [...p, ...d.results]); setTotalPages(d.total_pages || 1); } })
        .catch(e => { if (!ac.signal.aborted) setError(e.message || 'No se pudo buscar personas.'); })
        .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    } else setPeople([]);
    return () => ac.abort();
  }, [personId, debounced, page]);
  const openCredit = async (credit: Credit) => {
    try {
      const r = await fetch(`/api/catalog?action=details&type=${credit.type}&id=${credit.id}`);
      const d: any = await r.json();
      if (!r.ok || !d.film) throw Error();
      registerFilms([d.film]); onOpenFilm(d.film);
    } catch { setError('Esta ficha no está disponible ahora mismo.'); }
  };
  if (personId) return <div className="standard-page people-page">
    <button className="settings-back" onClick={onBack}><ArrowLeft size={16}/>Personas</button>
    {loading && <p className="people-feedback"><LoaderCircle className="spin"/>Cargando filmografía real de TMDB…</p>}
    {error && <p className="people-feedback" role="alert">{error}</p>}
    {person && <>
      <section className="person-hero">
        <div className="person-portrait">{person.photo ? <img src={person.photo} alt={`Retrato de ${person.name}`}/> : <UserRound size={60}/>}</div>
        <div><span className="eyebrow">PERSONA · {person.department || 'CINE Y TELEVISIÓN'}</span><h1>{person.name}</h1>
          {(person.placeOfBirth || person.birthday) && <p className="person-meta">{[person.placeOfBirth, person.birthday].filter(Boolean).join(' · ')}</p>}
          <p className="person-bio">{person.biography || 'TMDB todavía no ofrece una biografía en español para esta persona.'}</p>
          <a href={person.sourceUrl} target="_blank" rel="noreferrer">Ver perfil en TMDB <ArrowUpRight size={16}/></a></div>
      </section>
      {person.images.length > 1 && <div className="person-photos" aria-label="Fotografías de TMDB">{person.images.slice(1,5).map(src => <img key={src} src={src} alt={`Fotografía de ${person.name}`} loading="lazy"/>)}</div>}
      <section className="content-section"><div className="person-section-head"><div><span className="eyebrow">TRAYECTORIA</span><h2>Filmografía</h2><p>{person.credits.length} títulos registrados en TMDB</p></div><div className="chips">{(['Todo','Películas','Series'] as const).map(c=><button className={`chip ${filter===c?'active':''}`} key={c} onClick={()=>setFilter(c)}>{c}</button>)}</div></div>
        {person.credits.length ? <div className="person-credits">{person.credits.filter(c=>filter==='Todo'||(filter==='Películas'?c.type==='movie':c.type==='tv')).map(c=><button key={`${c.type}-${c.id}`} onClick={()=>openCredit(c)}><div className="person-credit-art">{c.poster?<img src={c.poster} alt="" loading="lazy"/>:<FilmIcon size={24}/>}</div><span><b>{c.title}</b><small>{c.year || 'Año no disponible'} · {c.type==='movie'?'Película':'Serie'}</small>{(c.character||c.job)&&<small>{c.character||c.job}</small>}</span><ArrowUpRight size={17}/></button>)}</div>:<p className="people-feedback">Esta fuente aún no registra una filmografía.</p>}
      </section>
    </>}
  </div>;
  return <div className="standard-page people-page">
    <section className="page-heading page-intro"><div><span className="eyebrow">DETRÁS DE CADA HISTORIA</span><h1>Personas<span>.</span></h1><p>Explora actores, actrices, dirección y sus trayectorias reales.</p></div></section>
    <div className="people-search"><Search size={20}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="Busca a una persona por nombre" aria-label="Buscar personas"/></div>
    {loading && <p className="people-feedback"><LoaderCircle className="spin"/>Buscando personas…</p>}
    {error && <p className="people-feedback" role="alert">{error}</p>}
    {!query.trim() && <p className="people-feedback">Escribe un nombre para consultar el catálogo de personas de TMDB.</p>}
    {debounced.length >= 2 && !loading && !people.length && !error && <p className="people-feedback">No encontramos resultados. Prueba otro nombre.</p>}
    <div className="people-results">{people.map(p=><button key={p.id} onClick={()=>onOpenPerson(p.id)}><div>{p.photo?<img src={p.photo} alt="" loading="lazy"/>:<UserRound/>}</div><span><b>{p.name}</b><small>{p.knownFor || 'Cine y televisión'}</small></span><ArrowUpRight size={18}/></button>)}</div>
    {page<totalPages && <button className="btn people-more" onClick={()=>setPage(v=>v+1)}>Ver más personas</button>}
    <p className="catalog-source">Perfiles, fotografías y créditos: <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">TMDB</a>.</p>
  </div>;
}
