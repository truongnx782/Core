package com.core.service;

import java.util.List;

/**
 * Base generic service interface for common CRUD operations.
 * Interface chung định nghĩa các thao tác CRUD cơ bản cho các service.
 *
 * @param <T> The entity type or DTO type
 * @param <ID> The primary key type
 */
public interface BaseService<T, ID> {
    
    /**
     * Get entity by ID
     */
    T getById(ID id);

    /**
     * Get all entities
     */
    List<T> getAll();

    /**
     * Create a new entity
     */
    T create(T request);

    /**
     * Update an existing entity
     */
    T update(ID id, T request);

    /**
     * Delete an entity by ID
     */
    void delete(ID id);
}
