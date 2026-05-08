export interface ExamResponse {
  id: number;
  title: string;
  description: string;
  subject: string;
  totalPoints: number;
  timeLimit: number;
  passingScore: number;
  publishedAt: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ARCHIVED';
  shuffleQuestions: boolean;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamRequest {
  title: string;
  description?: string;
  subject?: string;
  totalPoints: number;
  timeLimit?: number;
  passingScore?: number;
  publishedAt?: string;
  shuffleQuestions?: boolean;
}