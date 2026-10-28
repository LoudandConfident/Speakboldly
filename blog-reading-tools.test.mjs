import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BLOG_WORDS} from './blog-reading-tools.js';
import {EDITORIAL_POSTS} from './bold-blog-posts.js';
test('selected article vocabulary has definitions and usable example sentences',()=>{assert.equal(new Set(BLOG_WORDS.map(w=>w.word)).size,BLOG_WORDS.length);assert(BLOG_WORDS.some(w=>w.word==='sophisticated'));for(const w of BLOG_WORDS){assert(w.part);assert(w.definition.length>25);assert(w.example.length>25);assert(new RegExp('\\b'+w.word+'\\b','i').test(EDITORIAL_POSTS[0].pages.join(' ')));}});
test('article uses culture wording and keeps the eight original numbered sections',()=>{const text=EDITORIAL_POSTS[0].pages.join('\n\n');assert(!/Egypt/.test(text));assert(text.includes('In our culture'));assert.equal(text.split('\n\n').filter(t=>/^\d+\. /.test(t)).length,8);assert(text.includes('your worth was never up for debate'));});
test('direct blog share page advertises the lion and opens the website article',()=>{const html=readFileSync('blog/your-english-is-not-your-worth/index.html','utf8');assert(html.includes('https://speakboldly.space/images/bold-blog-lion-share.png'));assert(html.includes('Bold Blog from Speak Boldly English Language Coaching'));assert(html.includes('data-public-post="your-english-is-not-your-worth"'));assert(html.includes('#boldly-notes/your-english-is-not-your-worth'));assert(html.includes('content="image/png"'));assert(html.includes('https://speakboldly.space/blog/your-english-is-not-your-worth/'));});
