// Read-only deployment smoke check. No forms, mail or private APIs are submitted.
import {readFileSync,appendFileSync} from 'node:fs';
const paths=JSON.parse(readFileSync(new URL('../content/public-pages-manifest.json',import.meta.url),'utf8')).indexable;
const origin='https://speakboldly.space',report=[];
const marker=(process.env.GITHUB_SHA||'public-pages').slice(0,12);
const probes=['/programs/general-english/','/reviews/','/student-portal/','/blog/'].filter(path=>paths.includes(path));
let ready=false;
for(let attempt=0;attempt<24;attempt++){
 try{
  const manifest=await fetch(origin+'/content/public-pages-manifest.json?seo-check='+marker,{signal:AbortSignal.timeout(15000)});
  const deployed=manifest.ok?(await manifest.json()).indexable:[];
  if(paths.every(path=>deployed.includes(path))){
   const checks=await Promise.all(probes.map(async path=>{
    const r=await fetch(origin+path+'?seo-check='+marker,{signal:AbortSignal.timeout(15000)}),html=await r.text(),local=readFileSync(new URL('..'+path+'index.html',import.meta.url),'utf8');
    const tags=[...local.matchAll(/<meta property="og:(?:title|image)"[^>]*>/g)].map(match=>match[0]);
    return r.ok&&html.includes('<link rel="canonical" href="'+origin+path+'">')&&tags.every(tag=>html.includes(tag));
   }));
   if(checks.every(Boolean)){ready=true;break;}
  }
 }catch{}
 await new Promise(resolve=>setTimeout(resolve,10000));
}
if(!ready)throw Error('The new public pages are not live yet. Check the Pages deployment.');
for(let i=0;i<paths.length;i+=4){await Promise.all(paths.slice(i,i+4).map(async path=>{
 const response=await fetch(origin+path,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(path+' HTTP '+response.status);
 if(!path.endsWith('.pdf')){const html=await response.text();if(!html.includes('<link rel="canonical" href="'+origin+path+'">'))throw Error('Canonical mismatch '+path);if(/name="robots" content="noindex/.test(html))throw Error('Unexpected noindex '+path);}
 report.push({path,status:response.status});
}));}
const response=await fetch(origin+'/sitemap.xml',{signal:AbortSignal.timeout(20000)}),xml=await response.text();if(!response.ok||!xml.includes(origin+'/programs/general-english/'))throw Error('Live sitemap is stale.');
console.log(JSON.stringify({checked:report.length,https:true,sitemap:true,pages:report},null,2));
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## Live SEO check\n\nVerified '+report.length+' public URLs over HTTPS, including canonical URLs, indexing directives and the course sitemap. No forms or email actions were submitted.\n');
