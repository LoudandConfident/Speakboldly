// Domain mail routing. Gmail send-as aliases must be verified in the deploying account.
const SB_DOMAIN_EMAILS={general:'Contactus@speakboldly.space',team:'Joinus@speakboldly.space',student:'askcoach@speakboldly.space',billing:'billing@speakboldly.space',automated:'noreply@speakboldly.space'};
function sbDomainEmailRoute(kind){
 const financial=kind==='registration'||kind==='paymentReminder';
 return {from:financial?SB_DOMAIN_EMAILS.billing:SB_DOMAIN_EMAILS.automated,replyTo:financial?SB_DOMAIN_EMAILS.billing:SB_DOMAIN_EMAILS.student};
}
function sbVerifiedFrom(address){
 if(!/^[^\s@]+@speakboldly\.space$/i.test(address))throw Error('Use a speakboldly.space sender address.');
 let aliases;try{aliases=GmailApp.getAliases();}catch(error){throw Error('Run authorizeClientEmails, approve Gmail access, and deploy a New version before sending from your domain.');}
 const alias=aliases.find(value=>String(value).toLowerCase()===address.toLowerCase());
 if(alias)return alias;
 const primary=String(Session.getEffectiveUser().getEmail()||'');if(primary.toLowerCase()===address.toLowerCase())return '';
 throw Error('Verify '+address+' under Gmail Settings → Accounts and Import → Send mail as. No email was sent.');
}
function sbSendDomainEmail(message,verifiedFrom){
 const {to,subject,body,...options}=message;
 GmailApp.sendEmail(to,subject,body||'',{...options,...(verifiedFrom?{from:verifiedFrom}:{})});
}
function checkDomainEmailSenders(){
 const routes=['registration','paymentReminder','progress','final','actionplan','notes'].map(kind=>({kind,...sbDomainEmailRoute(kind)}));
 sbVerifiedFrom(SB_DOMAIN_EMAILS.billing);sbVerifiedFrom(SB_DOMAIN_EMAILS.automated);
 console.log('Billing and Noreply sender aliases are verified. No email was sent.');return routes;
}
function sbEnsureDomainMailSettings(){
 const props=PropertiesService.getScriptProperties();if(props.getProperty('SB_DOMAIN_MAIL_ROUTING_VERSION')==='2026-10-24')return;
 props.setProperty('SB_EXAM_NOTIFY_EMAIL',SB_DOMAIN_EMAILS.student);
 props.setProperty('SB_BOOKING_NOTIFY_EMAIL',SB_DOMAIN_EMAILS.general);
 props.setProperty('SB_DOMAIN_MAIL_ROUTING_VERSION','2026-10-24');
}

function sbDomainEmailRoutingStatus(){
 const routes={};for(const kind of ['confirmation','progress','final','registration','notes','actionplan','paymentReminder','motivation'])routes[kind]=sbDomainEmailRoute(kind);
 sbVerifiedFrom(SB_DOMAIN_EMAILS.billing);sbVerifiedFrom(SB_DOMAIN_EMAILS.automated);
 return {ok:true,version:'domain-email-2026-10-24',routes};
}
