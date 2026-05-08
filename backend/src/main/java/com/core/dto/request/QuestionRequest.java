package com.core.dto.request;

import com.core.entity.Question;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequest {

    @NotNull(message = "Exam ID is required")
    private Long examId;

    @NotNull(message = "Question type is required")
    private Question.QuestionType type;

    @NotBlank(message = "Question text is required")
    private String text;

    private Integer points = 1;

    private Integer sequence = 0;

    private String imageUrl;

    private List<QuestionOptionRequest> options;

    private String correctAnswer;
}