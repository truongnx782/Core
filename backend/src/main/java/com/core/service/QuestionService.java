package com.core.service;

import com.core.dto.request.QuestionRequest;
import com.core.dto.response.QuestionResponse;

import java.util.List;

public interface QuestionService {

    QuestionResponse addToExam(Long examId, QuestionRequest request);

    List<QuestionResponse> listByExam(Long examId);

    QuestionResponse update(Long questionId, QuestionRequest request);

    void delete(Long questionId);
}

