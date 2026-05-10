import React, { useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Space, Tag, Typography, Button, Skeleton, Form, Input, DatePicker, Switch, InputNumber, Popconfirm } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import type { AppDispatch, RootState } from '../../../store';
import type { ExamInfo } from '../examTypes';
import {
  createExamRequest,
  deleteExamRequest,
  fetchAvailableExamsRequest,
  fetchAdminExamsRequest,
  updateExamRequest,
} from '../examSlice';
import AppModal from '../../../components/common/AppModal';
import InputField from '../../../components/common/InputField';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

/**
 * Page component for listing available exams to students 
 * or managing all exams for administrators.
 * 
 * Component hiển thị danh sách đề thi cho sinh viên 
 * hoặc quản lý toàn bộ đề thi cho quản trị viên.
 */
const ExamListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { available, adminList, loading } = useSelector((s: RootState) => s.exam);
  const user = useSelector((s: RootState) => s.auth.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamInfo | null>(null);
  const [form] = Form.useForm();

  const isAdmin = useMemo(
    () => user?.role === 'ADMIN' || user?.role === 'MANAGER',
    [user?.role]
  );

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAdminExamsRequest({ page: 0, size: 20 }));
    } else {
      dispatch(fetchAvailableExamsRequest({ page: 0, size: 20 }));
    }
  }, [dispatch, isAdmin]);

  const now = dayjs();
  const getStatusTag = (startTime: string, endTime: string) => {
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    if (now.isBefore(start)) return <Tag color="blue">Chưa mở</Tag>;
    if (now.isAfter(end)) return <Tag color="red">Đã đóng</Tag>;
    return <Tag color="green">Đang mở</Tag>;
  };

  const openCreateModal = () => {
    setSelectedExam(null);
    setIsEditMode(false);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (exam: ExamInfo) => {
    setSelectedExam(exam);
    setIsEditMode(true);
    form.setFieldsValue({
      name: exam.name,
      description: exam.description,
      category: exam.category,
      startTime: dayjs(exam.startTime),
      endTime: dayjs(exam.endTime),
      durationMinutes: exam.durationMinutes,
      published: exam.published,
    });
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        description: values.description,
        category: values.category,
        startTime: values.startTime.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: values.endTime.format('YYYY-MM-DDTHH:mm:ss'),
        durationMinutes: values.durationMinutes,
        published: values.published,
      };

      if (isEditMode && selectedExam) {
        dispatch(updateExamRequest({ id: selectedExam.id, data: payload }));
      } else {
        dispatch(createExamRequest({ data: payload }));
      }
      setModalOpen(false);
      form.resetFields();
    } catch (error) {
      // validation failure is handled by Form
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    form.resetFields();
  };

  return (
    <div>
      <Space style={{ justifyContent: 'space-between', width: '100%', marginBottom: 18 }}>
        <Title level={4} style={{ margin: 0 }}>
          Danh sách đề thi
        </Title>
        {isAdmin && (
          <Button type="primary" onClick={openCreateModal}>
            Tạo đề thi
          </Button>
        )}
      </Space>

      {loading && (isAdmin ? adminList.length === 0 : available.length === 0) ? (
        <Skeleton active />
      ) : (
        <Row gutter={[16, 16]}>
          {(isAdmin ? adminList : available).map((exam) => {
            const start = dayjs(exam.startTime);
            const end = dayjs(exam.endTime);
            const isOpen = !now.isBefore(start) && now.isBefore(end);
            return (
              <Col xs={24} md={12} lg={8} key={exam.id}>
                <Card style={{ borderRadius: 12 }} hoverable>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                      <Text strong>{exam.name}</Text>
                      {getStatusTag(exam.startTime, exam.endTime)}
                    </Space>
                    <Text type="secondary">{exam.description || '—'}</Text>
                    <Text>
                      Thời gian mở: {start.format('DD/MM/YYYY HH:mm')} → {end.format('DD/MM/YYYY HH:mm')}
                    </Text>
                    <Text>Thời lượng: {exam.durationMinutes} phút</Text>
                    <Space wrap>
                      <Button
                        type="primary"
                        disabled={!isOpen}
                        onClick={() => navigate(`/dashboard/exams/${exam.id}/take`)}
                      >
                        Làm bài
                      </Button>
                      <Button onClick={() => navigate(`/dashboard/exams/${exam.id}/result`)}>
                        Kết quả
                      </Button>
                      {isAdmin && (
                        <>
                          <Button type="default" onClick={() => openEditModal(exam)}>
                            Chỉnh sửa
                          </Button>
                          <Button type="default" onClick={() => navigate(`/dashboard/exams/${exam.id}/questions`)}>
                            Quản lý câu hỏi
                          </Button>
                          <Popconfirm
                            title="Bạn có muốn xóa đề này không?"
                            onConfirm={() => dispatch(deleteExamRequest(exam.id))}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button danger type="default">
                              Xóa
                            </Button>
                          </Popconfirm>
                        </>
                      )}
                    </Space>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <AppModal
        title={isEditMode ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={620}
        okText={isEditMode ? 'Lưu thay đổi' : 'Tạo đề'}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <InputField
                name="name"
                label="Tên đề thi"
                required={true}
                placeholder="Nhập tên đề thi"
              />
            </Col>
            <Col span={12}>
              <InputField
                name="category"
                label="Chuyên đề"
                placeholder="Nhập chuyên đề (tùy chọn)"
              />
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Mô tả ngắn gọn về đề thi" rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Thời gian bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="Thời gian kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle">
            <Col span={12}>
              <Form.Item
                name="durationMinutes"
                label="Thời lượng (phút)"
                rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số phút" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="published"
                label="Đã công bố"
                valuePropName="checked"
              >
                <Switch checkedChildren="Có" unCheckedChildren="Chưa" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </AppModal>
    </div>
  );
};

export default ExamListPage;

