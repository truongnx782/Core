import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import type { QuestionResponse, QuestionRequest } from '../../types/question';

interface QuestionState {
  questions: QuestionResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: QuestionState = {
  questions: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchQuestions = createAsyncThunk(
  'question/fetchQuestions',
  async (examId: number) => {
    const response = await axiosInstance.get(`/questions/exam/${examId}`);
    return response.data;
  }
);

export const createQuestion = createAsyncThunk(
  'question/createQuestion',
  async (questionData: QuestionRequest) => {
    const response = await axiosInstance.post('/questions', questionData);
    return response.data;
  }
);

export const updateQuestion = createAsyncThunk(
  'question/updateQuestion',
  async ({ id, questionData }: { id: number; questionData: QuestionRequest }) => {
    const response = await axiosInstance.put(`/questions/${id}`, questionData);
    return response.data;
  }
);

export const deleteQuestion = createAsyncThunk(
  'question/deleteQuestion',
  async (id: number) => {
    await axiosInstance.delete(`/questions/${id}`);
    return id;
  }
);

const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch questions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action: PayloadAction<QuestionResponse[]>) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch questions';
      })
      // Create question
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuestion.fulfilled, (state, action: PayloadAction<QuestionResponse>) => {
        state.loading = false;
        state.questions.push(action.payload);
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create question';
      })
      // Update question
      .addCase(updateQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuestion.fulfilled, (state, action: PayloadAction<QuestionResponse>) => {
        state.loading = false;
        const index = state.questions.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update question';
      })
      // Delete question
      .addCase(deleteQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuestion.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.questions = state.questions.filter(q => q.id !== action.payload);
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete question';
      });
  },
});

export const { clearError } = questionSlice.actions;
export default questionSlice.reducer;