package com.core.dto.mapper;

import com.core.dto.request.QuestionRequest;
import com.core.dto.response.QuestionResponse;
import com.core.entity.Exam;
import com.core.entity.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "exam", source = "exam")
    @Mapping(target = "options", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Question toEntity(QuestionRequest request, Exam exam);

    @Mapping(target = "examId", source = "exam.id")
    QuestionResponse toResponse(Question question);
}