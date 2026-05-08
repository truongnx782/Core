export interface QuestionOptionRequest {
  optionText: string;
  isCorrect?: boolean;
  sequence?: number;
}

export interface QuestionRequest {
  examId: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: QuestionOptionRequest[];
  correctAnswer: string;
  points: number;
  imageUrl?: string;
}

export interface QuestionResponse {
  id: number;
  examId: number;
  text: string;
  // Compatibility if some endpoints still return questionText
  questionText?: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  // Backend might return options as strings or objects depending on implementation.
  options?: Array<string | { optionText: string; isCorrect?: boolean; sequence?: number }>;
  correctAnswer: string;
  points: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}