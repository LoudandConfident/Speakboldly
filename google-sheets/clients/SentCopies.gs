// Optional mailbox archive. Configure SB_SENT_COPY_EMAIL in Script Properties only
// after the destination mailbox's incoming-mail rule files these copies into Sent.
// This does not change the sending provider or move older messages.
function sbSentCopyOptions(options,recipient){
 const result={...(options||{})};
 const archive=String(PropertiesService.getScriptProperties().getProperty('SB_SENT_COPY_EMAIL')||'').trim();
 if(!archive)return result;
 if(!/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/.test(archive))throw Error('Check SB_SENT_COPY_EMAIL in Script Properties before sending.');
 const addresses=value=>String(value||'').split(/[,;]/).map(part=>{const match=part.trim().match(/<([^<>]+)>$/);return (match?match[1]:part).trim().toLowerCase();});
 const existing=[recipient||result.to,result.cc,result.bcc].flatMap(addresses);
 if(!existing.includes(archive.toLowerCase()))result.bcc=[result.bcc,archive].filter(Boolean).join(',');
 return result;
}
function sbSendArchivedMail(message){return MailApp.sendEmail(sbSentCopyOptions(message));}
function sbSendArchivedGmail(to,subject,body,options){return GmailApp.sendEmail(to,subject,body,sbSentCopyOptions(options,to));}
function checkSentCopySettings(){
 const archive=String(PropertiesService.getScriptProperties().getProperty('SB_SENT_COPY_EMAIL')||'').trim();
 sbSentCopyOptions({});
 const status={enabled:Boolean(archive),archiveMailbox:archive,provider:'Existing Google delivery',sentFolderRuleRequired:true,emailsSent:0};
 console.log(JSON.stringify(status));return status;
}
