// Original release artwork. Display without stretching or outbound watch buttons.
export const FILM_ARTWORK={
 'Paddington 2':{poster:'https://m.media-amazon.com/images/M/MV5BNzJjZmVmYzUtOTFmZi00NmQ4LWFjZWEtMjM4OWY5ODVmMTk3XkEyXkFqcGc%40._V1_.jpg',cast:'Ben Whishaw, Hugh Bonneville, Sally Hawkins and Hugh Grant'},
 'Finding Nemo':{poster:'https://image.tmdb.org/t/p/w500/438gwHPhqNsJUPh1UQNMVSUcXI.jpg',cast:'Voices of Albert Brooks, Ellen DeGeneres and Alexander Gould'},
 'The Secret Garden':{poster:'https://m.media-amazon.com/images/M/MV5BNjgyMGI3OTQtYWFjOS00OGNkLTg4NTktMDI4ZWMwODk5ODU5XkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg',cast:'Kate Maberly, Heydon Prowse, Andrew Knott and Maggie Smith'},
 'The Many Adventures of Winnie the Pooh':{poster:'https://a.1stdibscdn.com/the-many-adventures-of-winnie-the-pooh-original-vintage-movie-poster-1977-for-sale/1121189/f_187802521587475729373/18780252_master.jpg',cast:'Voices of Sterling Holloway, John Fiedler and Paul Winchell'},
 'Jane Eyre':{poster:'https://m.media-amazon.com/images/M/MV5BNjdjMjY0NjUtMzAxNS00MjEzLTg5NWQtZDM3NjJhMDUxOTVjXkEyXkFqcGc%40._V1_.jpg',cast:'Joan Fontaine and Orson Welles'},
 'Pride and Prejudice':{poster:'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak%3D/v3/t/assets/p14418_p_v8_ae.jpg',cast:'Greer Garson and Laurence Olivier'}
};
const MODERN_FILM_ARTWORK={
 'The Muppet Christmas Carol:1992':{poster:'https://lumiere-a.akamaihd.net/v1/images/p_themuppetchristmascarol_19640_76856619.jpeg'},
 'The Secret Garden:2020':{poster:'https://www.impawards.com/intl/uk/2020/posters/secret_garden.jpg'},
 'Christopher Robin:2018':{poster:'https://lumiere-a.akamaihd.net/v1/images/christopher-robin-poster-1_bab17c1c.jpeg'},
 'Finding Dory:2016':{poster:'https://dlby.tmsimg.com/assets/p12329215_p_v7_ap.jpg'}
};
export function filmArtwork(film){return MODERN_FILM_ARTWORK[film.title+':'+film.year]||FILM_ARTWORK[film.title.replace('&','and')]||null;}

export function filmPosterFallback(film){const escape=value=>String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));const words=film.title.split(' '),lines=[];let line='';for(const word of words){if(line.length+word.length>17){lines.push(line);line='';}line+=(line?' ':'')+word;}if(line)lines.push(line);return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="360" viewBox="0 0 240 360"><rect width="240" height="360" rx="8" fill="#193c32"/><rect x="12" y="12" width="216" height="336" rx="4" fill="none" stroke="#c5d6c7"/><text x="120" y="62" text-anchor="middle" fill="#d5ed98" font-family="sans-serif" font-size="11">SPEAK BOLDLY · FILM PICK</text>'+lines.map((text,i)=>'<text x="120" y="'+(135+i*29)+'" text-anchor="middle" fill="#fffef9" font-family="Georgia,serif" font-size="21">'+escape(text)+'</text>').join('')+'<text x="120" y="295" text-anchor="middle" fill="#d5ed98" font-family="sans-serif" font-size="16">'+escape(film.year)+'</text></svg>');}
