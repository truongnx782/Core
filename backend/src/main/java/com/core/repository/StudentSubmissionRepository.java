package com.core.repository;

import com.core.entity.StudentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSubmissionRepository extends JpaRepository<StudentSubmission, Long> {

    @Query("SELECT ss FROM StudentSubmission ss WHERE ss.exam.id = :examId ORDER BY ss.submittedAt DESC")
    List<StudentSubmission> findByExamId(@Param("examId") Long examId);

    @Query("SELECT ss FROM StudentSubmission ss WHERE ss.student.id = :studentId ORDER BY ss.startedAt DESC")
    List<StudentSubmission> findByStudentId(@Param("studentId") Long studentId);

    Optional<StudentSubmission> findByExamIdAndStudentId(Long examId, Long studentId);
}