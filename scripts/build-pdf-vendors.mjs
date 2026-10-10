import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
writeFileSync(new URL('vendor/pdf-lib.esm.min.js',root),readFileSync(new URL('node_modules/pdf-lib/dist/pdf-lib.esm.min.js',root)));
const fontkit=readFileSync(new URL('node_modules/@pdf-lib/fontkit/dist/fontkit.umd.min.js',root),'utf8');
writeFileSync(new URL('vendor/fontkit.es.min.js',root),'// Bundled @pdf-lib/fontkit 1.1.1 wrapped for browser ES modules.\nconst self = globalThis;\n'+fontkit+'\nexport default globalThis.fontkit;\n');
