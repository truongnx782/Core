package com.core.service;

import com.core.dto.response.StudentSubmissionResponse;
import com.core.entity.User;

import java.util.List;

public interface SubmissionService {

    StudentSubmissionResponse startExam(Long examId, User student);

    StudentSubmissionResponse submitExam(Long submissionId, User student);

    StudentSubmissionResponse getSubmission(Long submissionId, User user);

    List<StudentSubmissionResponse> getSubmissionsForExam(Long examId, User instructor);

    List<StudentSubmissionResponse> getMySubmissions(User student);

    void saveAnswer(Long submissionId, Long questionId, String answerText, User student);

    StudentSubmissionResponse gradeSubmission(Long submissionId, User instructor);
}