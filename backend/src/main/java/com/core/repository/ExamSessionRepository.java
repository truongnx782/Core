package com.core.repository;

import com.core.entity.ExamSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExamSessionRepository extends JpaRepository<ExamSession, Long> {

    Optional<ExamSession> findTopByExamIdAndStudentIdOrderByStartedAtDesc(Long examId, Long studentId);

    Optional<ExamSession> findByIdAndStudentId(Long id, Long studentId);
}

