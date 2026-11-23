// Initialize the current hub without downloading legacy portal/exam controllers.
import {initializeStudentAssessment} from './student-assessment.js?v=same-tab-112';
if(typeof document!=='undefined'){const root=document.querySelector('#students-portal');if(root?.hasAttribute('data-global-portal'))initializeStudentAssessment(document);else import('./student-portal.js?v=same-tab-112');}
