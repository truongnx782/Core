package com.core.service;

import com.core.dto.request.SubmitExamRequest;
import com.core.dto.response.StudentSubmissionResponse;

import java.util.List;

public interface SubmissionService {

    StudentSubmissionResponse submit(Long examId, SubmitExamRequest request);

    StudentSubmissionResponse getMyLatestResult(Long examId);

    List<StudentSubmissionResponse> getMyHistory(Long examId);

    List<StudentSubmissionResponse> getExamSubmissions(Long examId);
}

