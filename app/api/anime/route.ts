import { env } from 'cloudflare:workers';
import { fromJikan } from '@/lib/jikan';
import { cachedFetch } from '@/lib/upstream';
import { GET as tmdbCatalog } from '../catalog/route';
export async function GET(request: Request) {
  const u=new URL(request.url), q=(u.searchParams.get('q')||'').trim(), action=u.searchParams.get('action')||'top';
  const id=u.searchParams.get('id')||'', page=u.searchParams.get('page')||'1';
  if(q.length>100 || (q.length>0 && q.length<2) || !/^[1-9]\d{0,2}$/.test(page) || !['top','search','season','movies','details','episodes'].includes(action) || (['details','episodes'].includes(action)&& !/^[1-9]\d{0,8}$/.test(id))) return Response.json({error:'Consulta de anime inválida'},{status:400});
  const path=action==='details'?`anime/${id}/full`:action==='episodes'?`anime/${id}/episodes`:q?'anime':action==='season'?'seasons/now':action==='movies'?'anime':'top/anime';
  const target=new URL(`https://api.jikan.moe/v4/${path}`);
  target.searchParams.set('sfw','true');
  if(!['details','episodes'].includes(action)) target.searchParams.set('limit','24');
  if(action!=='details') target.searchParams.set('page',page);
  if(q) target.searchParams.set('q',q);
  if(action==='movies'){target.searchParams.set('type','movie'); target.searchParams.set('order_by','score'); target.searchParams.set('sort','desc');}
  const fallback = async (status = 503) => {
    if(['details','episodes'].includes(action))return Response.json({error:'Jikan no responde. Inténtalo de nuevo más tarde.'},{status});
    const params=new URLSearchParams({action:q?'search':'discover',query:q,category:'Anime',type:action==='movies'?'movie':'tv',page});
    const response=await tmdbCatalog(new Request(`${u.origin}/api/catalog?${params}`));
    if(!response.ok)return Response.json({error:'Los catálogos de anime no están disponibles temporalmente.'},{status:503});
    const data:any=await response.json();
    return Response.json({...data,results:data.results.filter((f:any)=>f.category==='Anime'),source:'tmdb',notice:'Jikan no está disponible. Mostramos anime de TMDB; los datos especializados volverán cuando responda Jikan.'});
  };
  try {
    const gateway=(env as unknown as {JIKAN_GATEWAY?:DurableObjectNamespace}).JIKAN_GATEWAY;
    const response=gateway?await gateway.get(gateway.idFromName('global')).fetch(target):await cachedFetch(target.toString());
    if(!response.ok) return fallback(response.status===429?429:502);
    const d:any=await response.json();
    if(action==='details' && d.data?.genres?.some((g:any)=>g.id===12)) return Response.json({error:'Título no disponible'},{status:404});
    const result=action==='details'?{film:fromJikan(d.data)}:action==='episodes'?{episodes:(d.data||[]).map((e:any)=>({episode_number:e.mal_id,name:e.title,overview:e.title_japanese||'',air_date:e.aired})),hasNext:d.pagination?.has_next_page}:{results:(d.data||[]).map(fromJikan),total_pages:d.pagination?.last_visible_page||1,page:Number(page)};
    return Response.json({...result,configured:true,source:'jikan'},{headers:{'Cache-Control':'public, max-age=300'}});
  }catch{return fallback();}
}
