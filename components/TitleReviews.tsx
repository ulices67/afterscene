"use client";
import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle, MessageSquareText, Star, Trash2 } from 'lucide-react';
import { getSupabase } from '@/lib/archive';

type Review = { id: string; user_id?: string; display_name: string; rating: number; body: string; created_at: string; updated_at: string };

export default function TitleReviews({ filmId, filmTitle, userId, displayName, personalRating, onLogin, onRated }: {
  filmId: string; filmTitle: string; userId?: string; displayName: string; personalRating?: number;
  onLogin: () => void; onRated: (rating: number) => void;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(personalRating || 0);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<'recent' | 'highest'>('recent');
  const [myReview, setMyReview] = useState<Review | null>(null);
  const load = useCallback(async (nextPage: number, nextSort: 'recent' | 'highest') => {
    setLoading(true); setError('');
    try {
      const client = await getSupabase();
      if (!client) throw Error('Las reseñas no están disponibles ahora mismo.');
      const { data, count: total, error: queryError } = await client.from('title_reviews')
        .select('id,display_name,rating,body,created_at,updated_at', { count: 'exact' })
        .eq('film_id', filmId).order(nextSort === 'recent' ? 'created_at' : 'rating', { ascending: false })
        .range(nextPage * 20, nextPage * 20 + 19);
      if (queryError) throw queryError;
      setReviews(previous => nextPage ? [...previous, ...(data as Review[])] : data as Review[]);
      setCount(total || 0); setPage(nextPage);
      if (userId && nextPage === 0) {
        const { data: own, error: ownError } = await client.from('title_reviews')
          .select('id,user_id,display_name,rating,body,created_at,updated_at')
          .eq('film_id', filmId).eq('user_id', userId).maybeSingle();
        if (ownError) throw ownError;
        setMyReview(own as Review | null);
      }
    } catch (e) { setError((e as Error).message || 'No se pudieron cargar las reseñas.'); }
    finally { setLoading(false); }
  }, [filmId, userId]);
  useEffect(() => { setRating(personalRating || 0); setBody(''); setReviews([]); setMyReview(null); void load(0, sort); }, [filmId, load, sort]);
  useEffect(() => { if (myReview) { setRating(myReview.rating); setBody(myReview.body); } }, [myReview]);
  const publish = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (!userId) return onLogin();
    if (!rating || (body.trim().length > 0 && body.trim().length < 20)) return setError('Elige una nota. Si escribes una reseña, usa al menos 20 caracteres.');
    setBusy(true);
    try {
      const client = await getSupabase(); if (!client) throw Error('No hay conexión con tu cuenta.');
      const payload = { user_id: userId, film_id: filmId, display_name: displayName.trim().slice(0, 45) || 'Miembro de AFTERSCENE', rating, body: body.trim(), updated_at: new Date().toISOString() };
      const { error: writeError } = await client.from('title_reviews').upsert(payload, { onConflict: 'user_id,film_id' });
      if (writeError) throw writeError;
      onRated(rating); await load(0, sort);
    } catch (e) { setError((e as Error).message || 'No se pudo publicar la reseña.'); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!myReview || !userId || !window.confirm('¿Eliminar tu reseña pública?')) return;
    setBusy(true); setError('');
    try {
      const client = await getSupabase(); if (!client) throw Error('No hay conexión con tu cuenta.');
      const { error: writeError } = await client.from('title_reviews').delete().eq('id', myReview.id).eq('user_id', userId);
      if (writeError) throw writeError;
      setBody(''); setRating(personalRating || 0); await load(0, sort);
    } catch (e) { setError((e as Error).message || 'No se pudo eliminar la reseña.'); }
    finally { setBusy(false); }
  };
  return <section className="title-reviews" aria-label={`Reseñas de ${filmTitle}`}>
    <div className="review-heading"><div><span className="eyebrow">OTRAS MIRADAS</span><h2>Reseñas de la comunidad</h2><p>{count} {count === 1 ? 'reseña publicada' : 'reseñas publicadas'} · Cada nota pertenece a una persona real.</p></div>
      <label>Ordenar <select value={sort} onChange={e => setSort(e.target.value as 'recent' | 'highest')}><option value="recent">Más recientes</option><option value="highest">Mejor calificadas</option></select></label></div>
    <form className="review-composer" onSubmit={publish}>
      <h3>{myReview ? 'Edita tu reseña' : 'Tu opinión sobre esta historia'}</h3>
      <p>Tu nota privada: {personalRating ? `${personalRating}/10` : 'sin calificar'}. Solo se mostrará a la comunidad cuando publiques esta reseña.</p>
      {userId ? <><div className="review-stars" aria-label="Tu nota pública">{Array.from({ length: 10 }, (_, i) => <button type="button" key={i} aria-label={`Calificar ${i + 1} de 10`} aria-pressed={rating === i + 1} onClick={() => setRating(i + 1)}><Star size={20} fill={i < rating ? 'currentColor' : 'none'} /></button>)}</div>
        <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={2000} placeholder="¿Qué te dejó esta historia? Puedes publicar solo tu nota o escribir una reseña." aria-label="Tu reseña pública (opcional)" rows={4} />
        <div className="review-compose-actions"><small>{body.trim().length}/2000 · Se publicará como {displayName || 'Miembro de AFTERSCENE'}</small><button className="btn primary" disabled={busy} type="submit">{busy && <LoaderCircle className="spin" size={16}/>} {myReview ? 'Guardar opinión' : 'Publicar nota y opinión'}</button>{myReview && <button className="review-delete" type="button" disabled={busy} onClick={remove}><Trash2 size={15}/>Eliminar</button>}</div></>
      : <button type="button" className="btn primary" onClick={onLogin}>Inicia sesión para publicar tu reseña</button>}
    </form>
    {error && <p className="review-error" role="alert">{error}</p>}
    {loading && <p className="people-feedback"><LoaderCircle className="spin"/>Cargando reseñas…</p>}
    {!loading && !reviews.length && !error && <div className="empty-state"><MessageSquareText/><h3>Esta conversación está por comenzar.</h3><p>Sé la primera persona en dejar una reseña de {filmTitle}.</p></div>}
    <div className="review-list">{reviews.map(review => <article key={review.id}><div className="review-avatar">{review.display_name.slice(0, 1).toUpperCase()}</div><div><div className="review-byline"><b>{review.display_name}</b><span><Star size={13} fill="currentColor"/> {review.rating}/10</span><time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString('es-MX')}</time></div>{review.body && <p>{review.body}</p>}</div></article>)}</div>
    {reviews.length < count && <button className="btn people-more" onClick={() => void load(page + 1, sort)}>Leer más reseñas</button>}
  </section>;
}
