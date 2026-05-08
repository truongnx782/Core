package com.core.dto.mapper;

import com.core.dto.request.ExamRequest;
import com.core.dto.response.ExamResponse;
import com.core.entity.Exam;
import com.core.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ExamMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creator", source = "creator")
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Exam toEntity(ExamRequest request, User creator);

    @Mapping(target = "creatorName", source = "creator.fullName")
    ExamResponse toResponse(Exam exam);
}