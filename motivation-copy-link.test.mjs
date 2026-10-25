import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {dailyQuotes,copyMotivationLink,motivationShareUrl} from './home-gallery.js';
test('copied links lead to the selected picture preview, with metadata available without JavaScript',async()=>{
 for(const entry of dailyQuotes){let copied;const win={navigator:{clipboard:{writeText:async value=>{copied=value;}}}};
 assert.equal(await copyMotivationLink(win,entry),motivationShareUrl(entry));const url=new URL(copied);assert.equal(url.origin,'https://speakboldly.space');assert(!url.hash);
 const html=readFileSync('.'+url.pathname,'utf8');assert(html.includes('property="og:image" content="'+new URL(entry.image,url.origin).href+'"'));assert(html.includes('name="twitter:card" content="summary_large_image"'));assert(html.includes('property="og:url" content="'+copied+'"'));
 }
});
test('clipboard failure is reported so the interface can offer manual copying',async()=>{
 await assert.rejects(copyMotivationLink({navigator:{clipboard:{writeText:async()=>{throw Error('denied')}}}},dailyQuotes[0]),/denied/);
});
