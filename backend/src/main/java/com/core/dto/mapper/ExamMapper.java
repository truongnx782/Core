package com.core.dto.mapper;

import com.core.dto.request.ExamRequest;
import com.core.dto.response.ExamResponse;
import com.core.entity.Exam;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ExamMapper {

    ExamResponse toResponse(Exam exam);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "questions", ignore = true)
    @BeanMapping(builder = @Builder(disableBuilder = true))
    Exam toEntity(ExamRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "questions", ignore = true)
    @BeanMapping(builder = @Builder(disableBuilder = true))
    void update(@MappingTarget Exam exam, ExamRequest request);
}

