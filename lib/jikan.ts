import type { Film } from './catalog';
export function fromJikan(m: any): Film {
  return {
    id: `mal-${m.mal_id}`, tmdb: 0, mal: m.mal_id, source: 'jikan',
    type: m.type === 'Movie' ? 'movie' : 'tv', category: 'Anime',
    title: m.title_english || m.title, original: m.title_japanese || m.title,
    year: m.year || m.aired?.prop?.from?.year || 0,
    genre: m.genres?.map((g: any) => g.name).join(' · ') || 'No disponible',
    duration: m.duration || 'No disponible', score: m.score || 0,
    director: 'No disponible', country: 'No disponible',
    synopsis: m.synopsis || 'Sin sinopsis disponible.',
    poster: m.images?.webp?.large_image_url || m.images?.jpg?.large_image_url || '',
    backdrop: m.trailer?.images?.maximum_image_url || undefined,
    trailer: m.trailer?.youtube_id || undefined,
    cast: [], studio: m.studios?.map((s: any) => s.name).join(' · '),
    episodeCount: m.episodes, airingStatus: m.status, sourceUrl: m.url,
    color: '#42454b', remote: true, retrievedAt: new Date().toISOString(),
  };
}
