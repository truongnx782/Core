package com.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "exam_sessions",
        indexes = {
                @Index(name = "idx_exam_sessions_exam_student", columnList = "exam_id,student_id"),
                @Index(name = "idx_exam_sessions_status", columnList = "status")
        }
)
public class ExamSession extends BaseEntity {

    public enum SessionStatus {
        IN_PROGRESS,
        SUBMITTED,
        EXPIRED
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    /**
     * Session deadline computed as startedAt + durationMinutes (server-side).
     * The actual submission deadline is min(expiresAt, exam.endTime).
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionStatus status = SessionStatus.IN_PROGRESS;
}

