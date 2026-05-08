package com.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOptionResponse {
    private Long id;
    private String content;

    /**
     * Only used in admin/review responses. Must be null in "take exam" responses.
     */
    private Boolean correct;
}

