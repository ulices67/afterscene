import { DurableObject } from 'cloudflare:workers';
// One named object coordinates all users and locations. A conservative rolling
// budget stays below Jikan's 3/sec and 60/min; cached results do not spend it.
export class JikanGateway extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.hostname !== 'api.jikan.moe' || !url.pathname.startsWith('/v4/')) return new Response(null,{status:400});
    const key = url.pathname + url.search;
    const cached = await this.ctx.storage.get<{expires:number;body:string}>(key);
    if(cached && cached.expires>Date.now()) return new Response(cached.body,{headers:{'Content-Type':'application/json'}});
    const allowed = await this.ctx.blockConcurrencyWhile(async () => {
      const now=Date.now();
      const blockedUntil=await this.ctx.storage.get<number>('blockedUntil') || 0;
      const recent=(await this.ctx.storage.get<number[]>('budget')||[]).filter(t=>now-t<60000);
      if(now<blockedUntil || recent.length>=55 || recent.filter(t=>now-t<1000).length>=2) return false;
      await this.ctx.storage.put('budget',[...recent,now]);
      return true;
    });
    if(!allowed) return Response.json({error:'El catálogo de anime está ocupado. Intenta de nuevo en un momento.'},{status:429,headers:{'Retry-After':'30'}});
    const response=await fetch(url,{signal:AbortSignal.timeout(12000)});
    if(response.status===429) await this.ctx.storage.put('blockedUntil',Date.now()+60000);
    if(response.ok){
      await this.ctx.storage.put(key,{expires:Date.now()+3600000,body:await response.clone().text()});
      if(!await this.ctx.storage.getAlarm()) await this.ctx.storage.setAlarm(Date.now()+3600000);
    }
    return response;
  }
  async alarm(){
    const entries=await this.ctx.storage.list<{expires?:number}>();
    for(const [key,value] of entries) if(value?.expires && value.expires<Date.now()) await this.ctx.storage.delete(key);
    if(entries.size>2) await this.ctx.storage.setAlarm(Date.now()+3600000);
  }
}
