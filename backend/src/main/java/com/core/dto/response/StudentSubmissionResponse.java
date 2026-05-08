package com.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentSubmissionResponse {

    private Long id;
    private Long examId;
    private String examTitle;
    private String studentName;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private String status;
    private Integer totalPoints;
}