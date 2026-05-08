import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Table, Modal, Form, Input, Radio, Upload, message, Space, InputNumber } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { RootState, AppDispatch } from '../../../store';
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } from '../questionSlice';
import type { QuestionResponse, QuestionRequest, QuestionOptionRequest } from '../../../types/question';

const QuestionManagementPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { questions, loading, error } = useSelector((state: RootState) => state.question);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionResponse | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (examId) {
      dispatch(fetchQuestions(parseInt(examId)));
    }
  }, [dispatch, examId]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleCreate = () => {
    setEditingQuestion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const optionsToTextarea = (options?: QuestionResponse['options']) => {
    if (!options || options.length === 0) return '';
    return options
      .map((opt) => (typeof opt === 'string' ? opt : opt.optionText))
      .filter((s) => String(s ?? '').trim().length > 0)
      .join('\n');
  };

  const textareaToOptions = (raw: string | undefined, correctAnswer: string | undefined): QuestionOptionRequest[] => {
    const correct = (correctAnswer ?? '').trim();
    const lines = (raw ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    return lines.map((optionText, idx) => ({
      optionText,
      sequence: idx + 1,
      isCorrect: correct.length > 0 ? optionText === correct : false,
    }));
  };

  const handleEdit = (question: QuestionResponse) => {
    setEditingQuestion(question);
    form.setFieldsValue({
      ...question,
      text: (question as any).text ?? (question as any).questionText,
      options: optionsToTextarea(question.options),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (questionId: number) => {
    try {
      await dispatch(deleteQuestion(questionId)).unwrap();
      message.success('Question deleted successfully');
    } catch (error) {
      // Error handled by slice
    }
  };

  const handleSubmit = async (values: any) => {
    const { questionText, ...rest } = values;
    const questionData: QuestionRequest = {
      ...rest,
      text: values.text ?? questionText,
      examId: parseInt(examId!),
      options: textareaToOptions(values.options, values.correctAnswer),
    };

    try {
      if (editingQuestion) {
        await dispatch(updateQuestion({ id: editingQuestion.id, questionData })).unwrap();
        message.success('Question updated successfully');
      } else {
        await dispatch(createQuestion(questionData)).unwrap();
        message.success('Question created successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      // Error handled by slice
    }
  };

  const columns = [
    {
      title: 'Question',
      dataIndex: 'text',
      key: 'text',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: QuestionResponse) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => navigate('/dashboard/exams')}>
          Back to Exams
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Question
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(questions) ? questions : []}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingQuestion ? 'Edit Question' : 'Add Question'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="text"
            label="Question Text"
            rules={[{ required: true, message: 'Please enter question text' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="type"
            label="Question Type"
            rules={[{ required: true, message: 'Please select question type' }]}
          >
            <Radio.Group>
              <Radio value="MULTIPLE_CHOICE">Multiple Choice</Radio>
              <Radio value="TRUE_FALSE">True/False</Radio>
              <Radio value="SHORT_ANSWER">Short Answer</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="options"
            label="Options (one per line for multiple choice)"
          >
            <Input.TextArea rows={4} placeholder="Option 1&#10;Option 2&#10;Option 3&#10;Option 4" />
          </Form.Item>

          <Form.Item
            name="correctAnswer"
            label="Correct Answer"
            rules={[{ required: true, message: 'Please enter correct answer' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="points"
            label="Points"
            rules={[{ required: true, message: 'Please enter points' }]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item
            name="image"
            label="Image (optional)"
          >
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingQuestion ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionManagementPage;