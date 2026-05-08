package com.core.repository;

import com.core.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
    List<QuestionOption> findByQuestionIdOrderByIdAsc(Long questionId);

    Optional<QuestionOption> findByIdAndQuestionExamId(Long optionId, Long examId);
}

