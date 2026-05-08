package com.core.controller;

import com.core.common.BaseResponse;
import com.core.dto.response.StudentSubmissionResponse;
import com.core.entity.User;
import com.core.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@Tag(name = "Submission Management", description = "APIs for exam submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/exam/{examId}/start")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start an exam")
    public ResponseEntity<BaseResponse<StudentSubmissionResponse>> startExam(
            @PathVariable Long examId,
            @AuthenticationPrincipal User student) {
        StudentSubmissionResponse response = submissionService.startExam(examId, student);
        return ResponseEntity.ok(BaseResponse.success(response));
    }

    @PostMapping("/{submissionId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit an exam")
    public ResponseEntity<BaseResponse<StudentSubmissionResponse>> submitExam(
            @PathVariable Long submissionId,
            @AuthenticationPrincipal User student) {
        StudentSubmissionResponse response = submissionService.submitExam(submissionId, student);
        return ResponseEntity.ok(BaseResponse.success(response));
    }

    @GetMapping("/{submissionId}")
    @Operation(summary = "Get submission details")
    public ResponseEntity<BaseResponse<StudentSubmissionResponse>> getSubmission(
            @PathVariable Long submissionId,
            @AuthenticationPrincipal User user) {
        StudentSubmissionResponse response = submissionService.getSubmission(submissionId, user);
        return ResponseEntity.ok(BaseResponse.success(response));
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get submissions for an exam")
    public ResponseEntity<BaseResponse<List<StudentSubmissionResponse>>> getSubmissionsForExam(
            @PathVariable Long examId,
            @AuthenticationPrincipal User instructor) {
        List<StudentSubmissionResponse> responses = submissionService.getSubmissionsForExam(examId, instructor);
        return ResponseEntity.ok(BaseResponse.success(responses));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my submissions")
    public ResponseEntity<BaseResponse<List<StudentSubmissionResponse>>> getMySubmissions(
            @AuthenticationPrincipal User student) {
        List<StudentSubmissionResponse> responses = submissionService.getMySubmissions(student);
        return ResponseEntity.ok(BaseResponse.success(responses));
    }

    @PutMapping("/{submissionId}/answer")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Save answer to a question")
    public ResponseEntity<BaseResponse<Void>> saveAnswer(
            @PathVariable Long submissionId,
            @RequestParam Long questionId,
            @RequestParam String answerText,
            @AuthenticationPrincipal User student) {
        submissionService.saveAnswer(submissionId, questionId, answerText, student);
        return ResponseEntity.ok(BaseResponse.success(null));
    }

    @PostMapping("/{submissionId}/grade")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Grade a submission")
    public ResponseEntity<BaseResponse<StudentSubmissionResponse>> gradeSubmission(
            @PathVariable Long submissionId,
            @AuthenticationPrincipal User instructor) {
        StudentSubmissionResponse response = submissionService.gradeSubmission(submissionId, instructor);
        return ResponseEntity.ok(BaseResponse.success(response));
    }
}