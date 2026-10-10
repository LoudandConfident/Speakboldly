import {createReminderMailer} from './class-reminders.mjs';
import {createScoreMailer} from './score-mailer.mjs';
import {createExamBackend} from './private-exams-server.mjs';
import {mkdirSync,readFileSync} from 'node:fs';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('./', import.meta.url);
if(process.env.EXAM_ADMIN_PASSWORD&&process.env.EXAM_ADMIN_PASSWORD.length<12)throw new Error('The private owner password must be at least 12 characters. 1962 remains the dashboard preview code.');
const privatePath=process.env.EXAM_DATA_DIR||fileURLToPath(new URL('./.private-data/',root));
mkdirSync(privatePath,{recursive:true});
let privateExams=[];try{privateExams=JSON.parse(readFileSync(privatePath+'/exams.json','utf8'));}catch{}
const examBackend=createExamBackend({dbPath:privatePath+'/portal.sqlite',storageDirectory:privatePath+'/uploads',sendScoreEmail:createScoreMailer(process.env),sendReminderEmail:createReminderMailer(process.env),adminPassword:process.env.EXAM_ADMIN_PASSWORD||'',exams:privateExams,origins:(process.env.EXAM_ALLOWED_ORIGINS||'http://localhost:'+ (process.env.PORT||3000)+',http://127.0.0.1:'+(process.env.PORT||3000)).split(',')});

const reminderTimer=setInterval(()=>examBackend.runReminders().catch(()=>console.error('Class reminder job failed.')),30000);reminderTimer.unref();
examBackend.runReminders().catch(()=>console.error('Class reminder job failed.'));

const files = { '/portal-document.js':'portal-document.js','/vendor/pdf.mjs':'vendor/pdf.mjs','/vendor/pdf.worker.mjs':'vendor/pdf.worker.mjs', '/student-files/material/B-Level-2-Book.pdf':'student-files/material/B-Level-2-Book.pdf', '/student-files/material/B-Level-1-Book.pdf':'student-files/material/B-Level-1-Book.pdf', '/student-attempts.js':'student-attempts.js', '/exam-config.js':'exam-config.js','/exam-api.js':'exam-api.js','/interactive-exams.js':'interactive-exams.js','/exam-review.js':'exam-review.js','/interactive-exams.css':'interactive-exams.css', '/student-files/exams/Level-6-Exam.pdf':'student-files/exams/Level-6-Exam.pdf', '/student-files/exams/Level-5-Exam.pdf':'student-files/exams/Level-5-Exam.pdf', '/student-files/exams/Level-4-Exam.pdf':'student-files/exams/Level-4-Exam.pdf', '/student-files/exams/Level-3-Exam.pdf':'student-files/exams/Level-3-Exam.pdf', '/student-files/exams/Level-2-Exam.pdf':'student-files/exams/Level-2-Exam.pdf', '/student-files/exams/Level-1-Exam.pdf':'student-files/exams/Level-1-Exam.pdf', '/admin-calendar.js':'admin-calendar.js','/admin-calendar.css':'admin-calendar.css', '/images/vision-learners-4.png':'images/vision-learners-4.png', '/images/vision-learners-3.png':'images/vision-learners-3.png', '/images/vision-learners-2.png':'images/vision-learners-2.png', '/images/vision-learners-1.png':'images/vision-learners-1.png', '/images/home-teaching-coaching.png':'images/home-teaching-coaching.png', '/home-gallery.js':'home-gallery.js', '/mobile.css':'mobile.css', '/portal-access.js':'portal-access.js', '/admin-portal.js':'admin-portal.js', '/admin-clients.js':'admin-clients.js', '/portal-materials.js':'portal-materials.js', '/student-portal.js':'student-portal.js', '/portal-config.js':'portal-config.js', '/navigation.js':'navigation.js', '/placement-email.js':'placement-email.js', '/googlef6de591683171555.html':'googlef6de591683171555.html', '/placement-scoring.js':'placement-scoring.js', '/placement-config.js':'placement-config.js', '/placement-questions.js':'placement-questions.js', '/placement-test.pdf':'placement-test.pdf', '/speak-boldly-logo.png':'speak-boldly-logo.png', '/favicon.svg':'favicon.svg', '/':'index.html', '/index.html':'index.html', '/styles.css':'styles.css', '/app.js':'app.js', '/courses.js':'courses.js' };
for(const name of ['reviews-api.js','popups.js','reviews.js','review-management.js','home-gallery.js','assessment-time.js'])files['/'+name]=name;
const types = { pdf:'application/pdf', png:'image/png', svg:'image/svg+xml', html:'text/html',css:'text/css',js:'text/javascript',mjs:'text/javascript' };
http.createServer(async (req,res) => {
  if(await examBackend.handle(req,res))return;
  const name = files[new URL(req.url,'http://localhost').pathname];
  if (!name) { res.writeHead(404); return res.end('Not found'); }
  try { const body = await readFile(fileURLToPath(new URL(name,root))); res.writeHead(200,{'Content-Type':types[name.split('.').pop()]+'; charset=utf-8'}); res.end(body); }
  catch { res.writeHead(500); res.end('Unable to load page'); }
}).listen(Number(process.env.PORT || 3000),'0.0.0.0',()=>console.log('Forma running on port '+(process.env.PORT || 3000)));
