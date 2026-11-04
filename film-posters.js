// Original release artwork. Display without stretching or outbound watch buttons.
export const FILM_ARTWORK={
 'Paddington 2':{poster:'https://m.media-amazon.com/images/M/MV5BNzJjZmVmYzUtOTFmZi00NmQ4LWFjZWEtMjM4OWY5ODVmMTk3XkEyXkFqcGc%40._V1_.jpg',cast:'Ben Whishaw, Hugh Bonneville, Sally Hawkins and Hugh Grant'},
 'Finding Nemo':{poster:'https://image.tmdb.org/t/p/w500/438gwHPhqNsJUPh1UQNMVSUcXI.jpg',cast:'Voices of Albert Brooks, Ellen DeGeneres and Alexander Gould'},
 'The Secret Garden':{poster:'https://m.media-amazon.com/images/M/MV5BNjgyMGI3OTQtYWFjOS00OGNkLTg4NTktMDI4ZWMwODk5ODU5XkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg',cast:'Kate Maberly, Heydon Prowse, Andrew Knott and Maggie Smith'},
 'The Many Adventures of Winnie the Pooh':{poster:'https://a.1stdibscdn.com/the-many-adventures-of-winnie-the-pooh-original-vintage-movie-poster-1977-for-sale/1121189/f_187802521587475729373/18780252_master.jpg',cast:'Voices of Sterling Holloway, John Fiedler and Paul Winchell'},
 'Jane Eyre':{poster:'https://m.media-amazon.com/images/M/MV5BNjdjMjY0NjUtMzAxNS00MjEzLTg5NWQtZDM3NjJhMDUxOTVjXkEyXkFqcGc%40._V1_.jpg',cast:'Joan Fontaine and Orson Welles'},
 'Pride and Prejudice':{poster:'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak%3D/v3/t/assets/p14418_p_v8_ae.jpg',cast:'Greer Garson and Laurence Olivier'}
};
export function filmArtwork(film){return FILM_ARTWORK[film.title.replace('&','and')]||null;}
