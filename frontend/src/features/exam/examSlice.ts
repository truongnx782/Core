import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  ExamInfo,
  CreateExamRequest,
  StartExamResponse,
  StudentSubmissionResult,
  QuestionInfo,
  CreateQuestionRequest,
} from "./examTypes";
import type { LocalQuestion } from "./pages/ExamFormModal";

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

  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  // UI State
  isModalOpen: boolean;
  selectedExam: ExamInfo | null;
  modalQuestions: LocalQuestion[];
  pendingOpenExamId: number | null;
  // Drafting state
  isAddingQuestion: boolean;
  editingQuestionTempId: number | null;
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
  isModalOpen: false,
  selectedExam: null,
  modalQuestions: [],
  pendingOpenExamId: null,
  isAddingQuestion: false,
  editingQuestionTempId: null,
};

const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    // ---- Student list / Danh sách học viên ----
    fetchAvailableExamsRequest: (
      state,
      action: PayloadAction<{ page: number; size: number }>,
    ) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    fetchAvailableExamsSuccess: (
      state,
      action: PayloadAction<{
        exams: ExamInfo[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      }>,
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

    fetchAdminExamsRequest: (
      state,
      action: PayloadAction<{ page: number; size: number }>,
    ) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    fetchAdminExamsSuccess: (
      state,
      action: PayloadAction<{
        exams: ExamInfo[];
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      }>,
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

    // Fetch exam questions / Lấy danh sách câu hỏi của đề thi
    fetchQuestionsRequest: (
      state,
      action: PayloadAction<{ examId: number }>,
    ) => {
      void action;
      // Start loading exam questions / Bắt đầu tải câu hỏi của đề thi
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
    // UI Actions
    setExamModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
      if (!action.payload) {
        state.selectedExam = null;
        state.modalQuestions = [];
        state.pendingOpenExamId = null;
        state.isAddingQuestion = false;
        state.editingQuestionTempId = null;
      }
    },
    setModalExam: (state, action: PayloadAction<ExamInfo | null>) => {
      state.selectedExam = action.payload;
    },
    setModalQuestions: (state, action: PayloadAction<LocalQuestion[]>) => {
      state.modalQuestions = action.payload;
    },
    setPendingOpenExamId: (state, action: PayloadAction<number | null>) => {
      state.pendingOpenExamId = action.payload;
    },

    // ---- Draft Question Actions / Các action quản lý câu hỏi nháp ----
    addDraftQuestion: (state, action: PayloadAction<LocalQuestion>) => {
      state.modalQuestions.push(action.payload);
      state.isAddingQuestion = false;
    },
    updateDraftQuestion: (state, action: PayloadAction<LocalQuestion>) => {
      const idx = state.modalQuestions.findIndex(
        (q) => q.tempId === action.payload.tempId,
      );
      if (idx !== -1) {
        state.modalQuestions[idx] = action.payload;
      }
      state.editingQuestionTempId = null;
    },
    deleteDraftQuestion: (state, action: PayloadAction<number>) => {
      const idx = state.modalQuestions.findIndex(
        (q) => q.tempId === action.payload,
      );
      if (idx !== -1) {
        const q = state.modalQuestions[idx];
        if (!q.serverId) {
          state.modalQuestions.splice(idx, 1);
        } else {
          state.modalQuestions[idx]._action = "delete";
        }
      }
    },
    restoreDraftQuestion: (state, action: PayloadAction<number>) => {
      const idx = state.modalQuestions.findIndex(
        (q) => q.tempId === action.payload,
      );
      if (idx !== -1) {
        const q = state.modalQuestions[idx];
        state.modalQuestions[idx]._action = q.serverId ? "none" : "add";
      }
    },
    setAddingQuestion: (state, action: PayloadAction<boolean>) => {
      state.isAddingQuestion = action.payload;
      if (action.payload) state.editingQuestionTempId = null;
    },
    setEditingQuestionId: (state, action: PayloadAction<number | null>) => {
      state.editingQuestionTempId = action.payload;
      if (action.payload !== null) state.isAddingQuestion = false;
    },

    // Add new question / Thêm câu hỏi mới
    addQuestionRequest: (
      state,
      action: PayloadAction<{ examId: number; data: CreateQuestionRequest }>,
    ) => {
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

    // Update existing question / Cập nhật câu hỏi hiện có
    updateQuestionRequest: (
      state,
      action: PayloadAction<{
        questionId: number;
        examId: number;
        data: CreateQuestionRequest;
      }>,
    ) => {
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

    // Delete question / Xóa câu hỏi
    deleteQuestionRequest: (
      state,
      action: PayloadAction<{ questionId: number; examId: number }>,
    ) => {
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

    createExamRequest: (
      state,
      action: PayloadAction<{ data: CreateExamRequest }>,
    ) => {
      void action;
      // Start creating new exam / Bắt đầu tạo đề thi mới
      state.loading = true;
      state.error = null;
    },
    createExamSuccess: (state, action: PayloadAction<void>) => {
      void action;
      state.loading = false;
      state.isModalOpen = false;
    },
    createExamFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    updateExamRequest: (
      state,
      action: PayloadAction<{ id: number; data: CreateExamRequest }>,
    ) => {
      void action;
      // Start updating exam / Bắt đầu cập nhật đề thi
      state.loading = true;
      state.error = null;
    },
    updateExamSuccess: (state, action: PayloadAction<void>) => {
      void action;
      state.loading = false;
      state.isModalOpen = false;
    },
    updateExamFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    // Delete exam / Xóa đề thi
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

    // ---- Start taking exam / Bắt đầu làm bài thi ----
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
      // Initialize answers map with previous answers if available / Khởi tạo danh sách trả lời với dữ liệu cũ nếu có
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

    // Save student answer locally / Lưu câu trả lời của học sinh vào local state
    setAnswer: (
      state,
      action: PayloadAction<{ questionId: number; optionId: number | null }>,
    ) => {
      void action;
      state.answersByQuestionId[action.payload.questionId] =
        action.payload.optionId;
    },

    // ---- Submit exam / Nộp bài thi ----
    submitExamRequest: (state, action: PayloadAction<{ examId: number }>) => {
      void action;
      state.submitting = true;
      state.submitError = null;
    },
    submitExamSuccess: (
      state,
      action: PayloadAction<StudentSubmissionResult>,
    ) => {
      void action;
      state.submitting = false;
      state.latestResult = action.payload;
    },
    submitExamFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.submitting = false;
      state.submitError = action.payload;
    },

    // ---- Exam result / Kết quả bài thi ----
    fetchLatestResultRequest: (
      state,
      action: PayloadAction<{ examId: number }>,
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.latestResult = null;
    },
    fetchLatestResultSuccess: (
      state,
      action: PayloadAction<StudentSubmissionResult>,
    ) => {
      void action;
      state.loading = false;
      state.latestResult = action.payload;
    },
    fetchLatestResultFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    fetchExamSubmissionsRequest: (
      state,
      action: PayloadAction<{ examId: number }>,
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.examSubmissions = [];
    },
    fetchExamSubmissionsSuccess: (
      state,
      action: PayloadAction<StudentSubmissionResult[]>,
    ) => {
      void action;
      state.loading = false;
      state.examSubmissions = action.payload;
    },
    fetchExamSubmissionsFailure: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = false;
      state.error = action.payload;
    },

    // Reset exam state / Làm sạch trạng thái đề thi
    clearExamState: (state) => {
      state.taking = null;
      state.answersByQuestionId = {};
      state.latestResult = null;
      state.error = null;
      state.submitError = null;
      state.submitting = false;
    },

    // ---- Batch save exam + questions / Lưu hàng loạt đề thi và câu hỏi ----
    saveExamWithQuestionsRequest: (
      state,
      action: PayloadAction<{
        examId?: number;
        examData: CreateExamRequest;
        questions: LocalQuestion[];
      }>,
    ) => {
      void action;
      state.loading = true;
      state.error = null;
    },
    saveExamWithQuestionsSuccess: (state) => {
      state.loading = false;
      state.isModalOpen = false;
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
  setExamModalOpen,
  setModalExam,
  setModalQuestions,
  setPendingOpenExamId,
  addDraftQuestion,
  updateDraftQuestion,
  deleteDraftQuestion,
  restoreDraftQuestion,
  setAddingQuestion,
  setEditingQuestionId,
} = examSlice.actions;

export default examSlice.reducer;
