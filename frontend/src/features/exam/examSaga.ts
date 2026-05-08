import { call, put, select, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import { examService } from './examService';
import {
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
  startExamRequest,
  startExamSuccess,
  startExamFailure,
  submitExamRequest,
  submitExamSuccess,
  submitExamFailure,
  fetchLatestResultRequest,
  fetchLatestResultSuccess,
  fetchLatestResultFailure,
} from './examSlice';
import type { RootState } from '../../store';
import type { AxiosResponse } from 'axios';

function* handleFetchAvailable(action: PayloadAction<{ page: number; size: number }>) {
  try {
    const response: AxiosResponse = yield call(examService.getAvailableExams, action.payload);
    const pageData = response.data.data;
    yield put(
      fetchAvailableExamsSuccess({
        exams: pageData.content,
        page: pageData.page,
        size: pageData.size,
        totalElements: pageData.totalElements,
        totalPages: pageData.totalPages,
      })
    );
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to load exams';
    yield put(fetchAvailableExamsFailure(msg));
  }
}

function* handleFetchAdminExams(action: PayloadAction<{ page: number; size: number }>) {
  try {
    const response: AxiosResponse = yield call(examService.searchExams, action.payload);
    const pageData = response.data.data;
    yield put(
      fetchAdminExamsSuccess({
        exams: pageData.content,
        page: pageData.page,
        size: pageData.size,
        totalElements: pageData.totalElements,
        totalPages: pageData.totalPages,
      })
    );
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to load exams';
    yield put(fetchAdminExamsFailure(msg));
  }
}

function* handleFetchQuestions(action: PayloadAction<{ examId: number }>) {
  try {
    const response: AxiosResponse = yield call(examService.listQuestions, action.payload.examId);
    yield put(fetchQuestionsSuccess(response.data.data));
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to load questions';
    yield put(fetchQuestionsFailure(msg));
  }
}

function* handleAddQuestion(action: PayloadAction<{ examId: number; data: any }>) {
  try {
    yield call(examService.addQuestion, action.payload.examId, action.payload.data);
    yield put(addQuestionSuccess());
    yield put(fetchQuestionsRequest({ examId: action.payload.examId }));
    message.success('Question added successfully');
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to add question';
    yield put(addQuestionFailure(msg));
    message.error(msg);
  }
}

function* handleUpdateQuestion(action: PayloadAction<{ questionId: number; examId: number; data: any }>) {
  try {
    yield call(examService.updateQuestion, action.payload.questionId, action.payload.data);
    yield put(updateQuestionSuccess());
    yield put(fetchQuestionsRequest({ examId: action.payload.examId }));
    message.success('Question updated successfully');
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to update question';
    yield put(updateQuestionFailure(msg));
    message.error(msg);
  }
}

function* handleDeleteQuestion(action: PayloadAction<{ questionId: number; examId: number }>) {
  try {
    yield call(examService.deleteQuestion, action.payload.questionId);
    yield put(deleteQuestionSuccess());
    yield put(fetchQuestionsRequest({ examId: action.payload.examId }));
    message.success('Question deleted successfully');
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to delete question';
    yield put(deleteQuestionFailure(msg));
    message.error(msg);
  }
}

function* handleCreateExam(action: PayloadAction<{ data: any }>) {
  try {
    yield call(examService.createExam, action.payload.data);
    yield put(createExamSuccess());
    yield put(fetchAdminExamsRequest({ page: 0, size: 20 }));
    message.success('Created new exam successfully');
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to create exam';
    yield put(createExamFailure(msg));
    message.error(msg);
  }
}

function* handleUpdateExam(action: PayloadAction<{ id: number; data: any }>) {
  try {
    yield call(examService.updateExam, action.payload.id, action.payload.data);
    yield put(updateExamSuccess());
    yield put(fetchAdminExamsRequest({ page: 0, size: 20 }));
    message.success('Exam updated successfully');
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to update exam';
    yield put(updateExamFailure(msg));
    message.error(msg);
  }
}

function* handleDeleteExam(action: PayloadAction<number>) {
  try {
    yield call(examService.deleteExam, action.payload);
    yield put(deleteExamSuccess());
    yield put(fetchAdminExamsRequest({ page: 0, size: 20 }));
    message.success('Exam deleted successfully');
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to delete exam';
    yield put(deleteExamFailure(msg));
    message.error(msg);
  }
}

function* handleStartExam(action: PayloadAction<{ examId: number }>) {
  try {
    const response: AxiosResponse = yield call(examService.startExam, action.payload.examId);
    yield put(startExamSuccess(response.data.data));
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to start exam';
    yield put(startExamFailure(msg));
    message.error(msg);
  }
}

function* handleSubmitExam(action: PayloadAction<{ examId: number }>) {
  try {
    const state: RootState = yield select();
    const taking = state.exam.taking;
    if (!taking) throw new Error('No active exam session');

    const answers = Object.entries(state.exam.answersByQuestionId).map(([qId, optId]) => ({
      questionId: Number(qId),
      selectedOptionId: optId,
    }));

    const response: AxiosResponse = yield call(examService.submitExam, action.payload.examId, {
      sessionId: taking.sessionId,
      answers,
    });

    yield put(submitExamSuccess(response.data.data));
    message.success('Submitted');
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message || 'Failed to submit';
    yield put(submitExamFailure(msg));
    message.error(msg);
  }
}

function* handleFetchLatestResult(action: PayloadAction<{ examId: number }>) {
  try {
    const response: AxiosResponse = yield call(examService.getLatestResult, action.payload.examId);
    yield put(fetchLatestResultSuccess(response.data.data));
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to load result';
    yield put(fetchLatestResultFailure(msg));
  }
}

export default function* examSaga() {
  yield takeLatest(fetchAvailableExamsRequest.type, handleFetchAvailable);
  yield takeLatest(fetchAdminExamsRequest.type, handleFetchAdminExams);
  yield takeLatest(createExamRequest.type, handleCreateExam);
  yield takeLatest(updateExamRequest.type, handleUpdateExam);
  yield takeLatest(deleteExamRequest.type, handleDeleteExam);
  yield takeLatest(fetchQuestionsRequest.type, handleFetchQuestions);
  yield takeLatest(addQuestionRequest.type, handleAddQuestion);
  yield takeLatest(updateQuestionRequest.type, handleUpdateQuestion);
  yield takeLatest(deleteQuestionRequest.type, handleDeleteQuestion);
  yield takeLatest(startExamRequest.type, handleStartExam);
  yield takeLatest(submitExamRequest.type, handleSubmitExam);
  yield takeLatest(fetchLatestResultRequest.type, handleFetchLatestResult);
}

