// These search URLs render the existing website, rather than a second design.
export function publicSiteShell(shell,{path,title,description,graph,view,course='',image='/speak-boldly-preview-dark-green.png',fallback='',noindex=false}){
 const origin='https://speakboldly.space',url=origin+path;
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 let html=shell.replace(/<title>[\s\S]*?<\/title>/,'<title>'+escape(title)+'</title>');
 html=html.replace(/<meta name="description"[^>]*>/,'<meta name="description" content="'+escape(description)+'">');
 html=html.replace(/<link rel="canonical"[^>]*>/,'<link rel="canonical" href="'+url+'">');
 html=html.replace(/<meta name="robots"[^>]*>/g,'<meta name="robots" content="'+(noindex?'noindex,follow':'index,follow,max-image-preview:large')+'">');
 for(const [key,value]of [['og:title',title],['og:description',description],['og:url',url],['og:image',new URL(image,origin).href],['og:image:secure_url',new URL(image,origin).href]])html=html.replace(new RegExp('<meta property="'+key+'"[^>]*>','g'),'<meta property="'+key+'" content="'+escape(value)+'">');
 for(const [key,value]of [['twitter:title',title],['twitter:description',description],['twitter:image',new URL(image,origin).href],['twitter:card',view==='daily-quote'?'summary_large_image':'summary']])html=html.replace(new RegExp('<meta name="'+key+'"[^>]*>','g'),'<meta name="'+key+'" content="'+escape(value)+'">');
 html=html.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,'');
 html=html.replace('</head>','<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')+'</script></head>');
 html=html.replace('<head>','<head><base href="/"><script>if(!location.hash)history.replaceState(null,"",location.pathname+location.search+"#'+view+'");</script>');
 html=html.replace('<body>','<body data-public-site-view="'+view+'" data-public-course="'+escape(course)+'">');
 html=html.replace(/<([a-z]+)\b([^>]*\bdata-view\b[^>]*)>/g,(whole,tag,attributes)=>{const id=attributes.match(/\bid="([^"]+)"/)?.[1];attributes=attributes.replace(/\s+hidden(?:="")?/g,'');return '<'+tag+attributes+(id===view?'':' hidden')+'>';});
 html=html.replace('</main>','<noscript><section class="catalog">'+fallback+'</section></noscript></main>');
 return html.replace('</body>','<script type="module" src="/assets/public-site-route.js?v=original-views-1"></script></body>');
}
