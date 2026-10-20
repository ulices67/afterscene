import type { Film } from './catalog';

const text = (value: unknown, fallback = 'No disponible') => typeof value === 'string' && value.trim() ? value.trim() : fallback;

export function fromMAL(node: any): Film {
  const m = node?.node || node;
  const start = text(m.start_date, '');
  return {
    id: `mal-${m.id}`, tmdb: 0, mal: m.id, source: 'mal', remote: true,
    type: m.media_type === 'movie' ? 'movie' : 'tv', category: 'Anime',
    title: text(m.title, 'Sin título'), original: m.alternative_titles?.ja || m.title,
    year: Number(start.slice(0, 4)) || 0,
    genre: m.genres?.map((genre: any) => genre.name).filter(Boolean).join(' · ') || 'No disponible',
    duration: m.average_episode_duration ? `${Math.round(m.average_episode_duration / 60)} min por episodio` : 'No disponible',
    score: Number(m.mean) || 0, director: 'No disponible', country: 'No disponible',
    synopsis: text(m.synopsis, 'Sin sinopsis disponible.'),
    poster: m.main_picture?.large || m.main_picture?.medium || '',
    studio: m.studios?.map((s: any)=>s.name).join(' · ') || undefined,
    cast: [], episodeCount: m.num_episodes || undefined,
    airingStatus: m.status || undefined, sourceUrl: `https://myanimelist.net/anime/${m.id}`,
    color: '#5e8073', retrievedAt: new Date().toISOString(),
  };
}

export function fromKitsu(m: any): Film {
  const a = m.attributes || {};
  return {
    id: `kitsu-${m.id}`, tmdb: 0, kitsu: Number(m.id), source: 'kitsu', remote: true,
    type: a.subtype === 'movie' ? 'movie' : 'tv', category: 'Anime',
    title: text(a.titles?.en || a.canonicalTitle, 'Sin título'),
    original: a.titles?.ja_jp || a.titles?.en_jp || a.canonicalTitle,
    year: Number(String(a.startDate || '').slice(0, 4)) || 0,
    genre: 'No disponible', duration: a.episodeLength ? `${a.episodeLength} min` : 'No disponible',
    score: Math.round((Number(a.averageRating) || 0) * 10) / 100,
    director: 'No disponible', country: 'No disponible',
    synopsis: text(a.synopsis, 'Sin sinopsis disponible.'),
    poster: a.posterImage?.large || a.posterImage?.original || '',
    backdrop: a.coverImage?.large || a.coverImage?.original || undefined,
    trailer: a.youtubeVideoId || undefined, cast: [],
    episodeCount: a.episodeCount || undefined, airingStatus: a.status || undefined,
    sourceUrl: `https://kitsu.app/anime/${m.id}`, color: '#5e8073',
    retrievedAt: new Date().toISOString(),
  };
}
