package com.core.repository;

import com.core.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    @Query("SELECT e FROM Exam e JOIN FETCH e.creator WHERE e.creator.id = :creatorId ORDER BY e.createdAt DESC")
    List<Exam> findByCreatorId(@Param("creatorId") Long creatorId);

    @Query("SELECT e FROM Exam e WHERE e.status = :status ORDER BY e.publishedAt DESC")
    List<Exam> findByStatus(@Param("status") Exam.ExamStatus status);

    List<Exam> findBySubject(String subject);
}