package com.core.repository;

import com.core.entity.Exam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    @Query("""
            SELECT e FROM Exam e
            WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:category IS NULL OR :category = '' OR e.category = :category)
              AND (:published IS NULL OR e.published = :published)
            """)
    Page<Exam> search(@Param("keyword") String keyword,
                      @Param("category") String category,
                      @Param("published") Boolean published,
                      Pageable pageable);

    @Query("""
            SELECT e FROM Exam e
            WHERE e.published = true
              AND :now >= e.startTime
            """)
    Page<Exam> findAvailableForStudent(@Param("now") LocalDateTime now, Pageable pageable);
}

