import snapshot from "../data/catalog.json" with { type: "json" };
export type Category = "Películas" | "Series" | "Anime" | "K-dramas";
export type Film = {
  id: string;
  tmdb: number;
  mal?: number;
  tvdb?: number;
  source?: "tmdb" | "jikan";
  retrievedAt?: string;
  episodeCount?: number;
  airingStatus?: string;
  sourceUrl?: string;
  type: "movie" | "tv";
  title: string;
  original?: string;
  year: number;
  category: Category;
  genre: string;
  duration: string;
  score: number;
  director: string;
  country: string;
  synopsis: string;
  poster: string;
  backdrop?: string;
  trailer?: string;
  cast: string[];
  seasons?: number;
  studio?: string;
  color: string;
  remote?: boolean;
};
export const films: Film[] = snapshot as Film[];
export const getFilm = (id: string) =>
  films.find((f) => f.id === id) || films[0];
export const image = (f: Film, kind: "poster" | "backdrop" = "poster") => {
  const src = f[kind] || f.poster;
  if (!src) return "/placeholder.svg";
  if (/^https:\/\//.test(src)) return src;
  return `https://image.tmdb.org/t/p/${kind === "poster" ? "w500" : "w1280"}/${src}`;
};
export const sourceLink = (f: Film) => f.source === "jikan" ? `https://myanimelist.net/anime/${f.mal}` : `https://www.themoviedb.org/${f.type}/${f.tmdb}`;
export const registerFilms = (incoming: Film[]) => {
  for (const f of incoming) {
    const i = films.findIndex((v) => v.id === f.id);
    if (i < 0) films.push(f);
    else if (f.remote) films[i] = { ...films[i], ...f };
  }
};
const genres: Record<number, string> = {
  28: "Acción",
  12: "Aventura",
  16: "Animación",
  35: "Comedia",
  18: "Drama",
  14: "Fantasía",
  27: "Terror",
  10749: "Romance",
  878: "Ciencia ficción",
  53: "Suspenso",
  10765: "Ciencia ficción",
  10759: "Acción",
};
export function fromTMDB(m: any, typeHint: "movie" | "tv" = "movie"): Film {
  const type = m.media_type === "movie" ? "movie" : m.media_type === "tv" || (m.name && !m.title) ? "tv" : typeHint,
    existing = films.find((f) => f.tmdb === m.id && f.type === type),
    genreIds = m.genre_ids || m.genres?.map((g: any) => g.id) || [];
  const category: Category =
    m.original_language === "ja" && genreIds.includes(16)
      ? "Anime"
      : m.original_language === "ko" && type === "tv"
        ? "K-dramas"
        : type === "tv"
          ? "Series"
          : "Películas";
  const minutes = m.runtime,
    video = m.videos?.results
      ?.filter((v: any) => v.site === "YouTube" && v.type === "Trailer")
      .sort(
        (a: any, b: any) =>
          Number(b.official) - Number(a.official) ||
          Number(b.iso_639_1 === "es") - Number(a.iso_639_1 === "es"),
      )[0];
  return {
    id: existing?.id || `${type}-${m.id}`,
    tmdb: m.id,
    type,
    title: m.title || m.name || "Sin título",
    original: m.original_title || m.original_name,
    year: Number((m.release_date || m.first_air_date || "").slice(0, 4)) || 0,
    category,
    genre: m.genres?.[0]?.name || genres[genreIds[0]] || "Sin clasificar",
    duration: minutes
      ? `${Math.floor(minutes / 60)} h ${minutes % 60} min`
      : m.number_of_seasons
        ? `${m.number_of_seasons} temporadas`
        : "Duración por confirmar",
    score: Math.round((m.vote_average || 0) * 10) / 10,
    director:
      m.credits?.crew?.find((c: any) => c.job === "Director")?.name ||
      m.created_by?.map((p: any) => p.name).join(" · ") ||
      existing?.director ||
      "Por confirmar",
    country:
      m.production_countries?.[0]?.name ||
      m.origin_country?.[0] ||
      "Por confirmar",
    synopsis:
      m.overview || "Todavía no hay una sinopsis disponible en español.",
    poster: m.poster_path || "",
    backdrop: m.backdrop_path || undefined,
    trailer: video?.key || existing?.trailer,
    cast:
      m.credits?.cast?.slice(0, 8).map((c: any) => c.name) ||
      existing?.cast ||
      [],
    seasons: m.number_of_seasons,
    studio: m.production_companies?.[0]?.name,
    color: existing?.color || "#455e63",
    remote: true,
    source: "tmdb",
    retrievedAt: new Date().toISOString(),
    tvdb: m.external_ids?.tvdb_id || existing?.tvdb,
  };
}
export const statuses: Record<string, string> = {
  planned: "Por ver",
  watching: "Viendo",
  completed: "Terminadas",
  paused: "En pausa",
  dropped: "Abandonadas",
};
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export const matches = (f: Film, q: string) =>
  normalize(
    [f.title, f.original, f.director, f.genre, f.country, ...f.cast].join(" "),
  ).includes(normalize(q));
