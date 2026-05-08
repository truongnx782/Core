package com.core.dto.response;

import com.core.entity.Exam;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponse {

    private Long id;
    private String title;
    private String description;
    private String subject;
    private Integer totalPoints;
    private Integer timeLimit;
    private Integer passingScore;
    private LocalDateTime publishedAt;
    private Exam.ExamStatus status;
    private Boolean shuffleQuestions;
    private String creatorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}