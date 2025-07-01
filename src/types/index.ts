export interface QuestionData {
  section_name: string;
  question_type: string;
  weightage: string;
  tags: string;
  question_name: string;
  options: string;
  answer: string;
}

export interface ParsedQuestion {
  question: string;
  options: string[];
  answer: string;
}