export type Category = "Películas" | "Series" | "Anime" | "K-dramas";
export type Film = {
  id: string;
  tmdb: number;
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
export const films: Film[] = [
  {
    id: "interstellar",
    tmdb: 157336,
    type: "movie",
    title: "Interstellar",
    year: 2014,
    category: "Películas",
    genre: "Ciencia ficción",
    duration: "2 h 49 min",
    score: 8.4,
    director: "Christopher Nolan",
    country: "Estados Unidos",
    synopsis:
      "Un grupo de exploradores viaja más allá de esta galaxia para descubrir si la humanidad tiene un futuro entre las estrellas. Una historia sobre el tiempo, la distancia y aquello que nos une.",
    poster: "gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    trailer: "zSWdZVtXT7E",
    cast: [
      "Matthew McConaughey",
      "Anne Hathaway",
      "Jessica Chastain",
      "Michael Caine",
    ],
    color: "#546e79",
  },
  {
    id: "dune-2",
    tmdb: 693134,
    type: "movie",
    title: "Dune: Parte Dos",
    original: "Dune: Part Two",
    year: 2024,
    category: "Películas",
    genre: "Ciencia ficción",
    duration: "2 h 46 min",
    score: 8.1,
    director: "Denis Villeneuve",
    country: "Estados Unidos",
    synopsis:
      "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra quienes destruyeron a su familia. Entre el amor y el destino del universo, deberá evitar un futuro que solo él puede prever.",
    poster: "1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop: "xOMo8BRK7PfcJvBg7Y1GyZpDS7M.jpg",
    trailer: "Way9Dexny3w",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
    color: "#8f5c32",
  },
  {
    id: "oppenheimer",
    tmdb: 872585,
    type: "movie",
    title: "Oppenheimer",
    year: 2023,
    category: "Películas",
    genre: "Drama",
    duration: "3 h",
    score: 8.1,
    director: "Christopher Nolan",
    country: "Estados Unidos",
    synopsis:
      "Durante la Segunda Guerra Mundial, J. Robert Oppenheimer dirige el Proyecto Manhattan. Su descubrimiento cambiará el mundo y lo enfrentará a las consecuencias de su propia creación.",
    poster: "ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
    backdrop: "fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    trailer: "uYPbbksJxIg",
    cast: [
      "Cillian Murphy",
      "Emily Blunt",
      "Robert Downey Jr.",
      "Florence Pugh",
    ],
    color: "#9a4c25",
  },
  {
    id: "last-of-us",
    tmdb: 100088,
    type: "tv",
    title: "The Last of Us",
    year: 2023,
    category: "Series",
    genre: "Drama",
    duration: "2 temporadas",
    score: 8.5,
    director: "Craig Mazin · Neil Druckmann",
    country: "Estados Unidos",
    synopsis:
      "Veinte años después de la caída de la civilización, Joel debe sacar a Ellie de una zona de cuarentena. Un trabajo se convierte en un viaje que cambiará sus vidas.",
    poster: "uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    backdrop: "uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    trailer: "uLtkt8BonwM",
    cast: ["Pedro Pascal", "Bella Ramsey", "Gabriel Luna", "Anna Torv"],
    seasons: 2,
    color: "#4f6655",
  },
  {
    id: "poor-things",
    tmdb: 792307,
    type: "movie",
    title: "Pobres criaturas",
    original: "Poor Things",
    year: 2023,
    category: "Películas",
    genre: "Fantasía",
    duration: "2 h 22 min",
    score: 7.7,
    director: "Yorgos Lanthimos",
    country: "Reino Unido",
    synopsis:
      "Bella Baxter regresa a la vida gracias a un científico poco convencional. Libre de prejuicios, emprende un viaje de descubrimiento y emancipación.",
    poster: "kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    cast: ["Emma Stone", "Mark Ruffalo", "Willem Dafoe"],
    color: "#716b86",
  },
  {
    id: "spiderverse",
    tmdb: 569094,
    type: "movie",
    title: "Spider-Man: A través del Spider-Verso",
    year: 2023,
    category: "Películas",
    genre: "Animación",
    duration: "2 h 20 min",
    score: 8.3,
    director: "Joaquim Dos Santos",
    country: "Estados Unidos",
    synopsis:
      "Miles Morales conoce a un equipo de Spider-People encargado de proteger el Multiverso. Tendrá que definir qué significa ser un héroe.",
    poster: "8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    trailer: "cqGjhVJWtEg",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
    color: "#803760",
  },
  {
    id: "batman",
    tmdb: 414906,
    type: "movie",
    title: "The Batman",
    year: 2022,
    category: "Películas",
    genre: "Suspenso",
    duration: "2 h 56 min",
    score: 7.7,
    director: "Matt Reeves",
    country: "Estados Unidos",
    synopsis:
      "Un asesino obliga a Batman a investigar la corrupción de Gotham y a cuestionar el legado de su familia.",
    poster: "74xTEgt7R36Fpooo50r9T25onhq.jpg",
    trailer: "mqqft2x_Aa4",
    cast: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano"],
    color: "#8f2d25",
  },
  {
    id: "past-lives",
    tmdb: 666277,
    type: "movie",
    title: "Vidas pasadas",
    original: "Past Lives",
    year: 2023,
    category: "Películas",
    genre: "Romance",
    duration: "1 h 46 min",
    score: 7.7,
    director: "Celine Song",
    country: "Estados Unidos",
    synopsis:
      "Dos amigos de la infancia se reencuentran veinte años después en Nueva York. Una semana para pensar en el destino y las decisiones que construyen una vida.",
    poster: "k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
    trailer: "kA244xewjcI",
    cast: ["Greta Lee", "Teo Yoo", "John Magaro"],
    color: "#596a54",
  },
  {
    id: "your-name",
    tmdb: 372058,
    type: "movie",
    title: "Your Name",
    original: "君の名は。",
    year: 2016,
    category: "Anime",
    genre: "Romance",
    duration: "1 h 46 min",
    score: 8.5,
    director: "Makoto Shinkai",
    country: "Japón",
    synopsis:
      "Mitsuha y Taki despiertan en el cuerpo del otro. Su conexión desafía la distancia y el tiempo, hasta que ambos deciden encontrarse.",
    poster: "q719jXXEzOoYaps6babgKnONONX.jpg",
    trailer: "xU47nhruN-Q",
    cast: ["Ryunosuke Kamiki", "Mone Kamishiraishi"],
    studio: "CoMix Wave Films",
    color: "#465d8f",
  },
  {
    id: "lalaland",
    tmdb: 313369,
    type: "movie",
    title: "La La Land",
    year: 2016,
    category: "Películas",
    genre: "Romance",
    duration: "2 h 8 min",
    score: 7.9,
    director: "Damien Chazelle",
    country: "Estados Unidos",
    synopsis:
      "Una aspirante a actriz y un músico de jazz se enamoran en Los Ángeles mientras persiguen sus sueños.",
    poster: "uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    trailer: "0pdqf4P9MB8",
    cast: ["Emma Stone", "Ryan Gosling", "John Legend"],
    color: "#614979",
  },
  {
    id: "arrival",
    tmdb: 329865,
    type: "movie",
    title: "La llegada",
    original: "Arrival",
    year: 2016,
    category: "Películas",
    genre: "Ciencia ficción",
    duration: "1 h 56 min",
    score: 7.6,
    director: "Denis Villeneuve",
    country: "Estados Unidos",
    synopsis:
      "Cuando unas naves llegan a la Tierra, una lingüista intenta comprender su lenguaje antes de que el miedo divida a la humanidad.",
    poster: "x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    trailer: "tFMo3UJ4B4g",
    cast: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"],
    color: "#536369",
  },
  {
    id: "blade-runner",
    tmdb: 335984,
    type: "movie",
    title: "Blade Runner 2049",
    year: 2017,
    category: "Películas",
    genre: "Ciencia ficción",
    duration: "2 h 44 min",
    score: 7.6,
    director: "Denis Villeneuve",
    country: "Estados Unidos",
    synopsis:
      "El agente K descubre un secreto que podría sumir a la sociedad en el caos. Su investigación lo lleva hasta un antiguo blade runner.",
    poster: "gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    trailer: "gCcx85zbxz4",
    cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"],
    color: "#926837",
  },
  {
    id: "spirited-away",
    tmdb: 129,
    type: "movie",
    title: "El viaje de Chihiro",
    year: 2001,
    category: "Anime",
    genre: "Fantasía",
    duration: "2 h 5 min",
    score: 8.5,
    director: "Hayao Miyazaki",
    country: "Japón",
    synopsis:
      "Chihiro entra en un mundo de espíritus, donde deberá encontrar su valentía y recordar quién es para salvar a sus padres.",
    poster: "39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    trailer: "ByXuk9QqQkk",
    cast: ["Rumi Hiiragi", "Miyu Irino"],
    studio: "Studio Ghibli",
    color: "#4b766b",
  },
  {
    id: "attack-on-titan",
    tmdb: 1429,
    type: "tv",
    title: "Attack on Titan",
    year: 2013,
    category: "Anime",
    genre: "Acción",
    duration: "4 temporadas",
    score: 8.7,
    director: "Tetsurō Araki",
    country: "Japón",
    synopsis:
      "Tras la destrucción de su hogar, Eren se une al ejército para luchar contra los titanes. Más allá de los muros, cada respuesta abre una nueva pregunta.",
    poster: "hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
    cast: ["Yuki Kaji", "Yui Ishikawa", "Marina Inoue"],
    seasons: 4,
    studio: "Wit Studio · MAPPA",
    color: "#785942",
  },
  {
    id: "demon-slayer",
    tmdb: 85937,
    type: "tv",
    title: "Demon Slayer",
    year: 2019,
    category: "Anime",
    genre: "Acción",
    duration: "5 temporadas",
    score: 8.7,
    director: "Haruo Sotozaki",
    country: "Japón",
    synopsis:
      "Tanjiro se convierte en cazador de demonios para devolver la humanidad a su hermana y proteger a otras familias.",
    poster: "xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
    cast: ["Natsuki Hanae", "Akari Kitō"],
    seasons: 5,
    studio: "ufotable",
    color: "#7b3932",
  },
  {
    id: "breaking-bad",
    tmdb: 1396,
    type: "tv",
    title: "Breaking Bad",
    year: 2008,
    category: "Series",
    genre: "Drama",
    duration: "5 temporadas",
    score: 8.9,
    director: "Vince Gilligan",
    country: "Estados Unidos",
    synopsis:
      "Un profesor de química se asocia con un antiguo alumno. Su decisión de asegurar el futuro de su familia lo conduce por un camino sin retorno.",
    poster: "3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",
    trailer: "HhesaQXLuRY",
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
    seasons: 5,
    color: "#7e7a32",
  },
  {
    id: "severance",
    tmdb: 95396,
    type: "tv",
    title: "Severance",
    year: 2022,
    category: "Series",
    genre: "Suspenso",
    duration: "2 temporadas",
    score: 8.7,
    director: "Dan Erickson",
    country: "Estados Unidos",
    synopsis:
      "Los empleados de Lumon separan sus recuerdos laborales de los personales. Mark empieza a sospechar que su trabajo esconde algo inquietante.",
    poster: "pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg",
    cast: ["Adam Scott", "Britt Lower", "John Turturro"],
    seasons: 2,
    color: "#4a6d71",
  },
  {
    id: "bear",
    tmdb: 136315,
    type: "tv",
    title: "The Bear",
    year: 2022,
    category: "Series",
    genre: "Drama",
    duration: "4 temporadas",
    score: 8.2,
    director: "Christopher Storer",
    country: "Estados Unidos",
    synopsis:
      "Un chef vuelve a Chicago para hacerse cargo del restaurante familiar. Entre el caos de la cocina y los vínculos de siempre, intenta empezar de nuevo.",
    poster: "sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg",
    cast: ["Jeremy Allen White", "Ayo Edebiri", "Ebon Moss-Bachrach"],
    seasons: 4,
    color: "#5a6b7a",
  },
  {
    id: "crash-landing",
    tmdb: 94796,
    type: "tv",
    title: "Crash Landing on You",
    year: 2019,
    category: "K-dramas",
    genre: "Romance",
    duration: "1 temporada",
    score: 8.6,
    director: "Lee Jung-hyo",
    country: "Corea del Sur",
    synopsis:
      "Un accidente de parapente lleva a una empresaria surcoreana a Corea del Norte. Un oficial decide ayudarla a volver a casa.",
    poster: "xJNrM2LyGOg5T8A5fZBEpwtKw10.jpg",
    cast: ["Hyun Bin", "Son Ye-jin", "Seo Ji-hye"],
    seasons: 1,
    color: "#717662",
  },
  {
    id: "goblin",
    tmdb: 67915,
    type: "tv",
    title: "Goblin",
    year: 2016,
    category: "K-dramas",
    genre: "Fantasía",
    duration: "1 temporada",
    score: 8.6,
    director: "Lee Eung-bok",
    country: "Corea del Sur",
    synopsis:
      "Un guerrero inmortal busca a la única persona capaz de terminar con su existencia. El encuentro cambiará el destino de todos.",
    poster: "yYNa1nqvNK94xZz3eKyfvZdAvuF.jpg",
    cast: ["Gong Yoo", "Kim Go-eun", "Lee Dong-wook"],
    seasons: 1,
    color: "#6b7772",
  },
  {
    id: "vincenzo",
    tmdb: 117376,
    type: "tv",
    title: "Vincenzo",
    year: 2021,
    category: "K-dramas",
    genre: "Suspenso",
    duration: "1 temporada",
    score: 8.5,
    director: "Kim Hee-won",
    country: "Corea del Sur",
    synopsis:
      "Un abogado de la mafia italiana vuelve a Corea del Sur. Junto a una abogada, se enfrenta a un conglomerado con métodos poco habituales.",
    poster: "dvXJgEDQXhL9Ouot2WkBHpQiHGd.jpg",
    cast: ["Song Joong-ki", "Jeon Yeo-been", "Ok Taec-yeon"],
    seasons: 1,
    color: "#526273",
  },
];
export const getFilm = (id: string) =>
  films.find((f) => f.id === id) || films[0];
export const image = (f: Film, kind: "poster" | "backdrop" = "poster") =>
  f.remote
    ? f[kind] || f.poster
      ? `https://image.tmdb.org/t/p/${kind === "poster" ? "w500" : "w1280"}/${f[kind] || f.poster}`
      : "/placeholder.svg"
    : `/assets/${f.id}-${kind}.jpg`;
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
  const type = m.media_type === "tv" || (m.name && !m.title) ? "tv" : typeHint,
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
