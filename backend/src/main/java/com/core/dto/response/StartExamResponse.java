package com.core.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartExamResponse {
    private Long examId;
    private Long sessionId;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime serverTime;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;
    private Integer durationMinutes;
    private List<QuestionResponse> questions;
    private Map<Long, Long> previousAnswers; // questionId -> selectedOptionId

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PreviousAnswer {
        private Long questionId;
        private Long selectedOptionId;
    }
}

