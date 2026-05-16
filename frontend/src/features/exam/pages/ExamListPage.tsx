import React, { useEffect } from "react";
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
import {
  deleteExamRequest,
  fetchAvailableExamsRequest,
  fetchAdminExamsRequest,
  fetchQuestionsRequest,
  saveExamWithQuestionsRequest,
  setExamModalOpen,
  setModalExam,
  setModalQuestions,
  setPendingOpenExamId,
} from "../examSlice";
import { usePagination } from "../../../hooks/usePagination";
import AppButton from "../../../components/common/AppButton";
import { useNavigate } from "react-router-dom";
import ExamFormModal, {
  type LocalQuestion,
  type ExamFormResult,
} from "./ExamFormModal";

dayjs.extend(isBetween);
const { Title, Text } = Typography;

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

  const { user } = useSelector((s: RootState) => s.auth);
  const {
    available,
    adminList,
    loading,
    questions,
    questionLoading,
    isModalOpen,
    selectedExam,
    modalQuestions,
    pendingOpenExamId,
  } = useSelector((s: RootState) => s.exam);
  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  const pagination = usePagination(
    (s: RootState) => s.exam.pagination,
    isAdmin ? fetchAdminExamsRequest : fetchAvailableExamsRequest,
  );

  useEffect(() => {
    pagination.onPageChange(1, 10);
  }, [isAdmin]);

  const handleOpenModal = (exam?: ExamInfo) => {
    dispatch(setModalExam(exam || null));
    dispatch(setModalQuestions([]));
    if (exam) {
      dispatch(setPendingOpenExamId(exam.id));
      dispatch(fetchQuestionsRequest({ examId: exam.id }));
    } else {
      dispatch(setPendingOpenExamId(null));
      dispatch(setExamModalOpen(true));
    }
  };

  useEffect(() => {
    if (pendingOpenExamId !== null && !questionLoading) {
      dispatch(setModalQuestions(toLocalQuestions(questions)));
      dispatch(setPendingOpenExamId(null));
      dispatch(setExamModalOpen(true));
    }
  }, [questionLoading, pendingOpenExamId, questions, dispatch]);

  const handleSave = (result: ExamFormResult) => {
    dispatch(
      saveExamWithQuestionsRequest({
        examId: selectedExam?.id,
        examData: result.examData,
        questions: result.questions,
      }),
    );
  };

  const now = dayjs();
  const data = isAdmin ? adminList : available;

  return (
    <div>
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
            <Card style={{ borderLeft: "4px solid #1677ff" }}>
              <Statistic
                title={t("exams.totalExams")}
                value={pagination.totalElements}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderLeft: "4px solid #52c41a" }}>
              <Statistic
                title={t("exams.openExams")}
                value={
                  data.filter((e) =>
                    now.isBetween(dayjs(e.startTime), dayjs(e.endTime)),
                  ).length
                }
                prefix={<ReloadOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderLeft: "4px solid #faad14" }}>
              <Statistic
                title={t("exams.categories")}
                value={new Set(data.map((e) => e.category)).size}
                prefix={<DashboardOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card style={{ borderRadius: 12 }}>
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
          <Skeleton active />
        ) : (
          <>
            <Row gutter={[20, 20]}>
              {data.map((exam) => (
                <Col xs={24} md={12} lg={8} key={exam.id}>
                  <Card hoverable styles={{ body: { padding: 20 } }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text strong>{exam.name}</Text>
                      {now.isBefore(dayjs(exam.startTime)) ? (
                        <Tag color="blue">{t("exams.statusUpcoming")}</Tag>
                      ) : now.isAfter(dayjs(exam.endTime)) ? (
                        <Tag color="red">{t("exams.statusEnded")}</Tag>
                      ) : (
                        <Tag color="green">{t("exams.statusOngoing")}</Tag>
                      )}
                    </div>
                    <Text
                      type="secondary"
                      style={{
                        height: 44,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        marginTop: 8,
                      }}
                    >
                      {exam.description || t("exams.noDescription")}
                    </Text>
                    <Divider style={{ margin: "12px 0" }} />
                    <div
                      style={{
                        fontSize: 12,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <Space>
                        <DashboardOutlined />{" "}
                        {exam.category || t("exams.defaultCategory")}
                      </Space>
                      <Space>
                        <ReloadOutlined /> {exam.durationMinutes}{" "}
                        {t("exams.minutes")}
                      </Space>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                      {!isAdmin ? (
                        <>
                          <AppButton
                            variant="primary"
                            block
                            disabled={
                              !now.isBetween(
                                dayjs(exam.startTime),
                                dayjs(exam.endTime),
                              )
                            }
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
                          />
                          <AppButton
                            block
                            icon={<BarChartOutlined />}
                            onClick={() =>
                              navigate(`/dashboard/exams/${exam.id}/results`)
                            }
                          />
                          <Popconfirm
                            title={t("exams.deleteConfirm")}
                            onConfirm={() =>
                              dispatch(deleteExamRequest(exam.id))
                            }
                          >
                            <AppButton
                              variant="danger"
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        </>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 32, textAlign: "right" }}>
              <Pagination
                current={pagination.currentPage}
                pageSize={pagination.size}
                total={pagination.totalElements}
                onChange={pagination.onPageChange}
                showSizeChanger
              />
            </div>
          </>
        )}
      </Card>

      <ExamFormModal
        open={isModalOpen}
        exam={selectedExam}
        existingQuestions={modalQuestions}
        isSaving={loading}
        onSave={handleSave}
        onClose={() => dispatch(setExamModalOpen(false))}
      />
    </div>
  );
};

export default ExamListPage;
