package com.core.controller;

import com.core.common.BaseResponse;
import com.core.dto.request.QuestionRequest;
import com.core.dto.response.QuestionResponse;
import com.core.entity.User;
import com.core.service.QuestionService;
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
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Tag(name = "Question Management", description = "APIs for managing exam questions")
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Create a new question")
    public ResponseEntity<BaseResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody QuestionRequest request,
            @AuthenticationPrincipal User currentUser) {
        QuestionResponse response = questionService.createQuestion(request, currentUser);
        return ResponseEntity.ok(BaseResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Update a question")
    public ResponseEntity<BaseResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request,
            @AuthenticationPrincipal User currentUser) {
        QuestionResponse response = questionService.updateQuestion(id, request, currentUser);
        return ResponseEntity.ok(BaseResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Delete a question")
    public ResponseEntity<BaseResponse<Void>> deleteQuestion(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        questionService.deleteQuestion(id, currentUser);
        return ResponseEntity.ok(BaseResponse.success(null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get question details")
    public ResponseEntity<BaseResponse<QuestionResponse>> getQuestion(@PathVariable Long id) {
        QuestionResponse response = questionService.getQuestionById(id);
        return ResponseEntity.ok(BaseResponse.success(response));
    }

    @GetMapping("/exam/{examId}")
    @Operation(summary = "Get questions for an exam")
    public ResponseEntity<BaseResponse<List<QuestionResponse>>> getQuestionsByExam(@PathVariable Long examId) {
        List<QuestionResponse> responses = questionService.getQuestionsByExamId(examId);
        return ResponseEntity.ok(BaseResponse.success(responses));
    }

    @PutMapping("/exam/{examId}/reorder")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Reorder questions in an exam")
    public ResponseEntity<BaseResponse<Void>> reorderQuestions(
            @PathVariable Long examId,
            @RequestBody List<Long> questionIds,
            @AuthenticationPrincipal User currentUser) {
        questionService.reorderQuestions(examId, questionIds, currentUser);
        return ResponseEntity.ok(BaseResponse.success(null));
    }
}