package com.core.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Request body for batch synchronizing questions of an exam in a single transaction.
 * Body yêu cầu để đồng bộ hàng loạt câu hỏi của một đề thi trong một transaction duy nhất.
 */
@Data
public class BatchQuestionSyncRequest {

    @Valid
    @NotNull(message = "Questions list is required")
    private List<BatchQuestionItem> questions;
}
