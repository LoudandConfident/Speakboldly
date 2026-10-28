// Reviews offer the public learner programs, including upcoming programs.
// Instructor training and retired/internal session products stay out of the form.
export function learnerReviewPrograms(catalog){return catalog.filter(course=>!course.catalogHidden&&course.category!=='Training'&&!['different-learners','instructor-training'].includes(course.id));}
