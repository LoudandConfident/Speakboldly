// Existing Sheets records keep their URLs and permissions; only the displayed
// public asset is rebased onto the active custom domain.
export function publicDocumentUrl(value,base){
 const url=new URL(value,base),site=new URL(base);
 if(['speakboldly.space','www.speakboldly.space'].includes(site.hostname)&&url.hostname==='loudandconfident.github.io'&&url.pathname.startsWith('/Speakboldly/')){
  const migrated=new URL(url.pathname.slice('/Speakboldly'.length),site.origin);migrated.search=url.search;migrated.hash=url.hash;return migrated;
 }
 return url;
}
