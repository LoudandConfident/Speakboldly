// Read only the public blog endpoint. Never request private dashboard data or drafts.
import {readFileSync,writeFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
if(/<section[^>]*id="boldly-notes"[^>]*data-stay-tuned="true"/.test(html)){console.log('Bold Blog is Stay tuned; no content was requested or published.');process.exit(0);}
const form=html.match(/<form[^>]*id="client-sheet-connect"[\s\S]*?<\/form>/)?.[0];
const value=form?.match(/name="endpoint"[^>]*value="([^"]+)"/)?.[1];
if(!value)throw Error('Public blog endpoint not found.');
const endpoint=new URL(value.replace(/&amp;/g,'&'));
if(endpoint.protocol!=='https:'||endpoint.hostname!=='script.google.com'||!/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint.pathname))throw Error('Unexpected public endpoint.');
async function request(id){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'boldlyNotes',...(id?{id}:{})}),signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Public blog HTTP '+response.status);const data=await response.json();if(!data.ok)throw Error('Public blog is unavailable.');return data;}
const list=await request();if(!Array.isArray(list.posts)||list.posts.length>1000)throw Error('Invalid public blog list.');
const posts=[];
for(const item of list.posts){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(item.id))throw Error('Invalid public article ID.');const {post}=await request(item.id);if(!post||post.id!==item.id||!Array.isArray(post.pages)||!post.pages.length||post.pages.length>5||post.pages.some(p=>typeof p!=='string'||p.length>60000)||typeof post.title!=='string'||post.title.length>140||!/^\d{4}-\d{2}-\d{2}$/.test(post.date))throw Error('Invalid public article.');posts.push({id:post.id,title:post.title,topic:String(post.topic||''),date:post.date,pages:post.pages,images:(post.images||[]).map(i=>({url:String(i.url||'')})),published:true});}
posts.sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
writeFileSync(new URL('../content/bold-blog-public.json',import.meta.url),JSON.stringify({posts},null,2)+'\n');
console.log('Synced '+posts.length+' already-public articles.');
