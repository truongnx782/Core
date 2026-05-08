package com.core.service.impl;

import com.core.dto.response.StudentSubmissionResponse;
import com.core.entity.*;
import com.core.repository.StudentAnswerRepository;
import com.core.repository.StudentSubmissionRepository;
import com.core.service.ExamService;
import com.core.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final StudentSubmissionRepository submissionRepository;
    private final StudentAnswerRepository answerRepository;
    private final ExamService examService;

    @Override
    @Transactional
    public StudentSubmissionResponse startExam(Long examId, User student) {
        Exam exam = examService.getExamEntityById(examId);

        // Check if already started
        StudentSubmission existing = submissionRepository.findByExamIdAndStudentId(examId, student.getId())
                .orElse(null);
        if (existing != null) {
            return toResponse(existing);
        }

        StudentSubmission submission = new StudentSubmission();
        submission.setExam(exam);
        submission.setStudent(student);
        submission.setStartedAt(LocalDateTime.now());
        submission.setStatus(StudentSubmission.SubmissionStatus.IN_PROGRESS);

        submission = submissionRepository.save(submission);
        return toResponse(submission);
    }

    @Override
    @Transactional
    public StudentSubmissionResponse submitExam(Long submissionId, User student) {
        StudentSubmission submission = getSubmissionEntity(submissionId);
        if (!submission.getStudent().getId().equals(student.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(StudentSubmission.SubmissionStatus.SUBMITTED);

        // Auto-grade multiple choice
        autoGradeSubmission(submission);

        submission = submissionRepository.save(submission);
        return toResponse(submission);
    }

    @Override
    public StudentSubmissionResponse getSubmission(Long submissionId, User user) {
        StudentSubmission submission = getSubmissionEntity(submissionId);
        // Check permissions
        if (!submission.getStudent().getId().equals(user.getId()) &&
            !submission.getExam().getCreator().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }
        return toResponse(submission);
    }

    @Override
    public List<StudentSubmissionResponse> getSubmissionsForExam(Long examId, User instructor) {
        Exam exam = examService.getExamEntityById(examId);
        if (!exam.getCreator().getId().equals(instructor.getId())) {
            throw new AccessDeniedException("Access denied");
        }
        return submissionRepository.findByExamId(examId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentSubmissionResponse> getMySubmissions(User student) {
        return submissionRepository.findByStudentId(student.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void saveAnswer(Long submissionId, Long questionId, String answerText, User student) {
        StudentSubmission submission = getSubmissionEntity(submissionId);
        if (!submission.getStudent().getId().equals(student.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        StudentAnswer answer = answerRepository.findBySubmissionIdAndQuestionId(submissionId, questionId)
                .stream().findFirst().orElse(new StudentAnswer());

        if (answer.getId() == null) {
            answer.setSubmission(submission);
            answer.setQuestion(examService.getExamEntityById(submission.getExam().getId()).getQuestions()
                    .stream().filter(q -> q.getId().equals(questionId)).findFirst().orElse(null));
        }
        answer.setAnswerText(answerText);
        answerRepository.save(answer);
    }

    @Override
    @Transactional
    public StudentSubmissionResponse gradeSubmission(Long submissionId, User instructor) {
        StudentSubmission submission = getSubmissionEntity(submissionId);
        if (!submission.getExam().getCreator().getId().equals(instructor.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        // Manual grading logic here (for essay questions)
        // For now, just mark as graded
        submission.setStatus(StudentSubmission.SubmissionStatus.GRADED);
        submission = submissionRepository.save(submission);
        return toResponse(submission);
    }

    private StudentSubmission getSubmissionEntity(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    private void autoGradeSubmission(StudentSubmission submission) {
        List<StudentAnswer> answers = answerRepository.findBySubmissionId(submission.getId());
        int totalPoints = 0;

        for (StudentAnswer answer : answers) {
            Question question = answer.getQuestion();
            if (question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
                // Check if answer matches correct option
                boolean correct = question.getOptions().stream()
                        .anyMatch(opt -> opt.getIsCorrect() && opt.getOptionText().equals(answer.getAnswerText()));
                if (correct) {
                    answer.setPointsAwarded(question.getPoints());
                    totalPoints += question.getPoints();
                }
            }
            // Essay questions need manual grading
        }

        submission.setTotalPoints(totalPoints);
        answerRepository.saveAll(answers);
    }

    private StudentSubmissionResponse toResponse(StudentSubmission submission) {
        return new StudentSubmissionResponse(
                submission.getId(),
                submission.getExam().getId(),
                submission.getExam().getTitle(),
                submission.getStudent().getFullName(),
                submission.getStartedAt(),
                submission.getSubmittedAt(),
                submission.getStatus().toString(),
                submission.getTotalPoints()
        );
    }
}