import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Tooltip,
  Alert,
  Breadcrumb,
} from "antd";
import {
  LeftOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import AppButton from "../../../components/common/AppButton";
import { examService } from "../examService";
import type { StudentSubmissionResult } from "../examTypes";
import { SubmissionDetailModal } from "../components/SubmissionDetailModal";

const { Title, Text } = Typography;

const ExamSubmissionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const examId = Number(id);

  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<StudentSubmissionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<StudentSubmissionResult | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await examService.getExamSubmissions(examId);
      // Backend returns either PageResponse or simple array depending on API design.
      // Based on examService.ts, it calls GET /submissions/exam/{examId}
      setSubmissions(response.data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examId) fetchSubmissions();
  }, [examId]);

  const columns = [
    {
      title: t("common.fullName"),
      dataIndex: "studentFullName",
      key: "studentFullName",
      render: (text: string, record: StudentSubmissionResult) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text || `Student #${record.studentId}`}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ID: {record.studentId}
          </Text>
        </Space>
      ),
    },
    {
      title: t("exams.submittedAt"),
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: t("exams.duration"),
      dataIndex: "durationSeconds",
      key: "durationSeconds",
      render: (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return (
          <Space>
            <ClockCircleOutlined style={{ color: "#bfbfbf" }} />
            {m > 0 ? `${m}m ` : ""}
            {s}s
          </Space>
        );
      },
    },
    {
      title: t("exams.correctCount"),
      key: "correctCount",
      render: (_: any, record: StudentSubmissionResult) => (
        <Tag color="blue">
          {record.correctCount} / {record.totalQuestions}
        </Tag>
      ),
    },
    {
      title: t("exams.score"),
      dataIndex: "score",
      key: "score",
      render: (score: number) => (
        <Text
          strong
          style={{ color: score >= 50 ? "#52c41a" : "#ff4d4f", fontSize: 16 }}
        >
          {score.toFixed(1)}
        </Text>
      ),
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 100,
      render: (_: any, record: StudentSubmissionResult) => (
        <Tooltip title={t("exams.viewDetail")}>
          <AppButton
            variant="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedSubmission(record);
              setDetailVisible(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: "0 4px" }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: (
              <a onClick={() => navigate("/dashboard/exams")}>
                {t("sidebar.exams")}
              </a>
            ),
          },
          { title: t("exams.submissions") },
        ]}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Space size={16} style={{ flexWrap: "wrap" }}>
          <AppButton icon={<LeftOutlined />} onClick={() => navigate(-1)} />
          <Title level={3} style={{ margin: 0 }}>
            {t("exams.submissionsTitle")}
          </Title>
        </Space>
        <AppButton loading={loading} onClick={fetchSubmissions}>
          {t("common.refresh")}
        </AppButton>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      <Card
        style={{ borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={submissions}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, size: "small" }}
          scroll={{ x: 800 }}
        />
      </Card>

      {selectedSubmission && (
        <SubmissionDetailModal
          open={detailVisible}
          submission={selectedSubmission}
          onClose={() => setDetailVisible(false)}
        />
      )}
    </div>
  );
};

export default ExamSubmissionsPage;
