import { put, select, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import { examService } from './examService';
import {
  fetchAvailableExamsRequest, fetchAvailableExamsSuccess, fetchAvailableExamsFailure,
  fetchAdminExamsRequest, fetchAdminExamsSuccess, fetchAdminExamsFailure,
  createExamRequest, createExamSuccess, createExamFailure,
  updateExamRequest, updateExamSuccess, updateExamFailure,
  deleteExamRequest, deleteExamSuccess, deleteExamFailure,
  fetchQuestionsRequest, fetchQuestionsSuccess, fetchQuestionsFailure,
  addQuestionRequest, addQuestionSuccess, addQuestionFailure,
  updateQuestionRequest, updateQuestionSuccess, updateQuestionFailure,
  deleteQuestionRequest, deleteQuestionSuccess, deleteQuestionFailure,
  startExamRequest, startExamSuccess, startExamFailure,
  submitExamRequest, submitExamSuccess, submitExamFailure,
  fetchLatestResultRequest, fetchLatestResultSuccess, fetchLatestResultFailure,
  fetchExamSubmissionsRequest, fetchExamSubmissionsSuccess, fetchExamSubmissionsFailure,
} from './examSlice';
import type { RootState } from '../../store';
import type { CreateExamRequest, CreateQuestionRequest } from './examTypes';
import { apiSaga } from '../../store/sagaHelper';

function* handleFetchAvailable(action: PayloadAction<{ page: number; size: number }>) {
  yield* apiSaga({
    apiMethod: examService.getAvailableExams,
    actionPayload: action.payload,
    onFailure: fetchAvailableExamsFailure,
    errorMessage: 'Failed to load exams',
    callback: function* (pageData: any) {
      yield put(fetchAvailableExamsSuccess({
        exams: pageData.content, page: pageData.page, size: pageData.size,
        totalElements: pageData.totalElements, totalPages: pageData.totalPages,
      }));
    }
  });
}

function* handleFetchAdminExams(action: PayloadAction<{ page: number; size: number }>) {
  yield* apiSaga({
    apiMethod: examService.searchExams,
    actionPayload: action.payload,
    onFailure: fetchAdminExamsFailure,
    errorMessage: 'Failed to load exams',
    callback: function* (pageData: any) {
      yield put(fetchAdminExamsSuccess({
        exams: pageData.content, page: pageData.page, size: pageData.size,
        totalElements: pageData.totalElements, totalPages: pageData.totalPages,
      }));
    }
  });
}

function* handleFetchQuestions(action: PayloadAction<{ examId: number }>) {
  yield* apiSaga({
    apiMethod: examService.listQuestions,
    actionPayload: action.payload.examId,
    onSuccess: fetchQuestionsSuccess,
    onFailure: fetchQuestionsFailure,
    errorMessage: 'Failed to load questions'
  });
}

function* handleAddQuestion(action: PayloadAction<{ examId: number; data: CreateQuestionRequest }>) {
  yield* apiSaga({
    apiMethod: () => examService.addQuestion(action.payload.examId, action.payload.data),
    onSuccess: addQuestionSuccess,
    onFailure: addQuestionFailure,
    successMessage: 'Question added successfully',
    errorMessage: 'Failed to add question',
    callback: function* () { yield put(fetchQuestionsRequest({ examId: action.payload.examId })); }
  });
}

function* handleUpdateQuestion(action: PayloadAction<{ questionId: number; examId: number; data: CreateQuestionRequest }>) {
  yield* apiSaga({
    apiMethod: () => examService.updateQuestion(action.payload.questionId, action.payload.data),
    onSuccess: updateQuestionSuccess,
    onFailure: updateQuestionFailure,
    successMessage: 'Question updated successfully',
    errorMessage: 'Failed to update question',
    callback: function* () { yield put(fetchQuestionsRequest({ examId: action.payload.examId })); }
  });
}

function* handleDeleteQuestion(action: PayloadAction<{ questionId: number; examId: number }>) {
  yield* apiSaga({
    apiMethod: () => examService.deleteQuestion(action.payload.questionId),
    onSuccess: deleteQuestionSuccess,
    onFailure: deleteQuestionFailure,
    successMessage: 'Question deleted successfully',
    errorMessage: 'Failed to delete question',
    callback: function* () { yield put(fetchQuestionsRequest({ examId: action.payload.examId })); }
  });
}

function* handleCreateExam(action: PayloadAction<{ data: CreateExamRequest }>) {
  yield* apiSaga({
    apiMethod: examService.createExam,
    actionPayload: action.payload.data,
    onSuccess: createExamSuccess,
    onFailure: createExamFailure,
    successMessage: 'Created new exam successfully',
    errorMessage: 'Failed to create exam',
    callback: function* () { yield put(fetchAdminExamsRequest({ page: 0, size: 20 })); }
  });
}

function* handleUpdateExam(action: PayloadAction<{ id: number; data: CreateExamRequest }>) {
  yield* apiSaga({
    apiMethod: () => examService.updateExam(action.payload.id, action.payload.data),
    onSuccess: updateExamSuccess,
    onFailure: updateExamFailure,
    successMessage: 'Exam updated successfully',
    errorMessage: 'Failed to update exam',
    callback: function* () { yield put(fetchAdminExamsRequest({ page: 0, size: 20 })); }
  });
}

function* handleDeleteExam(action: PayloadAction<number>) {
  yield* apiSaga({
    apiMethod: () => examService.deleteExam(action.payload),
    onSuccess: deleteExamSuccess,
    onFailure: deleteExamFailure,
    successMessage: 'Exam deleted successfully',
    errorMessage: 'Failed to delete exam',
    callback: function* () { yield put(fetchAdminExamsRequest({ page: 0, size: 20 })); }
  });
}

function* handleStartExam(action: PayloadAction<{ examId: number }>) {
  yield* apiSaga({
    apiMethod: examService.startExam,
    actionPayload: action.payload.examId,
    onSuccess: startExamSuccess,
    onFailure: startExamFailure,
    errorMessage: 'Failed to start exam'
  });
}

function* handleSubmitExam(action: PayloadAction<{ examId: number }>) {
  const state: RootState = yield select();
  const taking = state.exam.taking;
  if (!taking) {
    yield put(submitExamFailure('No active exam session'));
    return;
  }
  const answers = Object.entries(state.exam.answersByQuestionId).map(([qId, optId]) => ({
    questionId: Number(qId),
    selectedOptionId: optId as number,
  }));

  yield* apiSaga({
    apiMethod: () => examService.submitExam(action.payload.examId, { sessionId: taking.sessionId, answers }),
    onSuccess: submitExamSuccess,
    onFailure: submitExamFailure,
    successMessage: 'Submitted',
    errorMessage: 'Failed to submit'
  });
}

function* handleFetchLatestResult(action: PayloadAction<{ examId: number }>) {
  yield* apiSaga({
    apiMethod: examService.getLatestResult,
    actionPayload: action.payload.examId,
    onSuccess: fetchLatestResultSuccess,
    onFailure: fetchLatestResultFailure,
    errorMessage: 'Failed to load result' // pass null for no toast if needed
  });
}

function* handleFetchExamSubmissions(action: PayloadAction<{ examId: number }>) {
  yield* apiSaga({
    apiMethod: examService.getExamSubmissions,
    actionPayload: action.payload.examId,
    onSuccess: fetchExamSubmissionsSuccess,
    onFailure: fetchExamSubmissionsFailure,
    errorMessage: 'Failed to load submissions'
  });
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
  yield takeLatest(fetchExamSubmissionsRequest.type, handleFetchExamSubmissions);
}
