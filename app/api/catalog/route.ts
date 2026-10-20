import { films, matches, fromTMDB } from "@/lib/catalog";
import { cachedFetch } from "@/lib/upstream";
import { setting } from "@/lib/server-config";
export async function GET(request: Request) {
  const u = new URL(request.url),
    action = u.searchParams.get("action") || "search",
    q = (u.searchParams.get("query") || "").slice(0, 150),
    type = u.searchParams.get("type") === "tv" ? "tv" : "movie",
    id = u.searchParams.get("id") || "",
    season = u.searchParams.get("season") || "1";
  if (!["search", "discover", "details", "season", "videos", "recommendations"].includes(action))
    return Response.json({ error: "Consulta no admitida" }, { status: 400 });
  if (
    ["details", "season", "videos", "recommendations"].includes(action) &&
    !/^\d{1,10}$/.test(id)
  )
    return Response.json({ error: "Identificador inválido" }, { status: 400 });
  if (action === "season" && !/^\d{1,3}$/.test(season))
    return Response.json({ error: "Temporada inválida" }, { status: 400 });
  const token = setting("TMDB_READ_ACCESS_TOKEN");
  if (!token) return Response.json({error:"TMDB no está configurado"},{status:503});
  const path =
    action === "search"
      ? "search/multi"
      : action === "discover"
        ? `discover/${type}`
        : action === "season"
          ? `tv/${id}/season/${season}`
          : action === "recommendations"
            ? `${type}/${id}/recommendations`
          : action === "videos"
            ? `${type}/${id}/videos`
            : `${type}/${id}`;
  const target = new URL(`https://api.themoviedb.org/3/${u.searchParams.get("category") === "Tendencias" ? "trending/all/week" : path}`);
  target.searchParams.set("language", "es-MX");
  target.searchParams.set("include_adult", "false");
  if (action === "search") target.searchParams.set("query", q);
  if (action === "details")
    target.searchParams.set(
      "append_to_response",
      "credits,videos,watch/providers,recommendations,external_ids",
    );
  const page = u.searchParams.get("page") || "1";
  if (!/^\d{1,3}$/.test(page))
    return Response.json({ error: "Página inválida" }, { status: 400 });
  target.searchParams.set("page", String(Math.min(Number(page), 500)));
  const category = u.searchParams.get("category");
  if (action === "discover" && category === "Anime") {
    target.searchParams.set("with_genres", "16");
    target.searchParams.set("with_original_language", "ja");
  }
  if (action === "discover" && category === "K-dramas")
    target.searchParams.set("with_origin_country", "KR");
  if (action === "discover" && type === "movie" && u.searchParams.get("upcoming") === "true") {
    const start = new Date(), end = new Date(start);
    end.setDate(end.getDate() + 60);
    target.searchParams.set("primary_release_date.gte", start.toISOString().slice(0,10));
    target.searchParams.set("primary_release_date.lte", end.toISOString().slice(0,10));
    target.searchParams.set("sort_by", "popularity.desc");
  }
  try {
    const response = await cachedFetch(target.toString(), {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      return Response.json(
        { error: "El catálogo no está disponible temporalmente" },
        { status: 502 },
      );
    const data: any = await response.json();
    const result =
      action === "details"
        ? { film: fromTMDB(data, type), configured: true }
        : ["search", "discover", "recommendations"].includes(action)
          ? {
              results: (data.results || [])
                .flatMap((m: any) =>
                  m.media_type === "person" ? m.known_for || [] : [m],
                )
                .map((m: any) => fromTMDB(m, type)),
              total_pages: data.total_pages,
              page: data.page,
              configured: true,
            }
          : { ...data, configured: true };
    return Response.json({...result, source:"tmdb"}, {
      headers: { "Cache-Control": "private, max-age=300" },
    });
  } catch {
    return Response.json(
      { error: "No se pudo conectar con el catálogo" },
      { status: 503 },
    );
  }
}
