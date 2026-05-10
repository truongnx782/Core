package com.core.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    private String studentFullName;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
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

