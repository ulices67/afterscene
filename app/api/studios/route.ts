import {cachedFetch} from "@/lib/upstream";
import {setting} from "@/lib/server-config";
import {fromTMDB} from "@/lib/catalog";
export async function GET(request:Request) {
  const u=new URL(request.url),q=(u.searchParams.get("q")||"").trim(),id=u.searchParams.get("id")||"",type=u.searchParams.get("type")==="tv"?"tv":"movie",page=Number(u.searchParams.get("page")||1);
  if((!id&&(q.length<2||q.length>100))||(id&&!/^[1-9]\d{0,9}$/.test(id))||!Number.isInteger(page)||page<1||page>500)return Response.json({error:"Consulta inválida"},{status:400});
  const token=setting("TMDB_READ_ACCESS_TOKEN");if(!token)return Response.json({error:"Catálogo no disponible"},{status:503});
  const target=new URL(`https://api.themoviedb.org/3/${id?`discover/${type}`:"search/company"}`);
  target.searchParams.set(id?"with_companies":"query",id||q);target.searchParams.set("page",String(page));target.searchParams.set("language","es-MX");target.searchParams.set("include_adult","false");
  try{const r=await cachedFetch(target.toString(),{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const data:any=await r.json();
    return Response.json({results:id?(data.results||[]).map((f:any)=>fromTMDB(f,type)):(data.results||[]).map((s:any)=>({id:s.id,name:s.name,country:s.origin_country,logo:s.logo_path?`https://image.tmdb.org/t/p/w185${s.logo_path}`:""})),total_pages:data.total_pages,page},{headers:{"Cache-Control":"public, max-age=300"}});
  }catch{return Response.json({error:"No se pudo consultar los estudios"},{status:503});}
}
