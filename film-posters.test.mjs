import test from 'node:test';import assert from 'node:assert/strict';
import {filmArtwork,filmPosterFallback} from './film-posters.js';
import {CULTURE_FILMS,MODERN_ADAPTATION} from './culture-corner-data.js';
test('every featured movie has a poster matching its release',()=>{for(const film of [...CULTURE_FILMS,MODERN_ADAPTATION])assert.match(filmArtwork(film)?.poster||'',/^https:\/\//);assert.notEqual(filmArtwork({title:'The Secret Garden',year:'2020'}).poster,filmArtwork({title:'The Secret Garden',year:'1993'}).poster);});
test('a failed remote image has a safe local title poster',()=>{const poster=decodeURIComponent(filmPosterFallback({title:'A & B <Film>',year:'2026'}));assert.match(poster,/&amp;/);assert.match(poster,/&lt;Film&gt;/);assert(!poster.includes('<Film>'));});
