import { cachedFetch } from '@/lib/upstream';
import { setting } from '@/lib/server-config';

const portrait = (path: string | null | undefined, size: 'w185' | 'w500' = 'w185') =>
  path ? `https://image.tmdb.org/t/p/${size}/${path.replace(/^\//, '')}` : '';
const department = (value: string) => ({ Acting: 'Interpretación', Directing: 'Dirección', Writing: 'Guion', Production: 'Producción', Camera: 'Fotografía', Editing: 'Montaje', Sound: 'Sonido', 'Visual Effects': 'Efectos visuales' }[value] || value);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'search';
  const q = (url.searchParams.get('q') || '').trim();
  const id = url.searchParams.get('id') || '';
  const page = Number(url.searchParams.get('page') || '1');
  if (!['search', 'details'].includes(action) || !Number.isInteger(page) || page < 1 || page > 100 ||
      (action === 'search' && (q.length < 2 || q.length > 100)) ||
      (action === 'details' && !/^[1-9]\d{0,9}$/.test(id))) {
    return Response.json({ error: 'Consulta de personas inválida' }, { status: 400 });
  }
  const token = setting('TMDB_READ_ACCESS_TOKEN');
  if (!token) return Response.json({ error: 'TMDB no está configurado' }, { status: 503 });
  const target = new URL(`https://api.themoviedb.org/3/${action === 'search' ? 'search/person' : `person/${id}`}`);
  target.searchParams.set('language', 'es-MX');
  if (action === 'search') {
    target.searchParams.set('query', q);
    target.searchParams.set('page', String(page));
    target.searchParams.set('include_adult', 'false');
  } else {
    target.searchParams.set('append_to_response', 'combined_credits,images,external_ids');
  }
  try {
    const response = await cachedFetch(target.toString(), {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return Response.json({ error: 'No se pudo consultar la filmografía' }, { status: 502 });
    const data: any = await response.json();
    if (action === 'search') {
      return Response.json({ results: (data.results || []).map((p: any) => ({
        id: p.id, name: p.name, knownFor: department(p.known_for_department || ''),
        photo: portrait(p.profile_path), popularity: p.popularity || 0,
      })), page: data.page, total_pages: data.total_pages, source: 'tmdb' },
      { headers: { 'Cache-Control': 'public, max-age=300' } });
    }
    const credits = [...(data.combined_credits?.cast || []), ...(data.combined_credits?.crew || [])]
      .filter((c: any) => ['movie', 'tv'].includes(c.media_type) && c.id)
      .map((c: any) => ({ id: c.id, type: c.media_type, title: c.title || c.name || '',
        year: Number((c.release_date || c.first_air_date || '').slice(0, 4)) || 0,
        character: c.character || '', job: c.job || '', poster: portrait(c.poster_path, 'w500'),
        vote: c.vote_average || 0 }))
      .filter((c: any) => c.title);
    const grouped = new Map<string, any>();
    for (const credit of credits) {
      const key = `${credit.type}-${credit.id}`, previous = grouped.get(key);
      if (!previous) grouped.set(key, credit);
      else grouped.set(key, { ...previous,
        character: [...new Set([previous.character, credit.character].filter(Boolean))].join(' · '),
        job: [...new Set([previous.job, credit.job].filter(Boolean))].join(' · '),
      });
    }
    const unique = [...grouped.values()]
      .sort((a: any, b: any) => b.year - a.year || a.title.localeCompare(b.title));
    return Response.json({ person: { id: data.id, name: data.name, biography: data.biography || '',
      birthday: data.birthday || '', placeOfBirth: data.place_of_birth || '', department: department(data.known_for_department || ''),
      photo: portrait(data.profile_path, 'w500'), images: (data.images?.profiles || []).slice(0, 6).map((p: any) => portrait(p.file_path, 'w500')),
      imdbId: data.external_ids?.imdb_id || '', credits: unique, sourceUrl: `https://www.themoviedb.org/person/${data.id}` }, source: 'tmdb' },
      { headers: { 'Cache-Control': 'public, max-age=3600' } });
  } catch {
    return Response.json({ error: 'No se pudo conectar con TMDB' }, { status: 503 });
  }
}
