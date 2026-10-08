import nodemailer from 'nodemailer';
export function createScoreMailer(env){
 if(!env.SMTP_HOST||!env.SMTP_FROM||!env.SMTP_USER||!env.SMTP_PASSWORD)return null;
 const port=Number(env.SMTP_PORT||587);
 const transport=nodemailer.createTransport({host:env.SMTP_HOST,port,secure:port===465,requireTLS:port!==465,auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});
 return async({to,name,level,percentage,feedback})=>{
  const result=await transport.sendMail({from:env.SMTP_FROM,to,replyTo:'speakboldly16@gmail.com',subject:'Your Level '+level+' exam result — Speak Boldly',text:'Hello '+name+',\n\nYour Level '+level+' exam has been reviewed.\nYour final score: '+percentage+'%\n'+(feedback?'\nTeacher feedback:\n'+feedback+'\n':'')+'\nSpeak Boldly\nMira Nasser Louis'});
  if(!result.accepted?.length||result.rejected?.length)throw new Error('Recipient was not accepted by the email provider.');
 };
}
