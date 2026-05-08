import React, { useEffect } from 'react';
import { Card, Space, Typography, Alert, Button, Tag, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { AppDispatch, RootState } from '../../../store';
import { fetchLatestResultRequest } from '../examSlice';

const { Title, Text } = Typography;

const ExamResultPage: React.FC = () => {
  const { id } = useParams();
  const examId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { latestResult, loading, error } = useSelector((s: RootState) => s.exam);

  useEffect(() => {
    if (examId) dispatch(fetchLatestResultRequest({ examId }));
  }, [dispatch, examId]);

  if (error) return <Alert type="error" message={error} showIcon />;

  return (
    <Card style={{ borderRadius: 12 }} loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Title level={4} style={{ margin: 0 }}>
          Kết quả
        </Title>
        {!latestResult ? (
          <Alert type="info" message="Chưa có kết quả cho đề này." showIcon />
        ) : (
          <>
            <Space wrap>
              <Tag color="blue">Điểm: {latestResult.score}/10</Tag>
              <Tag color="green">
                Đúng: {latestResult.correctCount}/{latestResult.totalQuestions}
              </Tag>
              <Tag>
                Nộp lúc: {dayjs(latestResult.submittedAt).format('DD/MM/YYYY HH:mm:ss')}
              </Tag>
              <Tag>
                Thời gian làm: {Math.round(latestResult.durationSeconds / 60)} phút
              </Tag>
            </Space>

            <Divider />

            <Text strong>Review nhanh:</Text>
            <Space wrap>
              {latestResult.answers.map((a) => (
                <Tag key={a.questionId} color={a.correct ? 'success' : 'error'}>
                  Q{a.questionId}: {a.correct ? 'Đúng' : 'Sai'}
                </Tag>
              ))}
            </Space>
          </>
        )}

        <Space>
          <Button type="primary" onClick={() => navigate('/dashboard/exams')}>
            Danh sách đề
          </Button>
          <Button onClick={() => navigate(`/dashboard/exams/${examId}/take`)}>Làm lại / Tiếp tục</Button>
        </Space>
      </Space>
    </Card>
  );
};

export default ExamResultPage;

