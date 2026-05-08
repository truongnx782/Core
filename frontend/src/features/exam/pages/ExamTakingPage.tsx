import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Col, Radio, Row, Space, Typography, Button, Alert, Divider, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import type { AppDispatch, RootState } from '../../../store';
import { setAnswer, startExamRequest, submitExamRequest } from '../examSlice';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function formatRemaining(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const ExamTakingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams();
  const examId = Number(id);

  const { taking, answersByQuestionId, loading, submitting, latestResult, error } = useSelector(
    (s: RootState) => s.exam
  );

  const [remainingSec, setRemainingSec] = useState<number>(0);
  const submittedRef = useRef(false);
  const initialLoadRef = useRef(true);

  // Ensure session loaded (deep link case)
  useEffect(() => {
    if (!taking && examId) {
      dispatch(startExamRequest({ examId }));
    }
  }, [dispatch, examId, taking]);

  const deadline = useMemo(() => (taking ? dayjs(taking.deadline) : null), [taking]);
  const serverTimeAtStart = useMemo(() => (taking ? dayjs(taking.serverTime) : null), [taking]);

  // Countdown using server time as reference to avoid client clock issues
  useEffect(() => {
    if (!deadline || !serverTimeAtStart) return;

    const clientReceiveTime = dayjs();
    const initialRemaining = Math.max(0, deadline.diff(serverTimeAtStart, 'second'));
    setRemainingSec(initialRemaining);

    const timer = setInterval(() => {
      const elapsed = dayjs().diff(clientReceiveTime, 'second');
      const remain = Math.max(0, initialRemaining - elapsed);
      setRemainingSec(remain);
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        // Warn if less than 1 minute left
        if (remain > 0 && remain <= 60) {
          message.warning('Thời gian làm bài còn dưới 1 phút!');
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [deadline, serverTimeAtStart]);

  // Auto-submit when time runs out (not on initial load)
  useEffect(() => {
    if (!taking) return;
    if (remainingSec > 0) return;
    if (submittedRef.current) return;
    if (initialLoadRef.current) return; // Skip on initial load
    submittedRef.current = true;
    dispatch(submitExamRequest({ examId }));
  }, [dispatch, remainingSec, taking, examId]);

  // After submit success, redirect to result
  useEffect(() => {
    if (latestResult && !submitting) {
      navigate(`/dashboard/exams/${examId}/result`, { replace: true });
    }
  }, [latestResult, submitting, navigate, examId]);

  if (error) {
    return <Alert type="error" message={error} showIcon />;
  }

  if (loading || !taking) {
    return <Card loading style={{ borderRadius: 12 }} />;
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Card style={{ borderRadius: 12 }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0 }}>
                Làm bài (Focus mode)
              </Title>
              <Text type="secondary">
                Khi hết thời gian hoặc đến giờ đóng đề, hệ thống sẽ tự động nộp bài.
              </Text>
              <Divider style={{ margin: '12px 0' }} />

              {taking.questions.map((q, idx) => (
                <Card key={q.id} style={{ borderRadius: 12 }} size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>
                      Câu {idx + 1}: {q.content}
                    </Text>
                    <Radio.Group
                      value={answersByQuestionId[q.id] ?? null}
                      onChange={(e) => dispatch(setAnswer({ questionId: q.id, optionId: e.target.value }))}
                    >
                      <Space direction="vertical">
                        {q.options.map((opt) => (
                          <Radio key={opt.id} value={opt.id}>
                            {opt.content}
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card style={{ borderRadius: 12, position: 'sticky', top: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Title level={5} style={{ margin: 0 }}>
                Thời gian còn lại
              </Title>
              <div style={{ fontSize: 32, fontWeight: 800 }}>
                {formatRemaining(remainingSec)}
              </div>
              <Text type="secondary">
                Deadline: {dayjs(taking.deadline).format('DD/MM/YYYY HH:mm:ss')}
              </Text>
              <Button
                type="primary"
                loading={submitting}
                onClick={() => dispatch(submitExamRequest({ examId }))}
              >
                Nộp bài
              </Button>
              <Button onClick={() => navigate('/dashboard/exams')}>Quay lại</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ExamTakingPage;

