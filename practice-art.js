import {idiomForDate} from './daily-idiom.js?v=daily-1';
const icons={
 say:'<path d="M9 12h40v25H29L16 48V37H9ZM18 22h22M18 29h15"/>',
 hear:'<path d="M10 33V24a20 20 0 0 1 40 0v9M10 27h9v20h-9ZM41 27h9v20h-9Z"/>',
 build:'<path d="M8 43h14V29h14V15h16M44 15h8v8M8 51h44"/>',
 fix:'<path d="m11 44 25-25 9 9-25 25-12 3ZM34 17l7-7 10 10-7 7M11 50l5 5"/>',
 expressions:'<path d="M7 10h31v21H23L13 40v-9H7ZM31 34h22v17H41l-7 6v-6h-3"/>',
 book:'<path d="M7 12q12-6 23 0 12-6 23 0v32q-12-6-23 0-11-6-23 0ZM30 12v32M14 23h10M36 23h10"/>',
 star:'<path d="m30 6 7 15 17 2-13 12 3 17-14-8-15 8 3-17L5 23l18-2Z"/>'
};
const picture=key=>'<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[key]+'</svg>';
const french=`Donner un coup de main|Aider quelqu’un.|Tu peux me donner un coup de main avec cet exercice ?
Avoir le coup de main|Savoir faire quelque chose avec aisance.|Avec un peu de pratique, tu auras le coup de main.
Mettre la main à la pâte|Participer activement à un travail.|Tout le monde a mis la main à la pâte.
Petit à petit|De façon progressive.|Petit à petit, je comprends mieux les conversations.
Ça marche !|C’est d’accord, ou cela fonctionne.|On se retrouve à dix heures ? Ça marche !
Tenir au courant|Informer quelqu’un des nouvelles.|Tiens-moi au courant de tes progrès.
Être sur la même longueur d’onde|Se comprendre et partager la même façon de voir.|Nous sommes sur la même longueur d’onde.
Faire le point|Examiner une situation pour savoir où l’on en est.|Faisons le point avant de continuer.
Se jeter à l’eau|Oser commencer malgré ses hésitations.|J’ai hésité, puis je me suis jetée à l’eau.
Prendre son temps|Faire quelque chose sans se presser.|Prends ton temps pour lire la consigne.
Avoir du pain sur la planche|Avoir beaucoup de travail à faire.|Cette semaine, j’ai du pain sur la planche.
Coûter les yeux de la tête|Coûter très cher.|Ce voyage coûte les yeux de la tête.
Valoir le coup|Mériter le temps ou l’effort consacré.|Cette lecture vaut le coup.
Garder le cap|Continuer dans la direction choisie.|Même quand c’est difficile, garde le cap.
Changer d’air|Aller ailleurs pour se détendre.|Une promenade nous permettra de changer d’air.
Prendre du recul|S’éloigner un peu d’une situation pour mieux la comprendre.|Prends du recul avant de répondre.
Faire d’une pierre deux coups|Atteindre deux objectifs avec une seule action.|En lisant à voix haute, je fais d’une pierre deux coups.
Avoir les pieds sur terre|Rester réaliste.|Elle a de grands projets, mais elle garde les pieds sur terre.
Chercher midi à quatorze heures|Compliquer inutilement une chose simple.|Ne cherche pas midi à quatorze heures : demande-lui !
Mettre les choses au clair|Expliquer une situation pour éviter un malentendu.|Il faut mettre les choses au clair avant de commencer.
Ce n’est pas la mer à boire|Ce n’est pas aussi difficile qu’on le pense.|Lire une page par jour, ce n’est pas la mer à boire.
Mieux vaut tard que jamais|Il vaut mieux agir tard que ne pas agir du tout.|J’ai enfin commencé. Mieux vaut tard que jamais !
Voir le bon côté des choses|Remarquer les aspects positifs d’une situation.|Essayons de voir le bon côté des choses.
En un clin d’œil|Très rapidement.|Elle a trouvé la réponse en un clin d’œil.
Du jour au lendemain|Très soudainement.|On ne devient pas bilingue du jour au lendemain.
Passer à autre chose|Cesser de s’attarder sur une chose pour continuer.|Nous avons corrigé l’erreur. Passons à autre chose.
Trouver ses marques|S’habituer à une nouvelle situation.|Il m’a fallu quelques jours pour trouver mes marques.
Sortir des sentiers battus|Essayer une façon de faire moins habituelle.|Pour ce projet, sortons des sentiers battus.
Prendre les devants|Agir avant qu’un problème se présente.|J’ai pris les devants en préparant mes questions.
Tourner la page|Laisser une situation passée derrière soi.|Après cet essai, j’ai décidé de tourner la page.
Garder l’esprit ouvert|Être prêt à considérer de nouvelles idées.|Garde l’esprit ouvert quand tu essaies une nouvelle méthode.
Faire des progrès|Améliorer ses connaissances ou ses compétences.|Tu fais des progrès grâce à ta régularité.
Prendre le pli|S’habituer à faire quelque chose d’une certaine manière.|J’ai pris le pli de lire un peu chaque soir.
Aller droit au but|Exprimer directement l’essentiel.|Dans ce message, va droit au but.
Ne pas être dans son assiette|Ne pas se sentir très bien.|Aujourd’hui, je ne suis pas dans mon assiette.
Avoir un déclic|Comprendre soudainement quelque chose.|En écoutant l’exemple, j’ai eu un déclic.
Sauter sur l’occasion|Profiter rapidement d’une possibilité.|J’ai sauté sur l’occasion de pratiquer mon français.
Mettre toutes les chances de son côté|Bien se préparer pour réussir.|Réviser régulièrement permet de mettre toutes les chances de son côté.
Une chose à la fois|Se concentrer sur une seule tâche avant la suivante.|On a beaucoup à faire : une chose à la fois.
Se creuser la tête|Réfléchir avec beaucoup d’effort.|Je me suis creusé la tête pour trouver le mot juste.`.split('\n').map(s=>{const [expression,meaning,example]=s.split('|');return {expression,meaning,example};});
function frenchCard(host){const day=idiomForDate().key,index=Math.floor(Date.parse(day+'T00:00:00Z')/86400000)%french.length,item=french[index];let card=host.querySelector(':scope>.french-idiom');if(card?.dataset.day===day)return;if(!card){card=document.createElement('details');card.className='daily-idiom french-idiom';host.querySelector(':scope>.daily-task-intro')?.after(card);}card.dataset.day=day;card.replaceChildren();const summary=document.createElement('summary');summary.innerHTML=picture('expressions');const label=document.createElement('span');label.textContent='L’expression du jour';summary.append(label);card.append(summary);for(const [tag,text]of [['h4',item.expression],['p',item.meaning],['p',item.example]]){const el=document.createElement(tag);el.textContent=text;card.append(el);}}
function polish(host,isFrench=false){if(!host)return;if(isFrench)frenchCard(host);const headings=host.querySelectorAll('.mission-practice h4,[data-french-stage] h4,.mission-reading h4');for(const heading of headings){if(heading.querySelector('.practice-heading-icon'))continue;const text=heading.textContent.toLowerCase();const key=/hear|écout|entend/.test(text)?'hear':/say|dis-le|dis le|pronon/.test(text)?'say':/build|constr/.test(text)?'build':/fix|corrig/.test(text)?'fix':/expression|use|utilis/.test(text)?'expressions':'book';const mark=document.createElement('span');mark.className='practice-heading-icon';mark.innerHTML=picture(key);heading.prepend(mark);}for(const [i,section]of [...host.querySelectorAll('.mission-reading,.mission-practice,[data-french-stage]')].entries()){if(section.querySelector(':scope>.practice-corner'))continue;const mark=document.createElement('span');mark.className='practice-corner';mark.innerHTML=picture(['book','say','hear','build','fix','expressions'][i%6]);section.append(mark);}}
const daily=document.querySelector('#daily-mission');if(daily){polish(daily);new MutationObserver(()=>polish(daily)).observe(daily,{childList:true,subtree:true});}
const admin=document.querySelector('#admin-dashboard');if(admin){const apply=()=>polish(admin.querySelector('#instructor-french-view'),true);apply();new MutationObserver(apply).observe(admin,{childList:true,subtree:true});}
