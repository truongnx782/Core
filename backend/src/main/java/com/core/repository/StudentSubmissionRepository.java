package com.core.repository;

import com.core.entity.StudentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSubmissionRepository extends JpaRepository<StudentSubmission, Long> {

    Optional<StudentSubmission> findTopByExamIdAndStudentIdOrderBySubmittedAtDesc(Long examId, Long studentId);

    List<StudentSubmission> findByStudentIdOrderBySubmittedAtDesc(Long studentId);
}

