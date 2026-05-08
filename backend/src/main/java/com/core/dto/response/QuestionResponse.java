package com.core.dto.response;

import com.core.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {

    private Long id;
    private Long examId;
    private Question.QuestionType type;
    private String text;
    private Integer points;
    private Integer sequence;
    private String imageUrl;
    private List<QuestionOptionResponse> options;
    private String correctAnswer;
}