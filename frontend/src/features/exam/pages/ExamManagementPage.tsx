import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../store';
import { fetchMyExams, createExam, updateExam, publishExam } from '../examSlice';
import type { ExamResponse, ExamRequest } from '../../../types/exam';

const ExamManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { exams, loading, error } = useSelector((state: RootState) => state.exam);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamResponse | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchMyExams());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleCreate = () => {
    setEditingExam(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (exam: ExamResponse) => {
    setEditingExam(exam);
    form.setFieldsValue(exam);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: ExamRequest) => {
    try {
      if (editingExam) {
        await dispatch(updateExam({ id: editingExam.id, examData: values })).unwrap();
        message.success('Exam updated successfully');
      } else {
        await dispatch(createExam(values)).unwrap();
        message.success('Exam created successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      // Error handled by slice
    }
  };

  const handlePublish = async (exam: ExamResponse) => {
    try {
      await dispatch(publishExam(exam.id)).unwrap();
      message.success('Exam published successfully');
    } catch (error) {
      // Error handled by slice
    }
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
        <div>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          {record.status === 'DRAFT' && (
            <Button
              type="link"
              onClick={() => handlePublish(record)}
              loading={loading}
            >
              Publish
            </Button>
          )}
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dashboard/exams/${record.id}/questions`)}
          >
            Manage Questions
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Create Exam
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={exams}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingExam ? 'Edit Exam' : 'Create Exam'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter exam title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="subject" label="Subject">
            <Input />
          </Form.Item>

          <Form.Item
            name="totalPoints"
            label="Total Points"
            rules={[{ required: true, message: 'Please enter total points' }]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item name="timeLimit" label="Time Limit (minutes)">
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item name="passingScore" label="Passing Score">
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingExam ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamManagementPage;