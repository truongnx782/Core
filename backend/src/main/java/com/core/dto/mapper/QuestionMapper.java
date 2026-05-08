package com.core.dto.mapper;

import com.core.dto.request.QuestionRequest;
import com.core.dto.response.QuestionOptionResponse;
import com.core.dto.response.QuestionResponse;
import com.core.entity.Question;
import com.core.entity.QuestionOption;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    // ---- Admin / General mapping (includes correct flag) ----
    @Mapping(target = "options", expression = "java(toAdminOptionResponses(question.getOptions()))")
    QuestionResponse toResponse(Question question);

    List<QuestionResponse> toResponses(List<Question> questions);

    @Named("toAdminOption")
    @Mapping(target = "correct", source = "correct")
    QuestionOptionResponse toAdminOptionResponse(QuestionOption option);

    @IterableMapping(qualifiedByName = "toAdminOption")
    List<QuestionOptionResponse> toAdminOptionResponses(List<QuestionOption> options);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "exam", ignore = true)
    @Mapping(target = "options", ignore = true)
    @BeanMapping(builder = @Builder(disableBuilder = true))
    Question toEntity(QuestionRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "exam", ignore = true)
    @Mapping(target = "options", ignore = true)
    @BeanMapping(builder = @Builder(disableBuilder = true))
    void update(@MappingTarget Question question, QuestionRequest request);

    // ---- Student "take exam" mapping (hides correct flag) ----
    @Named("toStudentOption")
    @Mapping(target = "correct", ignore = true)
    QuestionOptionResponse toStudentOptionResponse(QuestionOption option);

    @IterableMapping(qualifiedByName = "toStudentOption")
    List<QuestionOptionResponse> toStudentOptionResponses(List<QuestionOption> options);

    @Named("toStudentQuestion")
    @Mapping(target = "options", expression = "java(toStudentOptionResponses(question.getOptions()))")
    QuestionResponse toStudentQuestionResponse(Question question);

    @IterableMapping(qualifiedByName = "toStudentQuestion")
    List<QuestionResponse> toStudentQuestionResponses(List<Question> questions);
}

