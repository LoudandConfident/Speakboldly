import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {courses} from './courses.js';
import {coursePaths} from './public-seo-routes.js';
import {dailyQuotes} from './home-gallery.js';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const manifest=JSON.parse(read('./content/public-pages-manifest.json'));
const sitemap=read('./sitemap.xml');
const graph=html=>JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
test('every generated page has a unique canonical, useful server-rendered body and matching structured data',()=>{
 const titles=new Set(),canonicals=new Set();for(const file of manifest.files){const html=read('./'+file),canonical=html.match(/<link rel="canonical" href="([^"]+)"/)[1],title=html.match(/<title>(.*?)<\/title>/)[1];assert(!titles.has(title),'duplicate title '+file);titles.add(title);assert(!canonicals.has(canonical));canonicals.add(canonical);assert.equal(canonical,'https://speakboldly.space/'+file.replace(/index\.html$/,''));assert.equal((html.match(/<h1(?:\s[^>]*)?>/g)||[]).length,1);assert(html.includes('name="description"'));assert(html.includes('property="og:url" content="'+canonical+'"'));const data=graph(html);assert(data.some(x=>x['@type']==='WebPage'&&x.url===canonical));assert(!data.some(x=>x.aggregateRating||x.review));assert(html.length>2000);}
});
test('active courses have real URLs; schedules share one General English page and hidden operations stay private',()=>{
 for(const c of courses){if(c.catalogHidden){assert.equal(coursePaths[c.id],undefined);continue;}const path=coursePaths[c.id],html=read('.'+path+'index.html');assert(html.includes(c.duration));const closed=c.dimmed||c.comingSoon;assert.equal(sitemap.includes('<loc>https://speakboldly.space'+path+'</loc>'),!closed);assert.equal(html.includes('noindex,follow'),Boolean(closed));if(!closed){assert(graph(html).some(x=>x['@type']==='Course'&&x.provider['@id']==='https://speakboldly.space/#organization'));for(const t of c.topics)assert(html.includes(t.replace(/&/g,'&amp;')));}}
 assert.equal(coursePaths['general-4'],coursePaths['general-8']);
});
test('sitemap excludes previews, drafts, hash links and legacy duplicate motivation versions',()=>{
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.equal(urls.length,new Set(urls).size);for(const url of urls){assert(url.startsWith('https://speakboldly.space/'));assert(!/[#?]/.test(url));if(url.includes('/motivation/'))assert(dailyQuotes.some(q=>url.endsWith(q.image.split('/').pop().replace(/\.png$/,'.html'))));const pathname=new URL(url).pathname;assert(existsSync(new URL('.'+pathname+(pathname.endsWith('/')?'index.html':''),import.meta.url)));}const blog=read('./blog/index.html');if(!manifest.indexable.includes('/blog/')){assert(blog.includes('Stay tuned'));assert(blog.includes('noindex,follow'));}else{assert(!blog.includes('noindex,follow'));}assert(read('./robots.txt').includes('Sitemap: https://speakboldly.space/sitemap.xml'));
});
test('generated local navigation resolves, including course and resource discovery without JavaScript',()=>{
 for(const file of manifest.files){const html=read('./'+file);for(const [,href] of html.matchAll(/href="(\/[^"#]*)(?:#[^"]*)?"/g)){const pathname=href.split('?')[0];assert(existsSync(new URL('.'+pathname+(pathname.endsWith('/')?'index.html':''),import.meta.url)),file+' broken link '+href);}}
 const html=read('./index.html');for(const path of ['/programs/','/assessments/','/blog/'])assert(html.includes('href="'+path+'"'));assert(!html.includes('speakboldly16@gmail.com'));assert(html.includes('property="og:title" content="Speak Boldly | English Language Coaching"'));
});
test('blog refresh uses only the public API and honours the Stay tuned gate',()=>{
 const script=read('./scripts/sync-public-blog.mjs');assert(script.includes("action:'boldlyNotes'"));assert(script.includes('data-stay-tuned'));assert(!/listBoldlyNotes|CLIENT_SHEET_KEY|sendClientEmail|sendEmail/.test(script));
});
