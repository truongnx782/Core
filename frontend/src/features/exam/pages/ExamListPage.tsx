import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Table, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../store';
import { fetchPublishedExams } from '../examSlice';
import type { ExamResponse } from '../../../types/exam';

const ExamListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { exams, loading, error } = useSelector((state: RootState) => state.exam);

  useEffect(() => {
    dispatch(fetchPublishedExams());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleTakeExam = (exam: ExamResponse) => {
    navigate(`/exams/${exam.id}/take`);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Time Limit (minutes)',
      dataIndex: 'timeLimit',
      key: 'timeLimit',
    },
    {
      title: 'Total Points',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ExamResponse) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleTakeExam(record)}
        >
          Take Exam
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>Available Exams</h2>
      <Table
        columns={columns}
        dataSource={exams}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default ExamListPage;