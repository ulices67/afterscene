"use client";
import { useState, useEffect } from "react";
import { registerFilms, type Film } from "./catalog";
export function useCatalog(query: string, category = "Todo", page = 1, animeMode = "top") {
  const [remote, setRemote] = useState<Film[] | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [totalPages, setTotalPages] = useState(1),
    [source, setSource] = useState(''), [notice,setNotice] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    if (query === "__disabled__") return () => controller.abort();
    setLoading(true);
    if(page === 1) setRemote([]);
    setError("");
    setNotice('');
    const qs = new URLSearchParams({
      action: query ? "search" : "discover",
      query,
      type: category === "Series" || category === "K-dramas" ? "tv" : "movie",
      category,
      page: String(page),
    });
    fetch(category === "Anime" ? `/api/anime?action=${query ? "search" : animeMode}&q=${encodeURIComponent(query)}&page=${page}` : `/api/catalog?${qs}`, { signal: controller.signal })
      .then(async (r) => {
        const d: any = await r.json();
        if (!r.ok) throw Error(d.error || "El catálogo no está disponible");
        if (d.configured) {
          setSource(d.source || 'tmdb');setNotice(d.notice || '');
          registerFilms(d.results);
          setRemote((v) =>
            page > 1
              ? [
                  ...(v || []),
                  ...d.results.filter(
                    (f: Film) => !v?.some((x) => x.id === f.id),
                  ),
                ]
              : d.results,
          );
          setTotalPages(d.total_pages || 1);
        } else setRemote([]);
        setLoading(false);
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setError(e.message);
          setRemote([]);
        }
      });
    return () => controller.abort();
  }, [query, category, page, animeMode]);
  return { remote, loading, error, totalPages, source, notice };
}
