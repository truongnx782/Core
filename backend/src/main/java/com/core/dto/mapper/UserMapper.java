package com.core.dto.mapper;

import com.core.dto.request.CreateUserRequest;
import com.core.dto.response.UserResponse;
import com.core.entity.User;
import org.mapstruct.*;

/**
 * MapStruct mapper for User entity <-> DTO conversions.
 * Uses default component model (Spring) for DI.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name().replace(\"ROLE_\", \"\"))")
    UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "avatar", ignore = true)
    @BeanMapping(builder = @Builder(disableBuilder = true))
    User toEntity(CreateUserRequest request);
}
