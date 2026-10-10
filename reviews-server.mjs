import {randomUUID} from 'node:crypto';
import {courses} from './courses.js';
const programs = new Set(courses.map(course => course.title));
export function createPublicReviews({db, now = () => Date.now()}) {
 db.exec('CREATE TABLE IF NOT EXISTS public_reviews(id TEXT PRIMARY KEY, submission_id TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL, data TEXT NOT NULL)');
 const recent = new Map();
 function list() {return db.prepare('SELECT id,created_at,data FROM public_reviews ORDER BY created_at DESC,rowid DESC LIMIT 1000').all().map(row => ({id:row.id,createdAt:new Date(row.created_at).toISOString(),...JSON.parse(row.data)}));}
 function save(input, identity) {
  if (typeof input.submissionId !== 'string' || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(input.submissionId)) throw new Error('Invalid submission.');
  const existing = db.prepare('SELECT id,created_at,data FROM public_reviews WHERE submission_id=?').get(input.submissionId);
  if (existing) return {review:{id:existing.id,createdAt:new Date(existing.created_at).toISOString(),...JSON.parse(existing.data)},duplicate:true};
  const text = (key, maximum, minimum = 0) => {
   if (input[key] != null && typeof input[key] !== 'string') throw new Error('Invalid '+key+'.');
   const value = (input[key] || '').trim();
   if (value.length < minimum || value.length > maximum) throw new Error('Please check your '+key+'.');
   return value;
  };
  const name = text('name',100) || 'Anonymous', level = text('level',100,1), message = text('message',3000,10), program = text('program',200,1);
  if (!programs.has(program)) throw new Error('Choose a listed program.');
  if (input.age != null && !['string','number'].includes(typeof input.age)) throw new Error('Please check your age.');
  const age = input.age === '' || input.age == null ? null : Number(input.age);
  if (age !== null && (!Number.isInteger(age) || age < 16 || age > 120)) throw new Error('Please check your age.');
  for (const [key, times] of recent) if (!times.some(time => time > now()-3600000)) recent.delete(key);
  const times = (recent.get(identity) || []).filter(time => time > now()-3600000);
  if (times.length >= 3) throw Object.assign(new Error('Please wait before adding another review.'),{status:429});
  const id = randomUUID(), data = {name,age,level,program,message};
  db.prepare('INSERT INTO public_reviews VALUES(?,?,?,?)').run(id,input.submissionId,now(),JSON.stringify(data));
  recent.set(identity,[...times,now()]);
  return {review:{id,createdAt:new Date(now()).toISOString(),...data},duplicate:false};
 }
 function remove(id) {if (!db.prepare('DELETE FROM public_reviews WHERE id=?').run(id).changes) throw Object.assign(new Error('Review not found.'),{status:404});}
 return {list,save,remove};
}
