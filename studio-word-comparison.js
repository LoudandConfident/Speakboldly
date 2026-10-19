export function compareStudioWords(expected,heard){
 const split=value=>String(value).replace(/[’‘]/g,"'").match(/[\p{L}\p{N}]+(?:'[\p{L}]+)*/gu)||[],target=split(expected),spoken=split(heard),a=target.map(w=>w.toLocaleLowerCase('en')),b=spoken.map(w=>w.toLocaleLowerCase('en'));
 const table=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)table[i][0]=i;for(let j=0;j<=b.length;j++)table[0][j]=j;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)table[i][j]=Math.min(table[i-1][j]+1,table[i][j-1]+1,table[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
 const words=target.map(word=>({word,heard:false})),extras=[];let i=a.length,j=b.length;while(i||j){if(i&&j&&table[i][j]===table[i-1][j-1]+(a[i-1]===b[j-1]?0:1)){words[i-1].heard=a[i-1]===b[j-1];if(a[i-1]!==b[j-1])extras.unshift(spoken[j-1]);i--;j--;}else if(i&&table[i][j]===table[i-1][j]+1)i--;else{extras.unshift(spoken[j-1]);j--;}}
 return {words,extras};
}
