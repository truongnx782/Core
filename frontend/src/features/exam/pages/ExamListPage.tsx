import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Space,
  Tag,
  Typography,
  Popconfirm,
  Divider,
  Pagination,
  Skeleton,
  Statistic,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileTextOutlined,
  DashboardOutlined,
  EditOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "../../../store";
import type { ExamInfo, QuestionInfo } from "../examTypes";

dayjs.extend(isBetween);

import {
  deleteExamRequest,
  fetchAvailableExamsRequest,
  fetchAdminExamsRequest,
  fetchQuestionsRequest,
  saveExamWithQuestionsRequest,
} from "../examSlice";
import { usePagination } from "../../../hooks/usePagination";
import AppButton from "../../../components/common/AppButton";
import { useNavigate } from "react-router-dom";
import ExamFormModal, {
  type LocalQuestion,
  type ExamFormResult,
} from "./ExamFormModal";

const { Title, Text } = Typography;

/** Map server QuestionInfo → LocalQuestion for the modal / Chuyển đổi thông tin câu hỏi từ server sang chuẩn local cho modal */
function toLocalQuestions(serverQuestions: QuestionInfo[]): LocalQuestion[] {
  let tempId = -9000;
  return serverQuestions.map((q) => ({
    tempId: tempId--,
    serverId: q.id,
    content: q.content,
    options: q.options.map((o) => ({
      content: o.content,
      correct: !!o.correct,
    })),
    _action: "none" as const,
  }));
}

const ExamListPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamInfo | null>(null);
  const [modalQuestions, setModalQuestions] = useState<LocalQuestion[]>([]);
  const [pendingOpenExamId, setPendingOpenExamId] = useState<number | null>(
    null,
  );

  const { user } = useSelector((s: RootState) => s.auth);
  const { available, adminList, loading, questions, questionLoading } =
    useSelector((s: RootState) => s.exam);
  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  const pagination = usePagination(
    (s: RootState) => s.exam.pagination,
    isAdmin ? fetchAdminExamsRequest : fetchAvailableExamsRequest,
  );

  useEffect(() => {
    pagination.onPageChange(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // ── Open modal / Mở hộp thoại ──
  const handleOpenModal = (exam?: ExamInfo) => {
    setSelectedExam(exam || null);
    setModalQuestions([]);

    if (exam) {
      // Fetch questions for this exam, then open modal when done / Lấy câu hỏi cho bài thi này, sau đó mở hộp thoại
      setPendingOpenExamId(exam.id);
      dispatch(fetchQuestionsRequest({ examId: exam.id }));
    } else {
      setPendingOpenExamId(null);
      setModalOpen(true);
    }
  };

  useEffect(() => {
    if (pendingOpenExamId !== null && !questionLoading) {
      const timer = setTimeout(() => {
        setModalQuestions(toLocalQuestions(questions));
        setPendingOpenExamId(null);
        setModalOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [questionLoading, pendingOpenExamId, questions]);

  // ── Save (create or update + questions) / Lưu (tạo mới hoặc cập nhật + câu hỏi) ──
  const handleSave = (result: ExamFormResult) => {
    dispatch(
      saveExamWithQuestionsRequest({
        examId: selectedExam?.id,
        examData: result.examData,
        questions: result.questions,
      }),
    );
    setModalOpen(false);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedExam(null);
    setModalQuestions([]);
  };

  const handleDelete = (id: number) => dispatch(deleteExamRequest(id));

  const now = dayjs();
  const getStatusTag = (startTime: string, endTime: string) => {
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    if (now.isBefore(start))
      return <Tag color="blue">{t("exams.statusUpcoming")}</Tag>;
    if (now.isAfter(end))
      return <Tag color="red">{t("exams.statusEnded")}</Tag>;
    return <Tag color="green">{t("exams.statusOngoing")}</Tag>;
  };

  const data = isAdmin ? adminList : available;

  return (
    <div>
      {/* Loading overlay while fetching questions for edit */}
      {questionLoading && pendingOpenExamId !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" tip={t("exams.loadingQuestions")} />
        </div>
      )}

      {isAdmin && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 12, borderLeft: "4px solid #1677ff" }}>
              <Statistic
                title={t("exams.totalExams")}
                value={pagination.totalElements}
                prefix={<FileTextOutlined style={{ color: "#1677ff" }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 12, borderLeft: "4px solid #52c41a" }}>
              <Statistic
                title={t("exams.openExams")}
                value={
                  data.filter((e) =>
                    now.isBetween(dayjs(e.startTime), dayjs(e.endTime)),
                  ).length
                }
                prefix={<ReloadOutlined style={{ color: "#52c41a" }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 12, borderLeft: "4px solid #faad14" }}>
              <Statistic
                title={t("exams.categories")}
                value={new Set(data.map((e) => e.category)).size}
                prefix={<DashboardOutlined style={{ color: "#faad14" }} />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {isAdmin ? t("exams.adminTitle") : t("exams.userTitle")}
            </Title>
          </Col>
          <Col>
            <Space size={12}>
              <AppButton
                icon={<ReloadOutlined />}
                onClick={pagination.refresh}
              />
              {isAdmin && (
                <AppButton
                  variant="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                >
                  {t("exams.createExam")}
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
                      style={{
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "1px solid #f0f0f0",
                      }}
                      hoverable
                      styles={{ body: { padding: 20 } }}
                    >
                      <Space
                        direction="vertical"
                        size={12}
                        style={{ width: "100%" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Text strong style={{ fontSize: 16 }}>
                            {exam.name}
                          </Text>
                          {getStatusTag(exam.startTime, exam.endTime)}
                        </div>

                        <Text
                          type="secondary"
                          style={{
                            height: 44,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {exam.description || t("exams.noDescription")}
                        </Text>

                        <Divider style={{ margin: "4px 0" }} />

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <Space>
                            <DashboardOutlined style={{ color: "#bfbfbf" }} />{" "}
                            <Text style={{ fontSize: 12 }}>
                              {exam.category || t("exams.defaultCategory")}
                            </Text>
                          </Space>
                          <Space>
                            <ReloadOutlined style={{ color: "#bfbfbf" }} />{" "}
                            <Text style={{ fontSize: 12 }}>
                              {exam.durationMinutes} {t("exams.minutes")}
                            </Text>
                          </Space>
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          {!isAdmin ? (
                            <>
                              <AppButton
                                variant="primary"
                                block
                                disabled={!isOpen}
                                onClick={() =>
                                  navigate(`/dashboard/exams/${exam.id}/take`)
                                }
                              >
                                {t("exams.startExam")}
                              </AppButton>
                              <AppButton
                                block
                                onClick={() =>
                                  navigate(`/dashboard/exams/${exam.id}/result`)
                                }
                              >
                                {t("exams.viewResults")}
                              </AppButton>
                            </>
                          ) : (
                            <>
                              <AppButton
                                block
                                icon={<EditOutlined />}
                                onClick={() => handleOpenModal(exam)}
                              >
                                {t("common.edit")}
                              </AppButton>
                              <AppButton
                                block
                                icon={<BarChartOutlined />}
                                onClick={() =>
                                  navigate(
                                    `/dashboard/exams/${exam.id}/results`,
                                  )
                                }
                              >
                                {t("exams.viewSubmissions")}
                              </AppButton>
                              <Popconfirm
                                title={t("exams.deleteConfirm")}
                                onConfirm={() => handleDelete(exam.id)}
                              >
                                <AppButton
                                  variant="danger"
                                  icon={<DeleteOutlined />}
                                />
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

            <div style={{ marginTop: 32, textAlign: "right" }}>
              <Pagination
                current={pagination.currentPage}
                pageSize={pagination.size}
                total={pagination.totalElements}
                onChange={pagination.onPageChange}
                showSizeChanger
                showTotal={(total) =>
                  `${t("common.total")} ${total} ${t("exams.examsLabel")}`
                }
              />
            </div>
          </>
        )}
      </Card>

      <ExamFormModal
        open={modalOpen}
        exam={selectedExam}
        existingQuestions={modalQuestions}
        isSaving={loading}
        onSave={handleSave}
        onClose={handleClose}
      />
    </div>
  );
};

export default ExamListPage;
