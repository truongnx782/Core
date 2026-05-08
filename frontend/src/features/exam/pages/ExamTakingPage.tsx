import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Radio, Input, Card, message, Space, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../store';
import { fetchQuestions } from '../../exam/questionSlice';
import { submitExam } from '../../exam/examSlice';

const { Title, Text } = Typography;

interface Answer {
  questionId: number;
  answer: string;
}

const ExamTakingPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { questions, loading: questionsLoading } = useSelector((state: RootState) => state.question);
  const { currentExam, loading: examLoading } = useSelector((state: RootState) => state.exam);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [form] = Form.useForm();

  useEffect(() => {
    if (examId) {
      dispatch(fetchQuestions(parseInt(examId)));
      // TODO: Fetch exam details including time limit
      // For now, set a default time
      setTimeLeft(60 * 60); // 1 hour
    }
  }, [dispatch, examId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && questions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft, questions]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, answer } : a);
      } else {
        return [...prev, { questionId, answer }];
      }
    });
  };

  const handleSubmit = async () => {
    if (!examId) return;

    try {
      await dispatch(submitExam({
        examId: parseInt(examId),
        answers: answers.map(a => ({
          questionId: a.questionId,
          answer: a.answer
        }))
      })).unwrap();
      message.success('Exam submitted successfully');
      navigate('/exams');
    } catch (error) {
      message.error('Failed to submit exam');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (questionsLoading || examLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>{currentExam?.title || 'Exam'}</Title>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          <Text strong>{formatTime(timeLeft)}</Text>
        </div>
      </div>

      <Form form={form} onFinish={handleSubmit}>
        {questions.map((question: any, index: number) => (
          <Card key={question.id} style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Question {index + 1}: </Text>
              <Text>{question.questionText}</Text>
            </div>

            {question.imageUrl && (
              <img src={question.imageUrl} alt="Question" style={{ maxWidth: '100%', marginBottom: 16 }} />
            )}

            {question.type === 'MULTIPLE_CHOICE' && question.options && (
              <Form.Item name={`question_${question.id}`}>
                <Radio.Group
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                >
                  {question.options.map((option: string, optIndex: number) => (
                    <Radio key={optIndex} value={option}>
                      {option}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            )}

            {question.type === 'TRUE_FALSE' && (
              <Form.Item name={`question_${question.id}`}>
                <Radio.Group
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                >
                  <Radio value="true">True</Radio>
                  <Radio value="false">False</Radio>
                </Radio.Group>
              </Form.Item>
            )}

            {question.type === 'SHORT_ANSWER' && (
              <Form.Item name={`question_${question.id}`}>
                <Input
                  placeholder="Enter your answer"
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
              </Form.Item>
            )}

            <Text type="secondary">Points: {question.points}</Text>
          </Card>
        ))}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" size="large">
              Submit Exam
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default ExamTakingPage;