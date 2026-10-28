// Initialize the current hub without downloading legacy portal/exam controllers.
import {initializeStudentAssessment} from './student-assessment.js?v=fast-open-1';
if(typeof document!=='undefined'){const root=document.querySelector('#students-portal');if(root?.hasAttribute('data-global-portal'))initializeStudentAssessment(document);else import('./student-portal.js?v=coach-submissions-1');}
