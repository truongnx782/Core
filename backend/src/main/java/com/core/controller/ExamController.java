package com.core.controller;

import com.core.common.BaseResponse;
import com.core.dto.request.ExamRequest;
import com.core.dto.response.ExamResponse;
import com.core.entity.User;
import com.core.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Tag(name = "Exam Management", description = "APIs for managing exams")
public class ExamController {

    private final ExamService examService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Create a new exam")
    public ResponseEntity<BaseResponse<ExamResponse>> createExam(
            @Valid @RequestBody ExamRequest request,
            @AuthenticationPrincipal User currentUser) {
        ExamResponse response = examService.createExam(request, currentUser);
        return ResponseEntity.ok(BaseResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Update an exam")
    public ResponseEntity<BaseResponse<ExamResponse>> updateExam(
            @PathVariable Long id,
            @Valid @RequestBody ExamRequest request,
            @AuthenticationPrincipal User currentUser) {
        ExamResponse response = examService.updateExam(id, request, currentUser);
        return ResponseEntity.ok(BaseResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Delete an exam")
    public ResponseEntity<BaseResponse<Void>> deleteExam(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        examService.deleteExam(id, currentUser);
        return ResponseEntity.ok(BaseResponse.success(null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get exam details")
    public ResponseEntity<BaseResponse<ExamResponse>> getExam(@PathVariable Long id) {
        ExamResponse response = examService.getExamById(id);
        return ResponseEntity.ok(BaseResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get exams created by current user")
    public ResponseEntity<BaseResponse<List<ExamResponse>>> getMyExams(
            @AuthenticationPrincipal User currentUser) {
        List<ExamResponse> responses = examService.getExamsByCreator(currentUser);
        return ResponseEntity.ok(BaseResponse.success(responses));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active exams")
    public ResponseEntity<BaseResponse<List<ExamResponse>>> getActiveExams() {
        List<ExamResponse> responses = examService.getActiveExams();
        return ResponseEntity.ok(BaseResponse.success(responses));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Publish an exam")
    public ResponseEntity<BaseResponse<ExamResponse>> publishExam(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        ExamResponse response = examService.publishExam(id, currentUser);
        return ResponseEntity.ok(BaseResponse.success(response));
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Archive an exam")
    public ResponseEntity<BaseResponse<ExamResponse>> archiveExam(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        ExamResponse response = examService.archiveExam(id, currentUser);
        return ResponseEntity.ok(BaseResponse.success(response));
    }
}