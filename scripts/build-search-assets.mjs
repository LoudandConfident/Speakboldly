import CleanCSS from 'clean-css';
import {readFileSync,writeFileSync} from 'node:fs';
for(const [source,target] of [['styles.css','assets/site-base.min.css'],['site-theme.css','assets/site-theme.min.css']]){
 const original=readFileSync(source,'utf8'),input=source==='styles.css'?original.replace(/@import url\([^)]*\);/g,''):original,result=new CleanCSS({level:1,rebase:false}).minify(input);
 if(result.errors.length)throw Error(result.errors.join('\n'));
 writeFileSync(target,result.styles+'\n');
 console.log(source+': '+input.length+' → '+result.styles.length+' characters');
}
