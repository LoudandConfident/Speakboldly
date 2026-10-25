const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
(async()=>{
 for(let attempt=0;attempt<24;attempt++){const r=await fetch('https://speakboldly.space/?preview-readiness='+Date.now()),html=await r.text();if(html.includes('feature-loader.js?v=two-line-footer-1'))break;await new Promise(resolve=>setTimeout(resolve,5000));}
 const browser=await chromium.launch({executablePath:execFileSync('which',['google-chrome'],{encoding:'utf8'}).trim(),headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();
 await page.goto('https://speakboldly.space/#daily-quote',{waitUntil:'domcontentloaded'});
 const copy=page.getByRole('button',{name:'Copy motivation link',exact:true});await copy.waitFor({state:'visible',timeout:60000});
 await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Copy motivation link')?.disabled);
 await copy.click();const copied=await page.evaluate(()=>navigator.clipboard.readText());
 const shown=await page.locator('#daily-quote-image').getAttribute('src'),quote=await page.locator('#daily-quote-text').innerText();
 const response=await fetch(copied),html=await response.text();
 const images=Array.from(html.matchAll(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/g),m=>m[1]);
 const stem=shown.split('/').pop().replace(/\.png$/,'');
 assert(images[0]?.includes('/images/motivation-preview/'+stem+'-'),'The preview must match the displayed motivation');
 const picture=await fetch(images[0]),pictureBytes=(await picture.arrayBuffer()).byteLength;
 assert.equal(picture.status,200);assert(pictureBytes<200000,'The picture must stay small enough for link previews');
 console.log('LIVE_MOTIVATION_COPY '+JSON.stringify({shown,quote,copied,previewStatus:response.status,finalURL:response.url,previewImages:images,pictureBytes,pictureContentType:picture.headers.get('content-type'),canonical:html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1]}));
 await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
