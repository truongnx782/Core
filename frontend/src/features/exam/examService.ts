import axiosInstance from '../../services/axiosInstance';
import type {
  SubmitExamRequest,
  ExamSearchParams,
  CreateExamRequest,
  CreateQuestionRequest,
} from './examTypes';

/** Payload item for the batch questions sync endpoint */
export interface BatchQuestionItem {
  id?: number;
  action: 'ADD' | 'UPDATE' | 'DELETE';
  content?: string;
  options?: CreateQuestionRequest['options'];
}

export const examService = {
  // ---- Student ----
  getAvailableExams: (params: { page: number; size: number }) =>
    axiosInstance.get('/exams/available', { params }),

  startExam: (examId: number) => axiosInstance.post(`/exams/${examId}/start`),

  submitExam: (examId: number, data: SubmitExamRequest) =>
    axiosInstance.post(`/submissions/exam/${examId}`, data),

  getLatestResult: (examId: number) => axiosInstance.get(`/submissions/exam/${examId}/latest`),

  getExamSubmissions: (examId: number) => axiosInstance.get(`/submissions/exam/${examId}`),

  // ---- Admin ----
  searchExams: (params: ExamSearchParams) => axiosInstance.get('/exams', { params }),

  createExam: (data: CreateExamRequest) => axiosInstance.post('/exams', data),

  updateExam: (id: number, data: CreateExamRequest) => axiosInstance.put(`/exams/${id}`, data),

  deleteExam: (id: number) => axiosInstance.delete(`/exams/${id}`),

  listQuestions: (examId: number) => axiosInstance.get(`/questions/exam/${examId}`),

  addQuestion: (examId: number, data: CreateQuestionRequest) =>
    axiosInstance.post(`/questions/exam/${examId}`, data),

  updateQuestion: (questionId: number, data: CreateQuestionRequest) =>
    axiosInstance.put(`/questions/${questionId}`, data),

  deleteQuestion: (questionId: number) => axiosInstance.delete(`/questions/${questionId}`),

  /**
   * Batch sync questions for an exam in a single backend transaction.
   * Đồng bộ hàng loạt câu hỏi trong một transaction duy nhất ở backend.
   */
  batchSyncQuestions: (examId: number, questions: BatchQuestionItem[]) =>
    axiosInstance.post(`/exams/${examId}/questions/batch`, { questions }),
};

