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

/**
 * Service implementation for managing questions within an exam.
 * Triển khai dịch vụ để quản lý các câu hỏi trong một đề thi.
 */
@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final QuestionMapper questionMapper;

    /**
     * Adds a new question and its options to a specific exam.
     * Thêm một câu hỏi mới và các đáp án đi kèm vào một đề thi cụ thể.
     *
     * @param examId ID of the exam / ID của đề thi
     * @param request Question details / Thông tin chi tiết câu hỏi
     * @return Saved question details / Thông tin câu hỏi đã lưu
     */
    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public QuestionResponse addToExam(Long examId, QuestionRequest request) {
        // Thêm câu hỏi mới và các đáp án liên kết với đề thi
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
        // Chú ý: lazy load options trước khi chuyển sang response
        questions.forEach(q -> q.setOptions(optionRepository.findByQuestionIdOrderByIdAsc(q.getId())));
        return questionMapper.toResponses(questions);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public QuestionResponse update(Long questionId, QuestionRequest request) {
        // Cập nhật câu hỏi và thay thế đáp án mà không thay đổi collection đã được quản lý
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
        // Xóa câu hỏi và các tùy chọn liên quan
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));
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

