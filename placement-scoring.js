// Provisional Speak Boldly bands for the shortened 60-question test.
// These are not publisher-validated CEFR cutoffs or a proficiency certificate.
export const answerKey = [0, 2, 3, 2, 2, 1, 0, 2, 3, 2, 2, 3, 3, 2, 2, 0, 3, 2, 1, 2, 0, 0, 2, 3, 1, 1, 3, 1, 0, 2, 3, 1, 1, 2, 2, 0, 1, 2, 3, 0, 3, 1, 0, 2, 1, 3, 2, 0, 3, 0, 1, 3, 2, 1, 3, 0, 1, 0, 2, 3];
export function scoreAnswers(answers) {
 let score=0,answered=0;
 answerKey.forEach((correct,i)=>{const value=answers['q'+(i+1)];if(value===undefined||value===null||value==='')return;if(!['string','number'].includes(typeof value)||!String(value).match(/^[0-3]$/))throw new Error('Invalid answer choice');const choice=Number(value);if(!Number.isInteger(choice)||choice<0||choice>3)throw new Error('Invalid answer choice');answered++;if(choice===correct)score++;});
 const percentage=Math.round(score/answerKey.length*100);
 const level=score<12?'Below A1':score<24?'A1–A2':score<36?'A2–B1':score<48?'B1–B2':'B2–C1';
 return {score,total:answerKey.length,answered,percentage,level};
}
