import { setting } from '@/lib/server-config';
import { cachedFetch } from '@/lib/upstream';
let auth: {token:string;expires:number}|null=null;
let authenticating: Promise<string>|null=null;
async function token(){
  if(auth && auth.expires>Date.now())return auth.token;
  if(authenticating)return authenticating;
  authenticating=(async()=>{
    const response=await fetch('https://api4.thetvdb.com/v4/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({apikey:setting('THETVDB_API_KEY')}),signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw Error('TVDB login');
    const d:any=await response.json();
    if(!d.data?.token)throw Error('TVDB token');
    auth={token:d.data.token,expires:Date.now()+86400000};return auth.token;
  })();
  try{return await authenticating;}finally{authenticating=null;}
}
export async function GET(request:Request){
  const id=new URL(request.url).searchParams.get('id')||'';
  if(!/^[1-9]\d{0,9}$/.test(id))return Response.json({error:'ID inválido'},{status:400});
  if(!setting('THETVDB_API_KEY'))return Response.json({error:'TheTVDB no está configurado'},{status:503});
  try{
    const r=await cachedFetch(`https://api4.thetvdb.com/v4/series/${id}/extended`,{headers:{Authorization:`Bearer ${await token()}`}});
    if(!r.ok){if(r.status===401)auth=null;return Response.json({error:'No se pudo consultar TheTVDB'},{status:502});}
    const d:any=((await r.json()) as any).data;
    return Response.json({id:d.id,name:d.name,status:d.status?.name,firstAired:d.firstAired,lastAired:d.lastAired,network:d.originalNetwork?.name,sourceUrl:`https://thetvdb.com/series/${d.slug}`,source:'thetvdb'},{headers:{'Cache-Control':'public, max-age=3600'}});
  }catch{return Response.json({error:'TheTVDB no responde'},{status:503});}
}
