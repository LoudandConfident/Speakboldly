import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mountReadingRoom} from './beyond-words/reading-room.js';
import {DOCUMENT_BRAND} from './document-branding.js';
const html=readFileSync(new URL('./beyond-words/index.html',import.meta.url),'utf8');
test('literary page stays unattributed and independent of the educational app shell',()=>{
 for(const name of ['Mira','Nasser','Louis',DOCUMENT_BRAND.founder])assert(!html.includes(name));
 assert(!/application\/ld\+json|name=["']author|(?:property|name)=["'][^"']*author|page-signature|instructor|founder/i.test(html));
 const assets=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]);assert(assets.every(asset=>!/^https?:/.test(asset)||asset==='https://speakboldly.space/beyond-words/'));
 assert(!/reading-room\.(?:js|css)|app\.js|analytics/i.test(html));
 assert.match(html,/An anonymous memoir is in the making\./);assert.match(html,/Its story remains untold\./);assert.match(html,/<p>The Public Diary<\/p>/);assert(!/Its title remains undisclosed|To Be Revealed|A quiet introduction/.test(html));assert.match(html,/Back to Speak Boldly/);
 const slot=html.split('data-teaser-slot>')[1]?.split('</section>')[0];assert(slot&&!/<(?:img|video|iframe)\b/i.test(slot),'No invented teaser imagery');const images=[...html.matchAll(/<img[^>]*src="([^"]+)/g)];assert(images.every(match=>match[1].includes('/literatespace/beyond-mark.svg')||match[1].startsWith('/sb-logo-green.svg')),'Only the Beyond mark and teaching-return logo are used');
});
test('reader mounts nothing by default, without chapter content or a DOM',()=>{
 assert.equal(mountReadingRoom(null),null);assert.equal(mountReadingRoom(null,{enabled:true,chapters:[]}),null);
 const host={ownerDocument:{defaultView:{}}};assert.throws(()=>mountReadingRoom(host,{enabled:true,chapters:[{id:'same',title:'QA',paragraphs:[]},{id:'same',title:'QA',paragraphs:[]}]}),/uniquely identified/);
});
