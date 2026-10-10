export const REVIEWS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz_d7sdw-RbiuInL8mz8TJfEH7lRyk_ZSQrDF75UJKJug1GeM58yAtaqyuhr7ja_guApw/exec';

export async function reviewRequest(path, {method = 'GET', data} = {}, fetcher = globalThis.fetch) {
 if (path !== 'reviews' || !['GET','POST'].includes(method)) throw new Error('Unsupported review request.');
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), 30000);
 try {
  const response = await fetcher(REVIEWS_ENDPOINT, {
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
