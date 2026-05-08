package com.core.dto.mapper;

import com.core.dto.request.ExamRequest;
import com.core.dto.response.ExamResponse;
import com.core.entity.Exam;
import com.core.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-08T19:50:22+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.10 (Oracle Corporation)"
)
@Component
public class ExamMapperImpl implements ExamMapper {

    @Override
    public Exam toEntity(ExamRequest request, User creator) {
        if ( request == null && creator == null ) {
            return null;
        }

        Exam exam = new Exam();

        if ( request != null ) {
            exam.setTitle( request.getTitle() );
            exam.setDescription( request.getDescription() );
            exam.setSubject( request.getSubject() );
            exam.setTotalPoints( request.getTotalPoints() );
            exam.setTimeLimit( request.getTimeLimit() );
            exam.setPassingScore( request.getPassingScore() );
            exam.setPublishedAt( request.getPublishedAt() );
            exam.setShuffleQuestions( request.getShuffleQuestions() );
        }
        exam.setCreator( creator );
        exam.setStatus( Exam.ExamStatus.DRAFT );

        return exam;
    }

    @Override
    public ExamResponse toResponse(Exam exam) {
        if ( exam == null ) {
            return null;
        }

        ExamResponse examResponse = new ExamResponse();

        examResponse.setCreatorName( examCreatorFullName( exam ) );
        examResponse.setId( exam.getId() );
        examResponse.setTitle( exam.getTitle() );
        examResponse.setDescription( exam.getDescription() );
        examResponse.setSubject( exam.getSubject() );
        examResponse.setTotalPoints( exam.getTotalPoints() );
        examResponse.setTimeLimit( exam.getTimeLimit() );
        examResponse.setPassingScore( exam.getPassingScore() );
        examResponse.setPublishedAt( exam.getPublishedAt() );
        examResponse.setStatus( exam.getStatus() );
        examResponse.setShuffleQuestions( exam.getShuffleQuestions() );
        examResponse.setCreatedAt( exam.getCreatedAt() );
        examResponse.setUpdatedAt( exam.getUpdatedAt() );

        return examResponse;
    }

    private String examCreatorFullName(Exam exam) {
        User creator = exam.getCreator();
        if ( creator == null ) {
            return null;
        }
        return creator.getFullName();
    }
}
