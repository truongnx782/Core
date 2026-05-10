package com.core.controller;

import com.core.common.BaseResponse;
import com.core.dto.request.ExamRequest;
import com.core.dto.response.ExamResponse;
import com.core.dto.response.PageResponse;
import com.core.dto.response.StartExamResponse;
import com.core.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController extends BaseController {

    private final ExamService examService;

    // ---- Admin endpoints ----

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<BaseResponse<ExamResponse>> create(@Valid @RequestBody ExamRequest request) {
        return success(examService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<BaseResponse<ExamResponse>> update(@PathVariable Long id, @Valid @RequestBody ExamRequest request) {
        return success(examService.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<ExamResponse>> getById(@PathVariable Long id) {
        return success(examService.getById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<BaseResponse<PageResponse<ExamResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean published,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(BaseResponse.success(examService.search(keyword, category, published, page, size)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<BaseResponse<Void>> delete(@PathVariable Long id) {
        examService.delete(id);
        return ResponseEntity.ok(BaseResponse.success("Exam deleted"));
    }

    // ---- Student endpoints ----

    @GetMapping("/available")
    public ResponseEntity<BaseResponse<PageResponse<ExamResponse>>> available(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Danh sách đề thi cho học sinh, chỉ hiển thị đề đã công bố và trong khoảng thời gian mở
        return ResponseEntity.ok(BaseResponse.success(examService.listAvailableForStudent(page, size)));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<BaseResponse<StartExamResponse>> start(@PathVariable("id") Long examId) {
        return ResponseEntity.ok(BaseResponse.success("Exam started", examService.startExam(examId)));
    }
}

