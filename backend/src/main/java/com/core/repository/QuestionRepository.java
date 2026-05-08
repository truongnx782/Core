package com.core.repository;

import com.core.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("SELECT q FROM Question q WHERE q.exam.id = :examId ORDER BY q.sequence ASC")
    List<Question> findByExamIdOrderBySequence(@Param("examId") Long examId);

    List<Question> findByExamId(Long examId);
}