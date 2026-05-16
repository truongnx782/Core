/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  ExamInfo,
  CreateExamRequest,
  StartExamResponse,
  StudentSubmissionResult,
  QuestionInfo,
  CreateQuestionRequest,
} from './examTypes';
import type { LocalQuestion } from './pages/ExamFormModal';

export interface ExamState {
  available: ExamInfo[];
  adminList: ExamInfo[];
  questions: QuestionInfo[];
  loading: boolean;
  questionLoading: boolean;
  error: string | null;
  questionError: string | null;

  taking: StartExamResponse | null;
  answersByQuestionId: Record<number, number | null>;
  submitting: boolean;
  submitError: string | null;
  latestResult: StudentSubmissionResult | null;
  examSubmissions: StudentSubmissionResult[];

  pagination: { page: number; size: number; totalElements: number; totalPages: number };
}

const initialState: ExamState = {
  available: [],
  adminList: [],
  questions: [],
  loading: false,
  questionLoading: false,
  error: null,
  questionError: null,

  taking: null,
  answersByQuestionId: {},
  submitting: false,
  submitError: null,
  latestResult: null,
  examSubmissions: [],

  pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 },
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    // ---- Student list ----
    fetchAvailableExamsRequest: (state, action: PayloadAction<{ page: number; size: number }>) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    fetchAvailableExamsSuccess: (
      state,
      action: PayloadAction<{ exams: ExamInfo[]; page: number; size: number; totalElements: number; totalPages: number }>
    ) => {
      state.loading = false;
      state.available = action.payload.exams;
      state.pagination = {
        page: action.payload.page,
        size: action.payload.size,
        totalElements: action.payload.totalElements,
        totalPages: action.payload.totalPages,
      };
    },
    fetchAvailableExamsFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    fetchAdminExamsRequest: (state, action: PayloadAction<{ page: number; size: number }>) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    fetchAdminExamsSuccess: (
      state,
      action: PayloadAction<{ exams: ExamInfo[]; page: number; size: number; totalElements: number; totalPages: number }>
    ) => {
      state.loading = false;
      state.adminList = action.payload.exams;
      state.pagination = {
        page: action.payload.page,
        size: action.payload.size,
        totalElements: action.payload.totalElements,
        totalPages: action.payload.totalPages,
      };
    },
    fetchAdminExamsFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    fetchQuestionsRequest: (state, action: PayloadAction<{ examId: number }>) => {
      void action;
      // Bắt đầu tải câu hỏi của đề thi
      state.questionLoading = true;
      state.questionError = null;
    },
    fetchQuestionsSuccess: (state, action: PayloadAction<QuestionInfo[]>) => {
      void action;
      state.questionLoading = false;
      state.questions = action.payload;
    },
    fetchQuestionsFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.questionLoading = false;
      state.questionError = action.payload;
    },

    addQuestionRequest: (state, action: PayloadAction<{ examId: number; data: CreateQuestionRequest }>) => {
      void action;
      state.questionLoading = true;
      state.questionError = null;
    },
    addQuestionSuccess: (state) => {
      state.questionLoading = false;
    },
    addQuestionFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.questionLoading = false;
      state.questionError = action.payload;
    },

    updateQuestionRequest: (state, action: PayloadAction<{ questionId: number; examId: number; data: CreateQuestionRequest }>) => {
      void action;
      state.questionLoading = true;
      state.questionError = null;
    },
    updateQuestionSuccess: (state) => {
      state.questionLoading = false;
    },
    updateQuestionFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.questionLoading = false;
      state.questionError = action.payload;
    },

    deleteQuestionRequest: (state, action: PayloadAction<{ questionId: number; examId: number }>) => {
      void action;
      state.questionLoading = true;
      state.questionError = null;
    },
    deleteQuestionSuccess: (state) => {
      state.questionLoading = false;
    },
    deleteQuestionFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.questionLoading = false;
      state.questionError = action.payload;
    },

    createExamRequest: (state, action: PayloadAction<{ data: CreateExamRequest }>) => {
      void action;
      // Bắt đầu tạo đề thi mới
      state.loading = true;
      state.error = null;
    },
    createExamSuccess: (state, action: PayloadAction<void>) => {
      void action;
      state.loading = false;
    },
    createExamFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    updateExamRequest: (state, action: PayloadAction<{ id: number; data: CreateExamRequest }>) => {
      void action;
      // Bắt đầu cập nhật đề thi
      state.loading = true;
      state.error = null;
    },
    updateExamSuccess: (state, action: PayloadAction<void>) => {
      void action;
      state.loading = false;
    },
    updateExamFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    deleteExamRequest: (state, action: PayloadAction<number>) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    deleteExamSuccess: (state, action: PayloadAction<void>) => {
      void action;
      state.loading = false;
    },
    deleteExamFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    // ---- Start taking ----
    startExamRequest: (state, action: PayloadAction<{ examId: number }>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.taking = null;
      state.answersByQuestionId = {};
      state.latestResult = null;
      state.submitError = null;
    },
    startExamSuccess: (state, action: PayloadAction<StartExamResponse>) => {
      void action;
      state.loading = false;
      state.taking = action.payload;
      // initialize answers map with previous answers if available
      const map: Record<number, number | null> = {};
      action.payload.questions.forEach((q) => {
        map[q.id] = action.payload.previousAnswers?.[q.id] ?? null;
      });
      state.answersByQuestionId = map;
    },
    startExamFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    setAnswer: (state, action: PayloadAction<{ questionId: number; optionId: number | null }>) => {
      void action;
      state.answersByQuestionId[action.payload.questionId] = action.payload.optionId;
    },

    // ---- Submit ----
    submitExamRequest: (state, action: PayloadAction<{ examId: number }>) => {
      void action;
      state.submitting = true;
      state.submitError = null;
    },
    submitExamSuccess: (state, action: PayloadAction<StudentSubmissionResult>) => {
      void action;
      state.submitting = false;
      state.latestResult = action.payload;
    },
    submitExamFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.submitting = false;
      state.submitError = action.payload;
    },

    // ---- Result ----
    fetchLatestResultRequest: (state, action: PayloadAction<{ examId: number }>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.latestResult = null;
    },
    fetchLatestResultSuccess: (state, action: PayloadAction<StudentSubmissionResult>) => {
      void action;
      state.loading = false;
      state.latestResult = action.payload;
    },
    fetchLatestResultFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    fetchExamSubmissionsRequest: (state, action: PayloadAction<{ examId: number }>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.examSubmissions = [];
    },
    fetchExamSubmissionsSuccess: (state, action: PayloadAction<StudentSubmissionResult[]>) => {
      void action;
      state.loading = false;
      state.examSubmissions = action.payload;
    },
    fetchExamSubmissionsFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    clearExamState: (state) => {
      state.taking = null;
      state.answersByQuestionId = {};
      state.latestResult = null;
      state.error = null;
      state.submitError = null;
      state.submitting = false;
    },

    // ---- Batch save exam + questions ----
    saveExamWithQuestionsRequest: (
      state,
      action: PayloadAction<{
        examId?: number;
        examData: CreateExamRequest;
        questions: LocalQuestion[];
      }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    saveExamWithQuestionsSuccess: (state) => {
      state.loading = false;
    },
    saveExamWithQuestionsFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchAvailableExamsRequest,
  fetchAvailableExamsSuccess,
  fetchAvailableExamsFailure,
  fetchAdminExamsRequest,
  fetchAdminExamsSuccess,
  fetchAdminExamsFailure,
  createExamRequest,
  createExamSuccess,
  createExamFailure,
  updateExamRequest,
  updateExamSuccess,
  updateExamFailure,
  deleteExamRequest,
  deleteExamSuccess,
  deleteExamFailure,
  startExamRequest,
  startExamSuccess,
  startExamFailure,
  setAnswer,
  submitExamRequest,
  submitExamSuccess,
  submitExamFailure,
  fetchLatestResultRequest,
  fetchLatestResultSuccess,
  fetchLatestResultFailure,
  fetchQuestionsRequest,
  fetchQuestionsSuccess,
  fetchQuestionsFailure,
  addQuestionRequest,
  addQuestionSuccess,
  addQuestionFailure,
  updateQuestionRequest,
  updateQuestionSuccess,
  updateQuestionFailure,
  deleteQuestionRequest,
  deleteQuestionSuccess,
  deleteQuestionFailure,
  fetchExamSubmissionsRequest,
  fetchExamSubmissionsSuccess,
  fetchExamSubmissionsFailure,
  clearExamState,
  saveExamWithQuestionsRequest,
  saveExamWithQuestionsSuccess,
  saveExamWithQuestionsFailure,
} = examSlice.actions;

export default examSlice.reducer;

