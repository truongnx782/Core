package com.core.repository;

import com.core.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {

    List<StudentAnswer> findBySubmissionId(Long submissionId);

    List<StudentAnswer> findBySubmissionIdAndQuestionId(Long submissionId, Long questionId);
}