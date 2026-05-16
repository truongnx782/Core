import React, { useEffect, useMemo } from "react";
import {
  Card,
  Space,
  Typography,
  Alert,
  Button,
  Tag,
  Divider,
  Table,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "../../../store";
import {
  fetchExamSubmissionsRequest,
  fetchLatestResultRequest,
} from "../examSlice";
import type { StudentSubmissionResult } from "../examTypes";

const { Title, Text } = Typography;

const ExamResultPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const examId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { latestResult, examSubmissions, loading, error } = useSelector(
    (s: RootState) => s.exam,
  );
  const userRole = useSelector((s: RootState) => s.auth.user?.role);
  const isTeacher = userRole === "ADMIN" || userRole === "MANAGER";

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
        title: t("common.fullName"),
        dataIndex: "studentFullName",
        key: "studentFullName",
        render: (value, record) => value || `ID ${record.studentId}`,
      },
      {
        title: t("exams.score"),
        dataIndex: "score",
        key: "score",
      },
      {
        title: t("exams.correct"),
        key: "correctCount",
        render: (_value, record) =>
          `${record.correctCount}/${record.totalQuestions}`,
      },
      {
        title: t("exams.duration"),
        dataIndex: "durationSeconds",
        key: "durationSeconds",
        render: (value) => `${Math.round(value / 60)} ${t("exams.minutes")}`,
      },
      {
        title: t("exams.submittedAt"),
        dataIndex: "submittedAt",
        key: "submittedAt",
        render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm:ss"),
      },
    ],
    [t],
  );

  if (error) return <Alert type="error" message={error} showIcon />;

  return (
    <Card style={{ borderRadius: 12 }} loading={loading}>
      <Space direction="vertical" style={{ width: "100%" }} size={12}>
        <Title level={4} style={{ margin: 0 }}>
          {t("exams.results")}
        </Title>

        {isTeacher ? (
          examSubmissions.length === 0 ? (
            <Alert type="info" message={t("exams.noSubmissions")} showIcon />
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={examSubmissions}
              pagination={false}
            />
          )
        ) : !latestResult ? (
          <Alert type="info" message={t("exams.noResults")} showIcon />
        ) : (
          <>
            <Space wrap>
              <Tag color="blue">
                {t("exams.score")}: {latestResult.score}/10
              </Tag>
              <Tag color="green">
                {t("exams.correct")}: {latestResult.correctCount}/
                {latestResult.totalQuestions}
              </Tag>
              <Tag>
                {t("exams.submittedAtLabel", {
                  date: dayjs(latestResult.submittedAt).format(
                    "DD/MM/YYYY HH:mm:ss",
                  ),
                })}
              </Tag>
              <Tag>
                {t("exams.durationLabel", {
                  min: Math.round(latestResult.durationSeconds / 60),
                })}
              </Tag>
            </Space>

            <Divider />

            <Text strong>{t("exams.reviewFast")}:</Text>
            <Space wrap>
              {latestResult.answers.map((a) => (
                <Tag key={a.questionId} color={a.correct ? "success" : "error"}>
                  Q{a.questionId}:{" "}
                  {a.correct ? t("exams.correct") : t("exams.incorrect")}
                </Tag>
              ))}
            </Space>
          </>
        )}

        <Space>
          {!isTeacher && !latestResult && (
            <Button onClick={() => navigate(`/dashboard/exams/${examId}`)}>
              {t("exams.continueExam")}
            </Button>
          )}
          <Button type="primary" onClick={() => navigate("/dashboard/exams")}>
            {t("exams.backToList")}
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

export default ExamResultPage;
