// Read-only deployment smoke check. No forms, mail or private APIs are submitted.
import {readFileSync,appendFileSync} from 'node:fs';
const paths=JSON.parse(readFileSync(new URL('../content/public-pages-manifest.json',import.meta.url),'utf8')).indexable;
const origin='https://speakboldly.space',report=[];
let ready=false;
for(let attempt=0;attempt<24;attempt++){
 try{const r=await fetch(origin+'/programs/general-english/?seo-check=1',{signal:AbortSignal.timeout(15000)});const html=await r.text();if(r.ok&&html.includes('<link rel="canonical" href="'+origin+'/programs/general-english/">')){ready=true;break;}}catch{}
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
