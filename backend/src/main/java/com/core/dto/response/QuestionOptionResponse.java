package com.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOptionResponse {

    private Long id;
    private String optionText;
    private Boolean isCorrect;
    private Integer sequence;
}