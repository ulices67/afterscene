import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed,isArchive} from '../lib/archive.ts';
import {fromMAL,fromKitsu} from '../lib/anime-providers.ts';
import {fromTMDB,image} from '../lib/catalog.ts';
test('New archives contain no fabricated viewing activity or identity',()=>{
 assert.deepEqual(seed.library,{});assert.deepEqual(seed.top,[]);assert.deepEqual(seed.collections,[]);assert.deepEqual(seed.profile.four,[]);assert.equal(seed.profile.bio,'');assert.equal(seed.profile.avatar,undefined);
});
test('Profile accepts optional real photo uploads and fewer than four favorites',()=>{
 const a=structuredClone(seed);a.profile.banner='data:image/webp;base64,YWJj';a.profile.four=['interstellar'];assert.ok(isArchive(a));
 a.profile.banner='https://external.example/track';assert.equal(isArchive(a),false);
});
test('MAL and Kitsu keep distinct real identities and direct artwork',()=>{
 const mal=fromMAL({id:20,title:'Naruto',media_type:'tv',main_picture:{large:'https://cdn.myanimelist.net/images/anime/1141/142503.jpg'},mean:8,num_episodes:220});
 const kitsu=fromKitsu({id:'176',attributes:{canonicalTitle:'Spirited Away',subtype:'movie',posterImage:{large:'https://media.kitsu.app/anime/poster_images/176/large.jpg'},averageRating:'82.73'}});
 assert.equal(mal.id,'mal-20');assert.equal(mal.tmdb,0);assert.equal(mal.source,'mal');assert.equal(mal.episodeCount,220);assert.equal(image(mal),'https://cdn.myanimelist.net/images/anime/1141/142503.jpg');
 assert.equal(kitsu.id,'kitsu-176');assert.equal(kitsu.tmdb,0);assert.equal(kitsu.source,'kitsu');assert.equal(kitsu.score,8.27);assert.equal(image(kitsu),'https://media.kitsu.app/anime/poster_images/176/large.jpg');
});
test('Multi search respects explicit movie type even with TV hint',()=>{
 assert.equal(fromTMDB({id:5555,media_type:'movie',title:'Fixture'},'tv').type,'movie');
});

test('Detailed titles retain real person IDs, artwork and episode dates',()=>{
 const f=fromTMDB({id:123542,name:'LINK CLICK',next_episode_to_air:{name:'Next',air_date:'2026-11-01',season_number:3,episode_number:2},credits:{cast:[{id:1674213,name:'苏尚卿',profile_path:'/portrait.jpg',character:'Cheng Xiaoshi'}],crew:[]},'watch/providers':{results:{MX:{flatrate:[{provider_name:'Provider'}]}}}},'tv');
 assert.equal(f.castMembers[0].id,1674213);assert.equal(f.castMembers[0].photo,'https://image.tmdb.org/t/p/w185/portrait.jpg');assert.equal(f.castMembers[0].role,'Cheng Xiaoshi');assert.equal(f.nextEpisode.date,'2026-11-01');assert.deepEqual(f.watchProviders.MX,['Provider (flatrate)']);
 const missing=fromTMDB({id:987654,title:'Fixture',credits:{cast:[{id:15,name:'Name',profile_path:null}]}});
 assert.equal(missing.castMembers[0].photo,'');assert.equal(missing.nextEpisode,undefined);
});
test('New activity fields survive export while invalid watch time is rejected',()=>{
 const a=structuredClone(seed);a.watchTime={'2026-10-20':120};a.activity=[{id:'event1',film:'interstellar',action:'Estado: Terminadas',date:'2026-10-20T12:00:00.000Z'}];a.library.interstellar={status:'completed',favorite:false,added:'2026-10-20',completedAt:'2026-10-20T12:00:00.000Z'};a.settings.density='compact';a.profile.genres=['Drama'];assert.ok(isArchive(JSON.parse(JSON.stringify(a))));
 a.watchTime['2026-10-20']=-1;assert.equal(isArchive(a),false);
});
