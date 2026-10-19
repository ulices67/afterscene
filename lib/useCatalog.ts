"use client";
import { useState, useEffect } from "react";
import { registerFilms, type Film } from "./catalog";
export function useCatalog(query: string, category = "Todo", page = 1) {
  const [remote, setRemote] = useState<Film[] | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const controller = new AbortController();
    if (query === "__disabled__") return () => controller.abort();
    setLoading(true);
    setError("");
    const qs = new URLSearchParams({
      action: query ? "search" : "discover",
      query,
      type: category === "Series" || category === "K-dramas" ? "tv" : "movie",
      category,
      page: String(page),
    });
    fetch(`/api/catalog?${qs}`, { signal: controller.signal })
      .then(async (r) => {
        const d: any = await r.json();
        if (!r.ok) throw Error(d.error || "El catálogo no está disponible");
        if (d.configured) {
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
        } else setRemote(null);
        setLoading(false);
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setError(e.message);
          setRemote(null);
        }
      });
    return () => controller.abort();
  }, [query, category, page]);
  return { remote, loading, error, totalPages };
}
