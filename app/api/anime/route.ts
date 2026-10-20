import { fromKitsu, fromMAL } from '@/lib/anime-providers';
import { cachedFetch } from '@/lib/upstream';
import { setting } from '@/lib/server-config';
import { GET as tmdbCatalog } from '../catalog/route';

const malFields = 'id,title,main_picture,alternative_titles,start_date,synopsis,mean,media_type,status,num_episodes,genres,average_episode_duration,studios';
const currentSeason = () => {
  const now = new Date();
  const month = Number(new Intl.DateTimeFormat('en-US', {timeZone:'Asia/Tokyo',month:'numeric'}).format(now));
  const year = Number(new Intl.DateTimeFormat('en-US', {timeZone:'Asia/Tokyo',year:'numeric'}).format(now));
  return {year,season:['winter','spring','summer','fall'][Math.floor((month-1)/3)]};
};
async function queryMAL(action:string,q:string,id:string,page:number) {
  const clientId=setting('MAL_CLIENT_ID');
  if(!clientId) throw Error('MAL sin configurar');
  const now=currentSeason();
  const path=action==='details'?`anime/${id}`:action==='search'?'anime':action==='season'?`anime/seasonal/${now.year}/${now.season}`:'anime/ranking';
  const url=new URL(`https://api.myanimelist.net/v2/${path}`);
  url.searchParams.set('fields',malFields);
  if(action==='search') url.searchParams.set('q',q);
  if(action==='top'||action==='movies') url.searchParams.set('ranking_type',action==='movies'?'movie':'all');
  if(action!=='details'){url.searchParams.set('limit','24');url.searchParams.set('offset',String((page-1)*24));}
  const response=await cachedFetch(url.toString(),{headers:{'X-MAL-CLIENT-ID':clientId},signal:AbortSignal.timeout(8500)});
  if(!response.ok) throw Error(`MyAnimeList ${response.status}`);
  const data:any=await response.json();
  if(action==='details') return {film:fromMAL(data)};
  return {results:(data.data||[]).map(fromMAL),total_pages:data.paging?.next?page+1:page,page};
}
async function queryKitsu(action:string,q:string,id:string,page:number) {
  const root='https://kitsu.io/api/edge';
  const url=new URL(`${root}/${action==='episodes'?`anime/${id}/episodes`:action==='details'?`anime/${id}`:action==='top'?'trending/anime':'anime'}`);
  const offset=(page-1)*20;
  if(action==='details') url.searchParams.set('include','categories,characters.character');
  if(action==='episodes') url.searchParams.set('sort','number');
  if(action==='search') url.searchParams.set('filter[text]',q);
  if(action==='movies') {url.searchParams.set('filter[subtype]','movie');url.searchParams.set('sort','-averageRating');}
  if(action==='season') {const now=currentSeason();url.searchParams.set('filter[seasonYear]',String(now.year));url.searchParams.set('filter[season]',now.season);url.searchParams.set('sort','-averageRating');}
  if(action!=='details'){url.searchParams.set('page[limit]','20');url.searchParams.set('page[offset]',String(offset));}
  const response=await cachedFetch(url.toString(),{headers:{Accept:'application/vnd.api+json'},signal:AbortSignal.timeout(8500)});
  if(!response.ok) throw Error(`Kitsu ${response.status}`);
  const data:any=await response.json();
  if(action==='details') {if(data.data?.attributes?.nsfw || data.data?.attributes?.ageRating==='R18') throw Error('Contenido no disponible');const film=fromKitsu(data.data);film.genre=(data.included||[]).filter((v:any)=>v.type==='categories').map((v:any)=>v.attributes.title).slice(0,8).join(' · ')||film.genre;film.characters=(data.included||[]).filter((v:any)=>v.type==='characters').slice(0,30).map((v:any)=>({id:v.id,name:v.attributes.canonicalName,photo:v.attributes.image?.original||v.attributes.image?.large||'',description:(v.attributes.description||'').replace(/<[^>]*>/g,'')}));return {film};}
  if(action==='episodes') return {episodes:(data.data||[]).map((e:any)=>({episode_number:e.attributes?.number,name:e.attributes?.canonicalTitle||e.attributes?.titles?.en_jp||`Episodio ${e.attributes?.number}`,overview:e.attributes?.synopsis||'',air_date:e.attributes?.airdate||''})),hasNext:!!data.links?.next};
  const results=(data.data||[]).filter((e:any)=>!e.attributes?.nsfw && e.attributes?.ageRating!=='R18').map(fromKitsu);
  return {results,total_pages:data.links?.next?page+1:page,page};
}
export async function GET(request:Request) {
  const url=new URL(request.url), action=url.searchParams.get('action')||'top',
    q=(url.searchParams.get('q')||'').trim(), id=url.searchParams.get('id')||'',
    page=Number(url.searchParams.get('page')||1), source=url.searchParams.get('source')||'mal';
  if(!['top','search','season','movies','details','episodes'].includes(action) || !Number.isInteger(page) || page<1 || page>500 || q.length>100 || (action==='search'&&q.length<2) || (['details','episodes'].includes(action)&&!/^[1-9]\d{0,8}$/.test(id)) || !['mal','kitsu','jikan'].includes(source)) return Response.json({error:'Consulta de anime inválida'},{status:400});
  try {
    const useKitsu=source==='kitsu'||action==='episodes'||action==='season';
    const data=useKitsu?await queryKitsu(action,q,id,page):await queryMAL(action,q,id,page);
    return Response.json({...data,configured:true,source:useKitsu?'kitsu':'mal'},{headers:{'Cache-Control':'public, max-age=300'}});
  }catch {
    if(['details','episodes'].includes(action)) return Response.json({error:'La fuente de anime no responde ahora mismo.'},{status:503});
    if(source!=='kitsu' && action!=='season') try {
      const data=await queryKitsu(action,q,id,page);
      return Response.json({...data,configured:true,source:'kitsu',notice:'MyAnimeList no respondió. Mostramos información real de Kitsu.'},{headers:{'Cache-Control':'public, max-age=300'}});
    }catch{}
    const params=new URLSearchParams({action:q?'search':'discover',query:q,category:'Anime',type:action==='movies'?'movie':'tv',page:String(page)});
    const response=await tmdbCatalog(new Request(`${url.origin}/api/catalog?${params}`));
    if(!response.ok)return Response.json({error:'Los catálogos de anime no están disponibles temporalmente.'},{status:503});
    const data:any=await response.json();
    return Response.json({...data,results:data.results.filter((film:any)=>film.category==='Anime'),source:'tmdb',notice:'MyAnimeList y Kitsu no respondieron. Mostramos anime de TMDB.'});
  }
}
