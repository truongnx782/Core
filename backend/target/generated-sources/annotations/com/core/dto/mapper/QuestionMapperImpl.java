package com.core.dto.mapper;

import com.core.dto.request.QuestionRequest;
import com.core.dto.response.QuestionOptionResponse;
import com.core.dto.response.QuestionResponse;
import com.core.entity.Exam;
import com.core.entity.Question;
import com.core.entity.QuestionOption;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-08T19:50:22+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.10 (Oracle Corporation)"
)
@Component
public class QuestionMapperImpl implements QuestionMapper {

    @Override
    public Question toEntity(QuestionRequest request, Exam exam) {
        if ( request == null && exam == null ) {
            return null;
        }

        Question question = new Question();

        if ( request != null ) {
            question.setType( request.getType() );
            question.setText( request.getText() );
            question.setPoints( request.getPoints() );
            question.setSequence( request.getSequence() );
            question.setImageUrl( request.getImageUrl() );
            question.setCorrectAnswer( request.getCorrectAnswer() );
        }
        question.setExam( exam );

        return question;
    }

    @Override
    public QuestionResponse toResponse(Question question) {
        if ( question == null ) {
            return null;
        }

        QuestionResponse questionResponse = new QuestionResponse();

        questionResponse.setExamId( questionExamId( question ) );
        questionResponse.setId( question.getId() );
        questionResponse.setType( question.getType() );
        questionResponse.setText( question.getText() );
        questionResponse.setPoints( question.getPoints() );
        questionResponse.setSequence( question.getSequence() );
        questionResponse.setImageUrl( question.getImageUrl() );
        questionResponse.setOptions( questionOptionListToQuestionOptionResponseList( question.getOptions() ) );
        questionResponse.setCorrectAnswer( question.getCorrectAnswer() );

        return questionResponse;
    }

    private Long questionExamId(Question question) {
        Exam exam = question.getExam();
        if ( exam == null ) {
            return null;
        }
        return exam.getId();
    }

    protected QuestionOptionResponse questionOptionToQuestionOptionResponse(QuestionOption questionOption) {
        if ( questionOption == null ) {
            return null;
        }

        QuestionOptionResponse questionOptionResponse = new QuestionOptionResponse();

        questionOptionResponse.setId( questionOption.getId() );
        questionOptionResponse.setOptionText( questionOption.getOptionText() );
        questionOptionResponse.setIsCorrect( questionOption.getIsCorrect() );
        questionOptionResponse.setSequence( questionOption.getSequence() );

        return questionOptionResponse;
    }

    protected List<QuestionOptionResponse> questionOptionListToQuestionOptionResponseList(List<QuestionOption> list) {
        if ( list == null ) {
            return null;
        }

        List<QuestionOptionResponse> list1 = new ArrayList<QuestionOptionResponse>( list.size() );
        for ( QuestionOption questionOption : list ) {
            list1.add( questionOptionToQuestionOptionResponse( questionOption ) );
        }

        return list1;
    }
}
