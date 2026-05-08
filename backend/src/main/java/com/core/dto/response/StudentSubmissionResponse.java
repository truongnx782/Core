package com.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSubmissionResponse {
    private Long id;
    private Long examId;
    private Long studentId;
    private LocalDateTime submittedAt;
    private Integer totalQuestions;
    private Integer correctCount;
    private Double score;
    private Integer durationSeconds;
    private List<AnswerReviewItem> answers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerReviewItem {
        private Long questionId;
        private Long selectedOptionId;
        private Long correctOptionId;
        private Boolean correct;
    }
}

