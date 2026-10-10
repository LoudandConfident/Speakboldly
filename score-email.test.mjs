import test from 'node:test';
import assert from 'node:assert/strict';
import {createScoreMailer} from './score-mailer.mjs';
import {validateClient} from './admin-clients.js';
const client={name:'Test',email:'test@example.com',level:'1',payment:'Part paid',hours:0,code:'4821'};
test('amount paid survives validation and defaults old clients to zero',()=>{
 assert.equal(validateClient({...client,amountPaid:'1250.50'}).amountPaid,1250.5);
 assert.equal(validateClient(client).amountPaid,0);
 for(const amountPaid of [-1,'',Infinity,'1.234','bad'])assert.throws(()=>validateClient({...client,amountPaid}));
});
test('missing SMTP configuration does not claim to send email',()=>{
 assert.equal(createScoreMailer({}),null);
});
