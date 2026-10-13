import {test} from 'node:test';import assert from 'node:assert/strict';
import {cleanupRequestedPortalClients} from './requested-client-cleanup.js';
test('requested removals use exact names and stable IDs, preserve other clients',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
 values.set('speak-boldly-admin-sessions-v1',JSON.stringify([{clientId:'one'},{clientId:'keep'}]));
 const records=[{id:'one',name:' Mira  Nasser '},{id:'two',name:'Mira Louis'},{id:'three',name:'Martina'},{id:'keep',name:'Mira Nasser Louis'},{id:'nancy',name:'Nancy'},{id:'caroline',name:'Caroline'}];
 assert.deepEqual(cleanupRequestedPortalClients(records,storage).map(item=>item.id),['keep','nancy','caroline']);
 assert.deepEqual(JSON.parse(values.get('speak-boldly-admin-sessions-v1')),[{clientId:'keep'}]);
 assert.deepEqual(cleanupRequestedPortalClients([{id:'one',name:'Renamed client'},{id:'new',name:'Martina'}],storage).map(item=>item.id),['new']);
});
