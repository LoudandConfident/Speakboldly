import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBookingFixture} from './student-booking.test.mjs';
for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': hours start October 14 and count once after Cairo day ends',()=>{
 const f=createBookingFixture(filename);
 f.advance(Date.parse('2026-10-14T10:00:00Z')-f.context.Date.now());
 const sheet=f.sheets.get('Sessions'),client=f.sheets.get('Clients').rows[1];client[7]=6;
 const session=(id,date,status='')=>[id,'student-1',1,date,'18:00','','',status,'','General English','2','',''];
 sheet.rows.push(session('old','2026-10-13'),session('new','2026-10-14'),session('cancel','2026-10-14','cancelled'),session('future','2026-10-16'));
 f.context.updateSessionHours();assert.equal(client[7],6);
 f.advance(24*60*60*1000);f.context.updateSessionHours();assert.equal(client[7],7.5);
 f.context.updateSessionHours();assert.equal(client[7],7.5);
 sheet.rows.find(row=>row[0]==='new')[7]='cancelled';f.context.updateSessionHours();assert.equal(client[7],6);
 assert.equal(f.emails.length,0);
});
