import {appendFileSync} from 'node:fs';
const domain='speakboldly.space',expected=['185.199.108.153','185.199.109.153','185.199.110.153','185.199.111.153'];
const report={domain};
async function json(url,options={}){const response=await fetch(url,{...options,signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('HTTP '+response.status);return response.json();}
try{const answer=await json('https://dns.google/resolve?name='+domain+'&type=A');report.apexAddresses=(answer.Answer||[]).filter(a=>a.type===1).map(a=>a.data).sort();report.apexDNSCorrect=expected.every(ip=>report.apexAddresses.includes(ip))&&report.apexAddresses.length===expected.length;}catch(e){report.dnsError=e.message;}
try{const answer=await json('https://dns.google/resolve?name=www.'+domain+'&type=CNAME');report.wwwTarget=(answer.Answer||[]).find(a=>a.type===5)?.data;report.wwwDNSCorrect=report.wwwTarget?.replace(/\.$/,'').toLowerCase()==='loudandconfident.github.io';}catch(e){report.wwwError=e.message;}
try{const pages=await json('https://api.github.com/repos/'+(process.env.GH_REPOSITORY||'LoudandConfident/Speakboldly')+'/pages',{headers:{Accept:'application/vnd.github+json',...(process.env.GH_TOKEN?{Authorization:'Bearer '+process.env.GH_TOKEN}:{})}});report.pages={cname:pages.cname,url:pages.html_url,status:pages.status,httpsEnforced:pages.https_enforced,certificate:pages.https_certificate,source:pages.source,buildType:pages.build_type};report.customDomainConfigured=pages.cname===domain;}catch(e){report.pagesError=e.message;}
try{const response=await fetch('https://loudandconfident.github.io/Speakboldly/',{redirect:'manual',signal:AbortSignal.timeout(20000)});report.oldURL={status:response.status,location:response.headers.get('location')};}catch(e){report.oldURLError=e.message;}
if(report.apexDNSCorrect){try{const response=await fetch('https://'+domain+'/',{signal:AbortSignal.timeout(20000)});const html=await response.text();report.https={status:response.status,url:response.url,isSpeakBoldly:html.includes('Speak Boldly')&&html.includes('id="home"')};}catch(e){report.httpsError=e.message;}}
const verificationFile='googlef6de591683171555.html',expectedVerification='google-site-verification: '+verificationFile;
report.searchConsoleVerification=[];
for(const base of ['https://speakboldly.space/','https://www.speakboldly.space/','http://speakboldly.space/','https://speakboldly.space/programs/']){
 try{const response=await fetch(base+verificationFile,{signal:AbortSignal.timeout(20000)}),body=await response.text();report.searchConsoleVerification.push({requested:base+verificationFile,status:response.status,finalURL:response.url,contentMatches:body.trim()===expectedVerification});}catch(e){report.searchConsoleVerification.push({requested:base+verificationFile,error:e.message});}
}
console.log(JSON.stringify(report,null,2));
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## speakboldly.space setup status\n\n```json\n'+JSON.stringify(report,null,2)+'\n```\n\nPending DNS or certificates are reported above; this check does not change any site or account settings.\n');
// Inspect both hostnames without following the first response so consolidation
// can be distinguished from two independent copies of the website.
const consolidation={};
for(const path of ['/','/programs/general-english/','/assessments/','/?source=domain-check']){
 const url='https://loudandconfident.github.io/Speakboldly'+path;
 try{const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000)});consolidation[url]={status:r.status,location:r.headers.get('location')};if(r.status===200){const html=await r.text();consolidation[url].title=html.match(/<title>(.*?)<\/title>/)?.[1];consolidation[url].canonical=html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];}}catch(e){consolidation[url]={error:e.message};}
}
for(const path of ['/','/programs/general-english/','/assessments/','/sitemap.xml','/robots.txt']){
 try{const r=await fetch('https://'+domain+path,{signal:AbortSignal.timeout(20000)}),body=await r.text();const item={status:r.status,finalURL:r.url};if(path==='/sitemap.xml'){const urls=[...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);item.urlCount=urls.length;item.allCustomDomain=urls.length>0&&urls.every(url=>url.startsWith('https://'+domain+'/'));}else if(path==='/robots.txt'){item.robots=body;}else{item.title=body.match(/<title>(.*?)<\/title>/)?.[1];item.canonical=body.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];item.noindex=/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(body);}consolidation['https://'+domain+path]=item;}catch(e){consolidation['https://'+domain+path]={error:e.message};}
}
console.log('DOMAIN_CONSOLIDATION '+JSON.stringify(consolidation));
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,'\n## Canonical and redirect evidence\n\n```json\n'+JSON.stringify(consolidation,null,2)+'\n```\n');

try{
 const html=await (await fetch('https://speakboldly.space/')).text();
 const form=html.split('id="client-sheet-connect"')[1]?.split('</form>')[0];
 const endpoint=form?.match(/name="endpoint"[^>]*value="([^"]+)"/)?.[1];
 if(endpoint){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'dailyMotivationSettings'})});console.log('PUBLIC_MOTIVATION_SELECTION '+JSON.stringify(await r.json()));}
 else console.log('PUBLIC_MOTIVATION_READ_ERROR Endpoint not found');
}catch(e){console.log('PUBLIC_MOTIVATION_READ_ERROR '+e.message);}
