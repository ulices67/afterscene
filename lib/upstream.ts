// Public catalog data only. Never use this cache for accounts or private archives.
const cache = new Map<string, {expires: number; body: string}>();
const inflight = new Map<string, Promise<Response>>();
export async function cachedFetch(url: string, init?: RequestInit, ttl = 3600): Promise<Response> {
  const hit = cache.get(url);
  if (hit && hit.expires > Date.now()) return new Response(hit.body, {headers:{'Content-Type':'application/json'}});
  const running = inflight.get(url);
  if (running) return (await running).clone();
  const pending = (async () => {
    const response = await fetch(url, {...init, signal: AbortSignal.timeout(12000)});
    if (response.ok) {
      const body = await response.clone().text();
      if(cache.size >= 200) cache.delete(cache.keys().next().value!);
      cache.set(url, {expires:Date.now()+ttl*1000,body});
    }
    return response;
  })();
  inflight.set(url,pending);
  try {return (await pending).clone();} finally {inflight.delete(url);}
}
