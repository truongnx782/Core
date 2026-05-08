export interface ExamInfo {
  id: number;
  name: string;
  description?: string;
  category?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionOptionInfo {
  id: number;
  content: string;
  correct?: boolean | null;
}

export interface QuestionInfo {
  id: number;
  content: string;
  options: QuestionOptionInfo[];
}

export interface StartExamResponse {
  examId: number;
  sessionId: number;
  serverTime: string;
  deadline: string;
  durationMinutes: number;
  questions: QuestionInfo[];
}

export interface SubmitAnswerItem {
  questionId: number;
  selectedOptionId?: number | null;
}

export interface SubmitExamRequest {
  sessionId: number;
  answers: SubmitAnswerItem[];
}

export interface SubmissionAnswerReviewItem {
  questionId: number;
  selectedOptionId: number | null;
  correctOptionId: number | null;
  correct: boolean;
}

export interface StudentSubmissionResult {
  id: number;
  examId: number;
  studentId: number;
  submittedAt: string;
  totalQuestions: number;
  correctCount: number;
  score: number;
  durationSeconds: number;
  answers: SubmissionAnswerReviewItem[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

