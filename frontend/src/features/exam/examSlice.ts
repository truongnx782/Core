import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import type { ExamResponse } from '../../types/exam';

interface ExamState {
  exams: ExamResponse[];
  currentExam: ExamResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: ExamState = {
  exams: [],
  currentExam: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchMyExams = createAsyncThunk(
  'exam/fetchMyExams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/exams');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch exams');
    }
  }
);

export const fetchPublishedExams = createAsyncThunk(
  'exam/fetchPublishedExams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/exams/published');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch published exams');
    }
  }
);

export const createExam = createAsyncThunk(
  'exam/createExam',
  async (examData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/exams', examData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create exam');
    }
  }
);

export const updateExam = createAsyncThunk(
  'exam/updateExam',
  async ({ id, examData }: { id: number; examData: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/exams/${id}`, examData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update exam');
    }
  }
);

export const publishExam = createAsyncThunk(
  'exam/publishExam',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/exams/${id}/publish`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to publish exam');
    }
  }
);

export const submitExam = createAsyncThunk(
  'exam/submitExam',
  async ({ examId, answers }: { examId: number; answers: { questionId: number; answer: string }[] }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/submissions`, { examId, answers });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit exam');
    }
  }
);

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentExam: (state, action: PayloadAction<ExamResponse | null>) => {
      state.currentExam = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyExams.fulfilled, (state, action) => {
        state.loading = false;
        state.exams = action.payload;
      })
      .addCase(fetchMyExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.loading = false;
        state.exams.push(action.payload);
      })
      .addCase(createExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.exams.findIndex(exam => exam.id === action.payload.id);
        if (index !== -1) {
          state.exams[index] = action.payload;
        }
        if (state.currentExam?.id === action.payload.id) {
          state.currentExam = action.payload;
        }
      })
      .addCase(updateExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(publishExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishExam.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.exams.findIndex(exam => exam.id === action.payload.id);
        if (index !== -1) {
          state.exams[index] = action.payload;
        }
      })
      .addCase(publishExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentExam } = examSlice.actions;
export default examSlice.reducer;