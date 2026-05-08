package com.core.repository;

import com.core.entity.ExamSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamSessionRepository extends JpaRepository<ExamSession, Long> {

    @Query("SELECT es FROM ExamSession es WHERE es.exam.id = :examId ORDER BY es.startTime ASC")
    List<ExamSession> findByExamId(@Param("examId") Long examId);

    @Query("SELECT es FROM ExamSession es WHERE es.startTime <= :now AND es.endTime >= :now")
    List<ExamSession> findActiveSessions(@Param("now") LocalDateTime now);
}