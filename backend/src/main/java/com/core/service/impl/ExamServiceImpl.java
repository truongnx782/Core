package com.core.service.impl;

import com.core.common.ErrorCode;
import com.core.dto.mapper.ExamMapper;
import com.core.dto.request.ExamRequest;
import com.core.dto.response.ExamResponse;
import com.core.entity.Exam;
import com.core.entity.User;
import com.core.repository.ExamRepository;
import com.core.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final ExamMapper examMapper;

    @Override
    @Transactional
    public ExamResponse createExam(ExamRequest request, User creator) {
        Exam exam = examMapper.toEntity(request, creator);
        exam = examRepository.save(exam);
        return examMapper.toResponse(exam);
    }

    @Override
    @Transactional
    public ExamResponse updateExam(Long id, ExamRequest request, User currentUser) {
        Exam exam = getExamEntityById(id);
        if (!exam.getCreator().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only update your own exams");
        }
        // Update fields
        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setSubject(request.getSubject());
        exam.setTotalPoints(request.getTotalPoints());
        exam.setTimeLimit(request.getTimeLimit());
        exam.setPassingScore(request.getPassingScore());
        exam.setPublishedAt(request.getPublishedAt());
        exam.setShuffleQuestions(request.getShuffleQuestions());
        exam = examRepository.save(exam);
        return examMapper.toResponse(exam);
    }

    @Override
    @Transactional
    public void deleteExam(Long id, User currentUser) {
        Exam exam = getExamEntityById(id);
        if (!exam.getCreator().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only delete your own exams");
        }
        examRepository.delete(exam);
    }

    @Override
    public ExamResponse getExamById(Long id) {
        Exam exam = getExamEntityById(id);
        return examMapper.toResponse(exam);
    }

    @Override
    public List<ExamResponse> getExamsByCreator(User creator) {
        if (creator == null || creator.getId() == null) {
            return Collections.emptyList();
        }
        return examRepository.findByCreatorId(creator.getId())
                .stream()
                .map(examMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExamResponse> getActiveExams() {
        return examRepository.findByStatus(Exam.ExamStatus.ACTIVE)
                .stream()
                .map(examMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ExamResponse publishExam(Long id, User currentUser) {
        Exam exam = getExamEntityById(id);
        if (!exam.getCreator().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only publish your own exams");
        }
        exam.setStatus(Exam.ExamStatus.ACTIVE);
        exam.setPublishedAt(java.time.LocalDateTime.now());
        exam = examRepository.save(exam);
        return examMapper.toResponse(exam);
    }

    @Override
    @Transactional
    public ExamResponse archiveExam(Long id, User currentUser) {
        Exam exam = getExamEntityById(id);
        if (!exam.getCreator().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only archive your own exams");
        }
        exam.setStatus(Exam.ExamStatus.ARCHIVED);
        exam = examRepository.save(exam);
        return examMapper.toResponse(exam);
    }

    @Override
    public Exam getExamEntityById(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ErrorCode.EXAM_NOT_FOUND.getMessage()));
    }
}