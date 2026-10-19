import {readFile,mkdir,writeFile} from 'node:fs/promises';
const source=await readFile('lib/catalog.ts','utf8');
await mkdir('public/assets',{recursive:true});
const rows=[...source.matchAll(/id:'([^']+)'[^\n]+poster:'([^']+)'(?:,backdrop:'([^']+)')?/g)];
const failed=[];
await Promise.all(rows.map(async([_,id,poster,backdrop])=>{
for(const [kind,file] of [['poster',poster],['backdrop',backdrop||poster]]){
try{const r=await fetch(`https://image.tmdb.org/t/p/${kind==='poster'?'w500':'w1280'}/${file}`);if(!r.ok)throw Error(String(r.status));await writeFile(`public/assets/${id}-${kind}.jpg`,Buffer.from(await r.arrayBuffer()));}catch(e){failed.push({id,kind,file,error:e.message});}
}}));
console.log(JSON.stringify({downloaded:rows.length*2-failed.length,failed},null,2));
