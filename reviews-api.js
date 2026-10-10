import {backendBase,request} from './exam-api.js';
// Reviews must use their own storage, separate from student reminders.
export const REVIEWS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyL36BGXUa6hRyhfCavDP-8c9pIHEZl8n1Q5kZvABb9lTGx-fDqZGQHqkCmOnmCeRetvw/exec';
export const reviewsConnected = () => !!(REVIEWS_ENDPOINT || backendBase());

export async function reviewRequest(path, {method = 'GET', data} = {}, fetcher = globalThis.fetch, endpoint = REVIEWS_ENDPOINT) {
 if (path !== 'reviews' || !['GET','POST'].includes(method)) throw new Error('Unsupported review request.');
 if (!endpoint) return request(path,{method,data});
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), 30000);
 try {
  const response = await fetcher(endpoint, {
   method, redirect:'follow', credentials:'omit', signal:controller.signal,
   ...(method === 'POST' ? {headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(data)} : {})
  });
  let result;
  try {result = await response.json();}
  catch {throw new Error('Review sharing is unavailable. Please try again later.');}
  if (!response.ok || result.ok !== true) throw new Error(result.error || 'Your review could not be saved. Please try again.');
  if (method === 'GET' && !Array.isArray(result.reviews)) throw new Error('Reviews could not be loaded.');
  if (method === 'POST' && (!result.review?.id || typeof result.review.message !== 'string')) throw new Error('Your review could not be confirmed. Please try again.');
  return result;
 } finally {clearTimeout(timer);}
}
