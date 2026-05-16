package com.core.service;

import com.core.dto.request.BatchQuestionSyncRequest;
import com.core.dto.request.QuestionRequest;
import com.core.dto.response.QuestionResponse;

import java.util.List;

public interface QuestionService {

    QuestionResponse addToExam(Long examId, QuestionRequest request);

    List<QuestionResponse> listByExam(Long examId);

    QuestionResponse update(Long questionId, QuestionRequest request);

    void delete(Long questionId);

    /**
     * Batch sync questions for an exam: add new, update existing, delete removed — in one transaction.
     * Đồng bộ hàng loạt câu hỏi: thêm mới, cập nhật, xóa — trong một transaction duy nhất.
     */
    List<QuestionResponse> batchSync(Long examId, BatchQuestionSyncRequest request);
}

