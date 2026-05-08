package com.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuestionOptionRequest {

    @NotBlank(message = "Option content is required")
    private String content;

    /**
     * Only used for admin question management.
     */
    private Boolean correct;
}

