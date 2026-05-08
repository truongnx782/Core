package com.core.controller;

import com.core.common.BaseResponse;
import com.core.dto.request.QuestionRequest;
import com.core.dto.response.QuestionResponse;
import com.core.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<BaseResponse<QuestionResponse>> addToExam(
            @PathVariable Long examId,
            @Valid @RequestBody QuestionRequest request
    ) {
        QuestionResponse created = questionService.addToExam(examId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(BaseResponse.success("Question created", created));
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<BaseResponse<List<QuestionResponse>>> listByExam(@PathVariable Long examId) {
        return ResponseEntity.ok(BaseResponse.success(questionService.listByExam(examId)));
    }

    @PutMapping("/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<BaseResponse<QuestionResponse>> update(
            @PathVariable Long questionId,
            @Valid @RequestBody QuestionRequest request
    ) {
        return ResponseEntity.ok(BaseResponse.success("Question updated", questionService.update(questionId, request)));
    }

    @DeleteMapping("/{questionId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<BaseResponse<Void>> delete(@PathVariable Long questionId) {
        questionService.delete(questionId);
        return ResponseEntity.ok(BaseResponse.success("Question deleted"));
    }
}

