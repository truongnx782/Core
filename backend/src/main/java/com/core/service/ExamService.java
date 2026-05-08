package com.core.service;

import com.core.dto.request.ExamRequest;
import com.core.dto.response.ExamResponse;
import com.core.entity.Exam;
import com.core.entity.User;

import java.util.List;

public interface ExamService {

    ExamResponse createExam(ExamRequest request, User creator);

    ExamResponse updateExam(Long id, ExamRequest request, User currentUser);

    void deleteExam(Long id, User currentUser);

    ExamResponse getExamById(Long id);

    List<ExamResponse> getExamsByCreator(User creator);

    List<ExamResponse> getActiveExams();

    ExamResponse publishExam(Long id, User currentUser);

    ExamResponse archiveExam(Long id, User currentUser);

    Exam getExamEntityById(Long id);
}