package com.core.service.impl;

import com.core.common.ErrorCode;
import com.core.dto.mapper.QuestionMapper;
import com.core.dto.request.QuestionOptionRequest;
import com.core.dto.request.QuestionRequest;
import com.core.dto.response.QuestionOptionResponse;
import com.core.dto.response.QuestionResponse;
import com.core.entity.Exam;
import com.core.entity.Question;
import com.core.entity.QuestionOption;
import com.core.entity.User;
import com.core.repository.QuestionOptionRepository;
import com.core.repository.QuestionRepository;
import com.core.service.ExamService;
import com.core.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final ExamService examService;
    private final QuestionMapper questionMapper;

    @Override
    @Transactional
    public QuestionResponse createQuestion(QuestionRequest request, User currentUser) {
        Exam exam = examService.getExamEntityById(request.getExamId());
        if (!exam.getCreator().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only add questions to your own exams");
        }

        Question question = questionMapper.toEntity(request, exam);

        // Handle options for multiple choice
        if (request.getType() == Question.QuestionType.MULTIPLE_CHOICE && request.getOptions() != null) {
            final Question finalQuestion = question;
            List<QuestionOption> options = request.getOptions().stream()
                    .map(opt -> {
                        QuestionOption option = new QuestionOption();
                        option.setQuestion(finalQuestion);
                        option.setOptionText(opt.getOptionText());
                        option.setIsCorrect(opt.getIsCorrect());
                        option.setSequence(opt.getSequence());
                        return option;
                    })
                    .collect(Collectors.toList());
            question.setOptions(options);
        }

        Question savedQuestion = questionRepository.save(question);
        return toResponseWithOptions(savedQuestion);
    }

    @Override
    @Transactional
    public QuestionResponse updateQuestion(Long id, QuestionRequest request, User currentUser) {
        Question question = getQuestionEntityById(id);
        if (!question.getExam().getCreator().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only update questions in your own exams");
        }

        question.setType(request.getType());
        question.setText(request.getText());
        question.setPoints(request.getPoints());
        question.setSequence(request.getSequence());
        question.setImageUrl(request.getImageUrl());
        question.setCorrectAnswer(request.getCorrectAnswer());

        // Update options
        if (request.getType() == Question.QuestionType.MULTIPLE_CHOICE && request.getOptions() != null) {
            questionOptionRepository.deleteByQuestionId(question.getId());
            final Question finalQuestion = question;
            List<QuestionOption> options = request.getOptions().stream()
                    .map(opt -> {
                        QuestionOption option = new QuestionOption();
                        option.setQuestion(finalQuestion);
                        option.setOptionText(opt.getOptionText());
                        option.setIsCorrect(opt.getIsCorrect());
                        option.setSequence(opt.getSequence());
                        return option;
                    })
                    .collect(Collectors.toList());
            question.setOptions(options);
        }

        Question savedQuestion = questionRepository.save(question);
        return toResponseWithOptions(savedQuestion);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id, User currentUser) {
        Question question = getQuestionEntityById(id);
        if (!question.getExam().getCreator().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only delete questions from your own exams");
        }
        questionRepository.delete(question);
    }

    @Override
    public QuestionResponse getQuestionById(Long id) {
        Question question = getQuestionEntityById(id);
        return toResponseWithOptions(question);
    }

    @Override
    public List<QuestionResponse> getQuestionsByExamId(Long examId) {
        return questionRepository.findByExamIdOrderBySequence(examId)
                .stream()
                .map(this::toResponseWithOptions)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void reorderQuestions(Long examId, List<Long> questionIds, User currentUser) {
        Exam exam = examService.getExamEntityById(examId);
        if (!exam.getCreator().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only reorder questions in your own exams");
        }

        List<Question> questions = questionRepository.findByExamId(examId);
        for (int i = 0; i < questionIds.size(); i++) {
            final int index = i;
            Long questionId = questionIds.get(i);
            questions.stream()
                    .filter(q -> q.getId().equals(questionId))
                    .findFirst()
                    .ifPresent(q -> q.setSequence(index));
        }
        questionRepository.saveAll(questions);
    }

    private Question getQuestionEntityById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ErrorCode.EXAM_NOT_FOUND.getMessage())); // Reuse error code
    }

    private QuestionResponse toResponseWithOptions(Question question) {
        QuestionResponse response = questionMapper.toResponse(question);
        if (question.getOptions() != null) {
            List<QuestionOptionResponse> optionResponses = question.getOptions().stream()
                    .map(opt -> new QuestionOptionResponse(opt.getId(), opt.getOptionText(), opt.getIsCorrect(), opt.getSequence()))
                    .collect(Collectors.toList());
            response.setOptions(optionResponses);
        }
        return response;
    }
}