package com.core.service.impl;

import com.core.dto.mapper.ExamMapper;
import com.core.dto.mapper.QuestionMapper;
import com.core.dto.request.ExamRequest;
import com.core.dto.response.ExamResponse;
import com.core.dto.response.PageResponse;
import com.core.dto.response.StartExamResponse;
import com.core.entity.Exam;
import com.core.entity.ExamSession;
import com.core.entity.User;
import com.core.repository.ExamRepository;
import com.core.repository.ExamSessionRepository;
import com.core.repository.QuestionRepository;
import com.core.repository.UserRepository;
import com.core.service.ExamService;
import com.core.util.SecurityUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final ExamSessionRepository examSessionRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final ExamMapper examMapper;
    private final QuestionMapper questionMapper;

    // ---- Admin ----

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ExamResponse create(ExamRequest request) {
        validateTime(request.getStartTime(), request.getEndTime(), request.getDurationMinutes());
        Exam exam = examMapper.toEntity(request);
        if (request.getPublished() != null) {
            exam.setPublished(request.getPublished());
        }
        exam = examRepository.save(exam);
        return examMapper.toResponse(exam);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ExamResponse update(Long id, ExamRequest request) {
        Exam exam = findExamOrThrow(id);
        validateTime(request.getStartTime(), request.getEndTime(), request.getDurationMinutes());
        examMapper.update(exam, request);
        if (request.getPublished() != null) {
            exam.setPublished(request.getPublished());
        }
        exam = examRepository.save(exam);
        return examMapper.toResponse(exam);
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResponse getById(Long id) {
        return examMapper.toResponse(findExamOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public PageResponse<ExamResponse> search(String keyword, String category, Boolean published, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Exam> examPage = examRepository.search(keyword, category, published, pageable);
        List<ExamResponse> content = examPage.getContent().stream().map(examMapper::toResponse).toList();
        return PageResponse.of(content, examPage.getNumber(), examPage.getSize(), examPage.getTotalElements(), examPage.getTotalPages(), examPage.isLast());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public void delete(Long id) {
        Exam exam = findExamOrThrow(id);
        examRepository.delete(exam);
    }

    // ---- Student ----

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExamResponse> listAvailableForStudent(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startTime"));
        Page<Exam> examPage = examRepository.findAvailableForStudent(LocalDateTime.now(), pageable);
        List<ExamResponse> content = examPage.getContent().stream().map(examMapper::toResponse).toList();
        return PageResponse.of(content, examPage.getNumber(), examPage.getSize(), examPage.getTotalElements(), examPage.getTotalPages(), examPage.isLast());
    }

    @Override
    @Transactional
    public StartExamResponse startExam(Long examId) {
        Exam exam = findExamOrThrow(examId);
        if (!exam.isPublished()) {
            throw new IllegalArgumentException("Exam is not published");
        }

        // Time-window validation uses server time (avoid client clock issues)
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime())) {
            throw new IllegalArgumentException("Exam is not open yet");
        }
        if (now.isAfter(exam.getEndTime())) {
            throw new IllegalArgumentException("Exam is closed");
        }

        Long studentId = SecurityUtils.getCurrentUserId();
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Reuse existing latest session if still IN_PROGRESS, else create new
        ExamSession session = examSessionRepository
                .findTopByExamIdAndStudentIdOrderByStartedAtDesc(examId, studentId)
                .filter(s -> s.getStatus() == ExamSession.SessionStatus.IN_PROGRESS)
                .orElseGet(() -> {
                    ExamSession s = new ExamSession();
                    s.setExam(exam);
                    s.setStudent(student);
                    s.setStartedAt(now);
                    s.setExpiresAt(now.plusMinutes(exam.getDurationMinutes()));
                    s.setStatus(ExamSession.SessionStatus.IN_PROGRESS);
                    return examSessionRepository.save(s);
                });

        // Actual deadline: min(session.expiresAt, exam.endTime)
        LocalDateTime deadline = session.getExpiresAt().isBefore(exam.getEndTime())
                ? session.getExpiresAt()
                : exam.getEndTime();

        // If deadline has passed, exam time is over
        if (deadline.isBefore(now) || deadline.isEqual(now)) {
            throw new IllegalArgumentException("Exam time has expired");
        }

        var questions = questionRepository.findByExamIdOrderByIdAsc(examId);
        return StartExamResponse.builder()
                .examId(examId)
                .sessionId(session.getId())
                .serverTime(now)
                .deadline(deadline)
                .durationMinutes(exam.getDurationMinutes())
                .questions(questionMapper.toStudentQuestionResponses(questions))
                .build();
    }

    // ---- helpers ----

    private Exam findExamOrThrow(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Exam not found"));
    }

    /**
     * Validates exam timing constraints.
     * - startTime < endTime
     * - durationMinutes > 0
     *
     * Note: duration can exceed (endTime - startTime) depending on business.
     * We do NOT forbid it because the actual student deadline is min(expiresAt, endTime).
     */
    private void validateTime(LocalDateTime start, LocalDateTime end, Integer durationMinutes) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (durationMinutes == null || durationMinutes <= 0) {
            throw new IllegalArgumentException("Duration must be positive");
        }
    }
}

