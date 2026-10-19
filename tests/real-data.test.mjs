import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed,isArchive} from '../lib/archive.ts';
import {fromJikan} from '../lib/jikan.ts';
import {fromTMDB,image} from '../lib/catalog.ts';
test('New archives contain no fabricated viewing activity or identity',()=>{
 assert.deepEqual(seed.library,{});assert.deepEqual(seed.top,[]);assert.deepEqual(seed.collections,[]);assert.deepEqual(seed.profile.four,[]);assert.equal(seed.profile.bio,'');assert.equal(seed.profile.avatar,undefined);
});
test('Profile accepts optional real photo uploads and fewer than four favorites',()=>{
 const a=structuredClone(seed);a.profile.banner='data:image/webp;base64,YWJj';a.profile.four=['interstellar'];assert.ok(isArchive(a));
 a.profile.banner='https://external.example/track';assert.equal(isArchive(a),false);
});
test('Jikan identities never pretend to be TMDB IDs and artwork URLs stay intact',()=>{
 const f=fromJikan({mal_id:20,title:'Naruto',type:'TV',images:{jpg:{large_image_url:'https://cdn.myanimelist.net/images/anime/1141/142503.jpg'}},score:8,episodes:220});
 assert.equal(f.id,'mal-20');assert.equal(f.tmdb,0);assert.equal(f.source,'jikan');assert.equal(f.episodeCount,220);assert.equal(image(f),'https://cdn.myanimelist.net/images/anime/1141/142503.jpg');assert.equal(f.country,'No disponible');
});
test('Multi search respects explicit movie type even with TV hint',()=>{
 assert.equal(fromTMDB({id:5555,media_type:'movie',title:'Fixture'},'tv').type,'movie');
});
