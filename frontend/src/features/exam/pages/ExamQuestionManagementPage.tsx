import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Space,
  Typography,
  Button,
  Skeleton,
  List,
  Form,
  Input,
  Radio,
  Alert,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store';
import type { CreateQuestionRequest, QuestionInfo } from '../examTypes';
import {
  fetchQuestionsRequest,
  addQuestionRequest,
  updateQuestionRequest,
  deleteQuestionRequest,
} from '../examSlice';
import AppModal from '../../../components/common/AppModal';

const { Title, Text } = Typography;

const ExamQuestionManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const examId = Number(id);

  const { questions, questionLoading, questionError } = useSelector((state: RootState) => state.exam);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionInfo | null>(null);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [form] = Form.useForm();

  useEffect(() => {
    if (examId) {
      dispatch(fetchQuestionsRequest({ examId }));
    }
  }, [dispatch, examId]);

  useEffect(() => {
    if (modalOpen) {
      if (isEditMode && selectedQuestion) {
        const correctIdx = selectedQuestion.options.findIndex((opt) => opt.correct);
        form.setFieldsValue({
          content: selectedQuestion.content,
          options: selectedQuestion.options.map((opt) => ({ content: opt.content })),
        });
        setCorrectIndex(correctIdx >= 0 ? correctIdx : 0);
      } else {
        form.setFieldsValue({
          content: '',
          options: [
            { content: '' },
            { content: '' },
            { content: '' },
            { content: '' },
          ],
        });
        setCorrectIndex(0);
      }
    }
  }, [modalOpen, isEditMode, selectedQuestion, form]);

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateQuestionRequest = {
        content: values.content,
        options: values.options.map((option: { content: string }, index: number) => ({
          content: option.content,
          correct: correctIndex === index,
        })),
      };

      if (isEditMode && selectedQuestion) {
        dispatch(updateQuestionRequest({ questionId: selectedQuestion.id, examId, data: payload }));
      } else {
        dispatch(addQuestionRequest({ examId, data: payload }));
      }
      setModalOpen(false);
      setIsEditMode(false);
      setSelectedQuestion(null);
      form.resetFields();
    } catch (error) {
      // validation error handled by Form
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setIsEditMode(false);
    setSelectedQuestion(null);
    form.resetFields();
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedQuestion(null);
    setModalOpen(true);
  };

  const openEditModal = (question: QuestionInfo) => {
    setIsEditMode(true);
    setSelectedQuestion(question);
    setModalOpen(true);
  };

  const handleDelete = (questionId: number) => {
    dispatch(deleteQuestionRequest({ questionId, examId }));
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            Quản lý câu hỏi đề thi
          </Title>
          <Text type="secondary">Thêm, xem và quản lý câu hỏi cho đề thi hiện tại.</Text>
        </Col>
        <Col>
          <Space>
            <Button onClick={() => navigate('/dashboard/exams')}>Quay lại danh sách đề</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
              Thêm câu hỏi
            </Button>
          </Space>
        </Col>
      </Row>

      {questionError && <Alert type="error" message={questionError} style={{ marginBottom: 16 }} />}

      {questionLoading ? (
        <Skeleton active />
      ) : (
        <List
          dataSource={questions}
          locale={{ emptyText: 'Chưa có câu hỏi nào' }}
          renderItem={(question, index) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(question)}
                >
                  Sửa
                </Button>,
                <Popconfirm
                  title="Xóa câu hỏi này?"
                  onConfirm={() => handleDelete(question.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    Xóa
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Card style={{ width: '100%', borderRadius: 12 }} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>
                    Câu {index + 1}: {question.content}
                  </Text>
                  <List
                    dataSource={question.options}
                    renderItem={(option) => (
                      <List.Item>
                        <Text>
                          {option.correct ? <strong>(Đáp án đúng) </strong> : null}
                          {option.content}
                        </Text>
                      </List.Item>
                    )}
                  />
                </Space>
              </Card>
            </List.Item>
          )}
        />
      )}

      <AppModal
        title={isEditMode ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={isEditMode ? "Lưu thay đổi" : "Tạo câu hỏi"}
        width={720}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="content"
            label="Nội dung câu hỏi"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập nội dung câu hỏi" />
          </Form.Item>

          <Form.List name="options">
            {(fields) => (
              <>
                <Text strong>Đáp án</Text>
                <Radio.Group
                  value={correctIndex}
                  onChange={(e) => setCorrectIndex(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
                    {fields.map((field, idx) => (
                      <Form.Item
                        key={field.key}
                        required
                        style={{ marginBottom: 12 }}
                      >
                        <Space align="baseline" style={{ width: '100%' }}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'content']}
                            rules={[{ required: true, message: 'Nội dung đáp án không được để trống' }]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <Input placeholder={`Đáp án ${idx + 1}`} />
                          </Form.Item>
                          <Radio value={idx}>Đúng</Radio>
                        </Space>
                      </Form.Item>
                    ))}
                  </Space>
                </Radio.Group>
              </>
            )}
          </Form.List>
        </Form>
      </AppModal>
    </div>
  );
};

export default ExamQuestionManagementPage;
