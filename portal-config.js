// Temporary shared Student Code while the private per-client backend is connected.
// No daily rotation. This remains a public static-site convenience gate.
export const STUDENT_CODE = '1962';
export function getStudentCode(){return STUDENT_CODE;}
// Add uploaded material here: { title: 'Worksheet 1', url: './student-files/worksheet-1.pdf' }.
// Confidential individual reports must use private authenticated storage instead.
export const portalResources = {
 exercises: [],
 exams: [],
 reports: [],
 material: []
};
