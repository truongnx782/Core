package com.core.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SubmitExamRequest {

    @NotNull(message = "Session id is required")
    private Long sessionId;

    @Valid
    @NotEmpty(message = "Answers are required")
    private List<AnswerItem> answers;

    @Data
    public static class AnswerItem {
        @NotNull(message = "Question id is required")
        private Long questionId;

        private Long selectedOptionId;
    }
}

