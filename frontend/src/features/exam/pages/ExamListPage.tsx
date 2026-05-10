import React, { useEffect, useState } from 'react';
import {
  Card,
  Col,
  Row,
  Space,
  Tag,
  Typography,
  Form,
  Popconfirm,
  Divider,
  Pagination,
  Input,
  DatePicker,
  Switch,
  InputNumber,
  Skeleton,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileTextOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { AppDispatch, RootState } from '../../../store';
import type { ExamInfo } from '../examTypes';

dayjs.extend(isBetween);

import {
  createExamRequest,
  deleteExamRequest,
  fetchAvailableExamsRequest,
  fetchAdminExamsRequest,
  updateExamRequest,
} from '../examSlice';
import { usePagination } from '../../../hooks/usePagination';
import { useMutation } from '../../../hooks/useMutation';
import AppModal from '../../../components/common/AppModal';
import AppButton from '../../../components/common/AppButton';
import { useNavigate } from 'react-router-dom';
import InputField from '../../../components/common/InputField';

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
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamInfo | null>(null);

  const { user } = useSelector((s: RootState) => s.auth);
  const { available, adminList, loading } = useSelector((s: RootState) => s.exam);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const pagination = usePagination(
    (s: RootState) => s.exam.pagination,
    isAdmin ? fetchAdminExamsRequest : fetchAvailableExamsRequest
  );

  useEffect(() => {
    pagination.onPageChange(1, 10);
  }, [isAdmin]);

  const { mutate, isLoading: isSaving } = useMutation({
    selector: (s: RootState) => s.exam,
    onSuccess: () => {
      setModalOpen(false);
      form.resetFields();
    },
  });

  const handleOpenModal = (exam?: ExamInfo) => {
    setIsEditMode(!!exam);
    setSelectedExam(exam || null);
    if (exam) {
      form.setFieldsValue({
        ...exam,
        startTime: dayjs(exam.startTime),
        endTime: dayjs(exam.endTime),
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      startTime: values.startTime.format('YYYY-MM-DDTHH:mm:ss'),
      endTime: values.endTime.format('YYYY-MM-DDTHH:mm:ss'),
    };

    if (isEditMode && selectedExam) {
      mutate(updateExamRequest({ id: selectedExam.id, data: payload }));
    } else {
      mutate(createExamRequest({ data: payload }));
    }
  };

  const handleDelete = (id: number) => dispatch(deleteExamRequest(id));

  const now = dayjs();
  const getStatusTag = (startTime: string, endTime: string) => {
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    if (now.isBefore(start)) return <Tag color="blue">Sắp diễn ra</Tag>;
    if (now.isAfter(end)) return <Tag color="red">Đã kết thúc</Tag>;
    return <Tag color="green">Đang diễn ra</Tag>;
  };

  const data = isAdmin ? adminList : available;

  return (
    <div>
      {/* Statistics for Admin */}
      {isAdmin && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 12, borderLeft: '4px solid #1677ff' }}>
              <Statistic title="Tổng số đề thi" value={pagination.totalElements} prefix={<FileTextOutlined style={{ color: '#1677ff' }} />} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}>
              <Statistic title="Đang mở" value={data.filter(e => now.isBetween(dayjs(e.startTime), dayjs(e.endTime))).length} prefix={<ReloadOutlined style={{ color: '#52c41a' }} />} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 12, borderLeft: '4px solid #faad14' }}>
              <Statistic title="Chuyên đề" value={new Set(data.map(e => e.category)).size} prefix={<DashboardOutlined style={{ color: '#faad14' }} />} />
            </Card>
          </Col>
        </Row>
      )}

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {isAdmin ? 'Quản lý kho đề thi' : 'Đề thi của tôi'}
            </Title>
          </Col>
          <Col>
            <Space size={12}>
              <AppButton icon={<ReloadOutlined />} onClick={pagination.refresh} />
              {isAdmin && (
                <AppButton variant="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                  Tạo đề thi mới
                </AppButton>
              )}
            </Space>
          </Col>
        </Row>

        {loading && data.length === 0 ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <>
            <Row gutter={[20, 20]}>
              {data.map((exam) => {
                const start = dayjs(exam.startTime);
                const end = dayjs(exam.endTime);
                const isOpen = now.isBetween(start, end);

                return (
                  <Col xs={24} md={12} lg={8} key={exam.id}>
                    <Card
                      style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}
                      hoverable
                      styles={{ body: { padding: 20 } }}
                    >
                      <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text strong style={{ fontSize: 16 }}>{exam.name}</Text>
                          {getStatusTag(exam.startTime, exam.endTime)}
                        </div>

                        <Text type="secondary" style={{ height: 44, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {exam.description || 'Không có mô tả cho đề thi này.'}
                        </Text>

                        <Divider style={{ margin: '4px 0' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <Space><DashboardOutlined style={{ color: '#bfbfbf' }} /> <Text style={{ fontSize: 12 }}>{exam.category || 'Chung'}</Text></Space>
                          <Space><ReloadOutlined style={{ color: '#bfbfbf' }} /> <Text style={{ fontSize: 12 }}>{exam.durationMinutes} phút</Text></Space>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          {!isAdmin ? (
                            <>
                              <AppButton
                                variant="primary"
                                block
                                disabled={!isOpen}
                                onClick={() => navigate(`/dashboard/exams/${exam.id}/take`)}
                              >
                                Vào thi
                              </AppButton>
                              <AppButton block onClick={() => navigate(`/dashboard/exams/${exam.id}/result`)}>
                                Xem kết quả
                              </AppButton>
                            </>
                          ) : (
                            <>
                              <AppButton block onClick={() => handleOpenModal(exam)}>
                                Sửa
                              </AppButton>
                              <AppButton block onClick={() => navigate(`/dashboard/exams/${exam.id}/questions`)}>
                                Câu hỏi
                              </AppButton>
                              <Popconfirm title="Xóa đề thi?" onConfirm={() => handleDelete(exam.id)}>
                                <AppButton variant="danger" icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </>
                          )}
                        </div>
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            <div style={{ marginTop: 32, textAlign: 'right' }}>
              <Pagination
                current={pagination.currentPage}
                pageSize={pagination.size}
                total={pagination.totalElements}
                onChange={pagination.onPageChange}
                showSizeChanger
                showTotal={(total) => `Tổng cộng ${total} đề thi`}
              />
            </div>
          </>
        )}
      </Card>

      <AppModal
        title={isEditMode ? 'Cập nhật đề thi' : 'Tạo đề thi mới'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={isSaving}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}><InputField name="name" label="Tên đề thi" required placeholder="Tên đề" /></Col>
            <Col span={12}><InputField name="category" label="Chuyên đề" placeholder="Chuyên đề" /></Col>
          </Row>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="startTime" label="Bắt đầu" required><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="endTime" label="Kết thúc" required><DatePicker showTime style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16} align="middle">
            <Col span={12}><Form.Item name="durationMinutes" label="Thời lượng (phút)" required><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="published" label="Công khai" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
        </Form>
      </AppModal>
    </div>
  );
};

export default ExamListPage;

