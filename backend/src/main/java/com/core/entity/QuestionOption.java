package com.core.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "question_options")
public class QuestionOption extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    /**
     * Correct answer flag.
     * Important: never expose this field in "take exam" APIs.
     */
    @Column(name = "is_correct", nullable = false)
    private boolean correct;
}

