package com.core.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {

    @NotBlank(message = "Question content is required")
    private String content;

    @Valid
    @NotEmpty(message = "Options are required")
    private List<QuestionOptionRequest> options;
}

