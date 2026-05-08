package com.core.service.impl;

import com.core.dto.mapper.QuestionMapper;
import com.core.dto.request.QuestionOptionRequest;
import com.core.dto.request.QuestionRequest;
import com.core.dto.response.QuestionResponse;
import com.core.entity.Exam;
import com.core.entity.Question;
import com.core.entity.QuestionOption;
import com.core.repository.ExamRepository;
import com.core.repository.QuestionOptionRepository;
import com.core.repository.QuestionRepository;
import com.core.service.QuestionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final QuestionMapper questionMapper;

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public QuestionResponse addToExam(Long examId, QuestionRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new EntityNotFoundException("Exam not found"));

        validateOptions(request.getOptions());

        Question question = questionMapper.toEntity(request);
        question.setExam(exam);
        question = questionRepository.save(question);

        for (QuestionOptionRequest optionReq : request.getOptions()) {
            QuestionOption option = new QuestionOption();
            option.setQuestion(question);
            option.setContent(optionReq.getContent());
            option.setCorrect(Boolean.TRUE.equals(optionReq.getCorrect()));
            option = optionRepository.save(option);
            question.getOptions().add(option);
        }

        return questionMapper.toResponse(question);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public List<QuestionResponse> listByExam(Long examId) {
        var questions = questionRepository.findByExamIdOrderByIdAsc(examId);
        // ensure options are loaded for mapping (lazy): fetch via repository per question
        questions.forEach(q -> q.setOptions(optionRepository.findByQuestionIdOrderByIdAsc(q.getId())));
        return questionMapper.toResponses(questions);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public QuestionResponse update(Long questionId, QuestionRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));

        validateOptions(request.getOptions());
        questionMapper.update(question, request);
        question = questionRepository.save(question);

        // Remove existing options without replacing the managed collection instance.
        var oldOptions = optionRepository.findByQuestionIdOrderByIdAsc(questionId);
        optionRepository.deleteAll(oldOptions);
        question.getOptions().clear();

        for (QuestionOptionRequest optionReq : request.getOptions()) {
            QuestionOption option = new QuestionOption();
            option.setQuestion(question);
            option.setContent(optionReq.getContent());
            option.setCorrect(Boolean.TRUE.equals(optionReq.getCorrect()));
            option = optionRepository.save(option);
            question.getOptions().add(option);
        }

        return questionMapper.toResponse(question);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public void delete(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));
        // options will be removed by orphanRemoval if loaded; ensure removal anyway:
        optionRepository.deleteAll(optionRepository.findByQuestionIdOrderByIdAsc(questionId));
        questionRepository.delete(question);
    }

    private void validateOptions(List<QuestionOptionRequest> options) {
        if (options == null || options.isEmpty()) {
            throw new IllegalArgumentException("Options are required");
        }
        long correctCount = options.stream().filter(o -> Boolean.TRUE.equals(o.getCorrect())).count();
        if (correctCount != 1) {
            throw new IllegalArgumentException("Each question must have exactly 1 correct option");
        }
    }
}

