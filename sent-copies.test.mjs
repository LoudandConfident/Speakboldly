import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function fixture(archive=''){
 const sent=[],context=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:()=>archive})},MailApp:{sendEmail:message=>sent.push(message)},GmailApp:{sendEmail:(to,subject,body,options)=>sent.push({to,subject,body,...options})},console:{log(){}}});
 vm.runInContext(readFileSync('google-sheets/clients/SentCopies.gs','utf8'),context);return {context,sent};
}
test('archive is off until configured and never sends a separate email',()=>{
 const f=fixture();f.context.sbSendArchivedMail({to:'learner@example.test',subject:'Your notes',body:'Hello.'});assert.equal(f.sent.length,1);assert.equal(f.sent[0].bcc,undefined);assert.equal(f.context.checkSentCopySettings().emailsSent,0);assert.equal(f.sent.length,1);
});
test('Gmail sends keep their verified From, Reply-To, HTML and PDF while adding one hidden archive recipient',()=>{
 const f=fixture('Contactus@example.test'),pdf={getName:()=> 'Session notes.pdf'},image={getName:()=> 'Logo.png'},options={from:'noreply@example.test',replyTo:'askcoach@example.test',htmlBody:'<p>Hello.</p>',attachments:[pdf],inlineImages:{logo:image}};
 f.context.sbSendArchivedGmail('learner@example.test','Your notes','Hello.',options);const sent=f.sent[0];
 assert.equal(f.sent.length,1);assert.equal(sent.to,'learner@example.test');assert.equal(sent.bcc,'Contactus@example.test');assert.equal(sent.from,options.from);assert.equal(sent.replyTo,options.replyTo);assert.equal(sent.htmlBody,options.htmlBody);assert.equal(sent.attachments[0],pdf);assert.equal(sent.inlineImages.logo,image);assert.equal(options.bcc,undefined);
});
test('MailApp sends preserve existing BCC recipients and never expose the archive in To or CC',()=>{
 const f=fixture('archive@example.test'),message={to:'learner@example.test',cc:'coach@example.test',bcc:'other@example.test',subject:'Class confirmation',body:'Your session.'};
 f.context.sbSendArchivedMail(message);assert.equal(f.sent[0].to,message.to);assert.equal(f.sent[0].cc,message.cc);assert.equal(f.sent[0].bcc,'other@example.test,archive@example.test');assert.equal(message.bcc,'other@example.test');
});
test('already addressed archive mailboxes are not duplicated, including display names and case differences',()=>{
 for(const field of ['to','cc','bcc']){const f=fixture('archive@example.test'),message={to:'learner@example.test',subject:'Hello',body:'Hello',[field]:'Other <other@example.test>, Archive <ARCHIVE@example.test>'};f.context.sbSendArchivedMail(message);assert.equal(f.sent[0].bcc,message.bcc);}
});
test('invalid archive configuration fails before any delivery',()=>{
 for(const archive of ['archive@example.test\r\nBcc: other@example.test','one@example.test,two@example.test','not-an-address']){const f=fixture(archive);assert.throws(()=>f.context.sbSendArchivedMail({to:'learner@example.test',subject:'Hello',body:'Hello'}),/Check SB_SENT_COPY_EMAIL/);assert.equal(f.sent.length,0);}
});
test('all consolidated Apps Script email calls use the archive adapters',()=>{
 const source=readFileSync('google-sheets/clients/UnifiedCode.gs','utf8'),helpers=readFileSync('google-sheets/clients/SentCopies.gs','utf8');
 assert(source.includes(helpers.trim()));const withoutHelpers=source.replace(helpers.trim(),'');assert(!/\b(?:GmailApp|MailApp)\.sendEmail\(/.test(withoutHelpers));assert.match(withoutHelpers,/sbSendArchivedMail\(/);assert.match(withoutHelpers,/sbSendArchivedGmail\(/);
});
