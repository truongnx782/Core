package com.core.controller;

import com.core.common.BaseResponse;
import com.core.dto.request.SubmitExamRequest;
import com.core.dto.response.StudentSubmissionResponse;
import com.core.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/exam/{examId}")
    public ResponseEntity<BaseResponse<StudentSubmissionResponse>> submit(
            @PathVariable Long examId,
            @Valid @RequestBody SubmitExamRequest request
    ) {
        return ResponseEntity.ok(BaseResponse.success("Submitted", submissionService.submit(examId, request)));
    }

    @GetMapping("/exam/{examId}/latest")
    public ResponseEntity<BaseResponse<StudentSubmissionResponse>> myLatest(@PathVariable Long examId) {
        return ResponseEntity.ok(BaseResponse.success(submissionService.getMyLatestResult(examId)));
    }

    @GetMapping("/exam/{examId}/history")
    public ResponseEntity<BaseResponse<List<StudentSubmissionResponse>>> myHistory(@PathVariable Long examId) {
        return ResponseEntity.ok(BaseResponse.success(submissionService.getMyHistory(examId)));
    }
}

