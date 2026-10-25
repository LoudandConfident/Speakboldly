const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
(async()=>{
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
 console.log('LIVE_MOTIVATION_COPY '+JSON.stringify({shown,quote,copied,previewStatus:response.status,finalURL:response.url,previewImages:images,canonical:html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1]}));
 await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
