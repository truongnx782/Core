package com.core.service;

import com.core.dto.request.QuestionRequest;
import com.core.dto.response.QuestionResponse;
import com.core.entity.User;

import java.util.List;

public interface QuestionService {

    QuestionResponse createQuestion(QuestionRequest request, User currentUser);

    QuestionResponse updateQuestion(Long id, QuestionRequest request, User currentUser);

    void deleteQuestion(Long id, User currentUser);

    QuestionResponse getQuestionById(Long id);

    List<QuestionResponse> getQuestionsByExamId(Long examId);

    void reorderQuestions(Long examId, List<Long> questionIds, User currentUser);
}