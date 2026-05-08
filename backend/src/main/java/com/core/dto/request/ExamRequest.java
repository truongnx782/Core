package com.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String subject;

    @NotNull(message = "Total points is required")
    private Integer totalPoints;

    private Integer timeLimit; // in minutes

    private Integer passingScore;

    private LocalDateTime publishedAt;

    private Boolean shuffleQuestions = false;
}