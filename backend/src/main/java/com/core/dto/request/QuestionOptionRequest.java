package com.core.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(using = QuestionOptionRequestDeserializer.class)
public class QuestionOptionRequest {

//    @NotBlank(message = "Option text is required")
    private String optionText;

    private Boolean isCorrect = false;

    private Integer sequence = 0;
}