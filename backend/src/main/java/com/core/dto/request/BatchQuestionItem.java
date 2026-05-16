package com.core.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Represents a single question operation inside a batch sync request.
 * Đại diện cho một thao tác câu hỏi trong yêu cầu đồng bộ hàng loạt.
 */
@Data
public class BatchQuestionItem {

    /**
     * Server-side question ID. Null for new questions (action = ADD).
     * ID câu hỏi phía server. Null nếu là câu hỏi mới (action = ADD).
     */
    private Long id;

    /**
     * Operation to perform: ADD | UPDATE | DELETE
     */
    @NotNull(message = "Action is required")
    private Action action;

    /** Required for ADD and UPDATE */
    private String content;

    /** Required for ADD and UPDATE */
    @Valid
    private List<QuestionOptionRequest> options;

    public enum Action {
        ADD, UPDATE, DELETE
    }
}
