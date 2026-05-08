package com.core.service;

import com.core.dto.request.ExamRequest;
import com.core.dto.response.ExamResponse;
import com.core.dto.response.PageResponse;
import com.core.dto.response.StartExamResponse;

public interface ExamService {

    // ---- Admin ----
    ExamResponse create(ExamRequest request);

    ExamResponse update(Long id, ExamRequest request);

    ExamResponse getById(Long id);

    PageResponse<ExamResponse> search(String keyword, String category, Boolean published, int page, int size);

    void delete(Long id);

    // ---- Student ----
    PageResponse<ExamResponse> listAvailableForStudent(int page, int size);

    StartExamResponse startExam(Long examId);
}

