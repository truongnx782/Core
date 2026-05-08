import axiosInstance from '../../services/axiosInstance';
import type { SubmitExamRequest } from './examTypes';

export const examService = {
  // ---- Student ----
  getAvailableExams: (params: { page: number; size: number }) =>
    axiosInstance.get('/exams/available', { params }),

  startExam: (examId: number) => axiosInstance.post(`/exams/${examId}/start`),

  submitExam: (examId: number, data: SubmitExamRequest) =>
    axiosInstance.post(`/submissions/exam/${examId}`, data),

  getLatestResult: (examId: number) => axiosInstance.get(`/submissions/exam/${examId}/latest`),

  // ---- Admin ----
  searchExams: (params: { keyword?: string; category?: string; published?: boolean; page: number; size: number }) =>
    axiosInstance.get('/exams', { params }),

  createExam: (data: any) => axiosInstance.post('/exams', data),

  updateExam: (id: number, data: any) => axiosInstance.put(`/exams/${id}`, data),

  deleteExam: (id: number) => axiosInstance.delete(`/exams/${id}`),

  listQuestions: (examId: number) => axiosInstance.get(`/questions/exam/${examId}`),

  addQuestion: (examId: number, data: any) => axiosInstance.post(`/questions/exam/${examId}`, data),

  updateQuestion: (questionId: number, data: any) => axiosInstance.put(`/questions/${questionId}`, data),

  deleteQuestion: (questionId: number) => axiosInstance.delete(`/questions/${questionId}`),
};

