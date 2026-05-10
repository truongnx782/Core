package com.core.service.impl;

import com.core.dto.request.SubmitExamRequest;
import com.core.dto.response.StudentSubmissionResponse;
import com.core.entity.*;
import com.core.repository.*;
import com.core.service.SubmissionService;
import com.core.util.SecurityUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final ExamRepository examRepository;
    private final ExamSessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final StudentSubmissionRepository submissionRepository;
    private final StudentAnswerRepository answerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public StudentSubmissionResponse submit(Long examId, SubmitExamRequest request) {
        Long studentId = SecurityUtils.getCurrentUserId();

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntityNotFoundException("Exam not found"));

        ExamSession session = sessionRepository.findByIdAndStudentId(request.getSessionId(), studentId)
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));

        if (!Objects.equals(session.getExam().getId(), examId)) {
            throw new IllegalArgumentException("Session does not belong to this exam");
        }

        // idempotent: if already submitted, return latest submission
        if (session.getStatus() == ExamSession.SessionStatus.SUBMITTED) {
            StudentSubmission existing = submissionRepository.findTopByExamIdAndStudentIdOrderBySubmittedAtDesc(examId, studentId)
                    .orElseThrow(() -> new EntityNotFoundException("Submission not found"));
            return toResponse(existing);
        }

        LocalDateTime now = LocalDateTime.now();

        // Time validation:
        // - must be within system endTime
        // - must be within session deadline (expiresAt)
        // Real deadline = min(expiresAt, endTime)
        LocalDateTime deadline = session.getExpiresAt().isBefore(exam.getEndTime())
                ? session.getExpiresAt()
                : exam.getEndTime();

        boolean finalSubmission = !now.isBefore(deadline);
        if (finalSubmission && session.getStatus() != ExamSession.SessionStatus.SUBMITTED) {
            session.setSubmittedAt(now);
            session.setStatus(ExamSession.SessionStatus.SUBMITTED);
            sessionRepository.save(session);
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Load questions and correct options
        List<Question> questions = questionRepository.findByExamIdOrderByIdAsc(examId);
        if (questions.isEmpty()) {
            throw new IllegalArgumentException("Exam has no questions");
        }

        // Build map questionId -> correctOptionId
        Map<Long, Long> correctOptionByQuestionId = new HashMap<>();
        for (Question q : questions) {
            var opts = optionRepository.findByQuestionIdOrderByIdAsc(q.getId());
            Long correctOptionId = opts.stream()
                    .filter(QuestionOption::isCorrect)
                    .map(BaseEntity::getId)
                    .findFirst()
                    .orElse(null);
            if (correctOptionId == null) {
                throw new IllegalArgumentException("Question " + q.getId() + " has no correct option configured");
            }
            correctOptionByQuestionId.put(q.getId(), correctOptionId);
        }

        // Normalize answers: keep only answers for questions in this exam
        Set<Long> questionIds = questions.stream().map(BaseEntity::getId).collect(Collectors.toSet());
        Map<Long, Long> selectedByQuestionId = new HashMap<>();
        for (SubmitExamRequest.AnswerItem a : request.getAnswers()) {
            if (a.getQuestionId() == null || !questionIds.contains(a.getQuestionId())) continue;
            // last write wins
            selectedByQuestionId.put(a.getQuestionId(), a.getSelectedOptionId());
        }

        int total = questions.size();
        int correct = 0;
        for (Long qId : questionIds) {
            Long selected = selectedByQuestionId.get(qId);
            if (selected != null && Objects.equals(selected, correctOptionByQuestionId.get(qId))) {
                correct++;
            }
        }

        double score = round2(((double) correct / (double) total) * 10.0);

        Optional<StudentSubmission> existingSubmissionOpt = submissionRepository.findBySessionId(session.getId());
        StudentSubmission submission;
        if (existingSubmissionOpt.isPresent()) {
            submission = existingSubmissionOpt.get();
            if (session.getStatus() == ExamSession.SessionStatus.SUBMITTED) {
                return toResponse(submission);
            }
            answerRepository.deleteBySubmissionId(submission.getId());
            submission.getAnswers().clear();
        } else {
            submission = new StudentSubmission();
            submission.setExam(exam);
            submission.setStudent(student);
            submission.setSession(session);
        }

        submission.setSubmittedAt(now);
        submission.setTotalQuestions(total);
        submission.setCorrectCount(correct);
        submission.setScore(score);
        submission.setDurationSeconds((int) Duration.between(session.getStartedAt(), now).getSeconds());
        submission = submissionRepository.save(submission);

        // Persist answers (one row per question; unanswered -> null)
        for (Question q : questions) {
            StudentAnswer ans = new StudentAnswer();
            ans.setSubmission(submission);
            ans.setQuestion(q);
            Long selectedOptionId = selectedByQuestionId.get(q.getId());
            if (selectedOptionId != null) {
                // Ensure option belongs to this exam (prevents cheating)
                QuestionOption option = optionRepository.findByIdAndQuestionExamId(selectedOptionId, examId)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid option id: " + selectedOptionId));
                ans.setSelectedOption(option);
            } else {
                ans.setSelectedOption(null);
            }
            answerRepository.save(ans);
        }

        // Return review response (includes correctOptionId per question)
        return toResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentSubmissionResponse getMyLatestResult(Long examId) {
        Long studentId = SecurityUtils.getCurrentUserId();

        ExamSession session = sessionRepository.findTopByExamIdAndStudentIdOrderByStartedAtDesc(examId, studentId)
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntityNotFoundException("Exam not found"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline = session.getExpiresAt().isBefore(exam.getEndTime())
                ? session.getExpiresAt()
                : exam.getEndTime();

        if (session.getStatus() == ExamSession.SessionStatus.IN_PROGRESS && now.isBefore(deadline)) {
            throw new IllegalStateException("Kết quả chỉ xem được sau khi hết giờ làm bài.");
        }

        StudentSubmission submission = submissionRepository.findTopByExamIdAndStudentIdOrderBySubmittedAtDesc(examId, studentId)
                .orElseThrow(() -> new EntityNotFoundException("Submission not found"));
        return toResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentSubmissionResponse> getMyHistory(Long examId) {
        Long studentId = SecurityUtils.getCurrentUserId();
        // If examId is provided, just return history for that exam using latest+filter in memory
        // (simple for now; can optimize with query later)
        return submissionRepository.findByStudentIdOrderBySubmittedAtDesc(studentId).stream()
                .filter(s -> Objects.equals(s.getExam().getId(), examId))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentSubmissionResponse> getExamSubmissions(Long examId) {
        // Return latest submission per student to avoid showing intermediate saves.
        return submissionRepository.findByExamIdOrderBySubmittedAtDesc(examId).stream()
                .collect(Collectors.toMap(
                        s -> s.getStudent().getId(),
                        Function.identity(),
                        (existing, newer) -> existing,
                        LinkedHashMap::new
                ))
                .values()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private StudentSubmissionResponse toResponse(StudentSubmission submission) {
        List<StudentAnswer> answers = answerRepository.findBySubmissionIdOrderByIdAsc(submission.getId());

        // Build correct map
        Long examId = submission.getExam().getId();
        List<Question> questions = questionRepository.findByExamIdOrderByIdAsc(examId);
        Map<Long, Long> correctOptionByQuestionId = new HashMap<>();
        for (Question q : questions) {
            var opts = optionRepository.findByQuestionIdOrderByIdAsc(q.getId());
            Long correctOptionId = opts.stream()
                    .filter(QuestionOption::isCorrect)
                    .map(BaseEntity::getId)
                    .findFirst()
                    .orElse(null);
            if (correctOptionId != null) {
                correctOptionByQuestionId.put(q.getId(), correctOptionId);
            }
        }

        var answerItems = answers.stream().map(a -> {
            Long qId = a.getQuestion().getId();
            Long selectedId = a.getSelectedOption() != null ? a.getSelectedOption().getId() : null;
            Long correctId = correctOptionByQuestionId.get(qId);
            boolean isCorrect = selectedId != null && correctId != null && Objects.equals(selectedId, correctId);
            return StudentSubmissionResponse.AnswerReviewItem.builder()
                    .questionId(qId)
                    .selectedOptionId(selectedId)
                    .correctOptionId(correctId)
                    .correct(isCorrect)
                    .build();
        }).toList();

        return StudentSubmissionResponse.builder()
                .id(submission.getId())
                .examId(submission.getExam().getId())
                .studentId(submission.getStudent().getId())
                .studentFullName(submission.getStudent().getFullName())
                .submittedAt(submission.getSubmittedAt())
                .totalQuestions(submission.getTotalQuestions())
                .correctCount(submission.getCorrectCount())
                .score(submission.getScore())
                .durationSeconds(submission.getDurationSeconds())
                .answers(answerItems)
                .build();
    }

    private static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

