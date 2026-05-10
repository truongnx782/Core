import React, { useEffect, useMemo } from 'react';
import { Card, Space, Typography, Alert, Button, Tag, Divider, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { AppDispatch, RootState } from '../../../store';
import { fetchExamSubmissionsRequest, fetchLatestResultRequest } from '../examSlice';
import type { StudentSubmissionResult } from '../examTypes';

const { Title, Text } = Typography;

const ExamResultPage: React.FC = () => {
  const { id } = useParams();
  const examId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { latestResult, examSubmissions, loading, error } = useSelector((s: RootState) => s.exam);
  const userRole = useSelector((s: RootState) => s.auth.user?.role);
  const isTeacher = userRole === 'ADMIN' || userRole === 'MANAGER';

  useEffect(() => {
    if (!examId) return;
    if (isTeacher) {
      dispatch(fetchExamSubmissionsRequest({ examId }));
    } else {
      dispatch(fetchLatestResultRequest({ examId }));
    }
  }, [dispatch, examId, isTeacher]);

  const columns: ColumnsType<StudentSubmissionResult> = useMemo(
    () => [
      {
        title: 'Học sinh',
        dataIndex: 'studentFullName',
        key: 'studentFullName',
        render: (value, record) => value || `ID ${record.studentId}`,
      },
      {
        title: 'Điểm',
        dataIndex: 'score',
        key: 'score',
      },
      {
        title: 'Đúng',
        key: 'correctCount',
        render: (_value, record) => `${record.correctCount}/${record.totalQuestions}`,
      },
      {
        title: 'Thời gian',
        dataIndex: 'durationSeconds',
        key: 'durationSeconds',
        render: (value) => `${Math.round(value / 60)} phút`,
      },
      {
        title: 'Nộp lúc',
        dataIndex: 'submittedAt',
        key: 'submittedAt',
        render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm:ss'),
      },
    ],
    []
  );

  if (error) return <Alert type="error" message={error} showIcon />;

  return (
    <Card style={{ borderRadius: 12 }} loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Title level={4} style={{ margin: 0 }}>
          Kết quả
        </Title>

        {isTeacher ? (
          examSubmissions.length === 0 ? (
            <Alert type="info" message="Chưa có nộp bài cho đề này." showIcon />
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={examSubmissions}
              pagination={false}
            />
          )
        ) : !latestResult ? (
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
          {(!isTeacher && !latestResult) && (
            <Button onClick={() => navigate(`/dashboard/exams/${examId}`)}>
              Tiếp tục làm bài
            </Button>
          )}
          <Button type="primary" onClick={() => navigate('/dashboard/exams')}>
            Danh sách đề
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

export default ExamResultPage;

