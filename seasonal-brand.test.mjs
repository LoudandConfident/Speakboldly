import test from 'node:test';
import assert from 'node:assert/strict';
import {speakBoldlyBrandForDate} from './seasonal-brand.js';
import {programOfferSeason} from './program-offer.js';

const dates=[['2026-11-25T12:00Z',false],['2026-11-29T21:59:59Z',false],['2026-11-29T22:00:00Z',true],['2026-11-30T12:00Z',true],['2026-12-31T21:59:59Z',true],['2026-12-31T22:00:00Z',false],['2027-11-29T22:00:00Z',true]];
test('website logo and transparent tab icon follow the Cairo Christmas dates',()=>{
 for(const [date,christmas]of dates){const brand=speakBoldlyBrandForDate(new Date(date));assert.equal(brand.season,christmas?'christmas':'standard');assert.equal(brand.icon.includes('christmas'),christmas);assert.equal(brand.logo.includes('christmas'),christmas);}
});
test('the existing 10% offer uses the matching holiday wording',()=>{
 assert.equal(programOfferSeason(new Date('2026-11-29T21:59:59Z')).name,'Thanksgiving');
 assert.equal(programOfferSeason(new Date('2026-11-29T22:00:00Z')).name,'Christmas');
 assert.equal(programOfferSeason(new Date('2026-12-31T22:00:00Z')).name,'');
});
