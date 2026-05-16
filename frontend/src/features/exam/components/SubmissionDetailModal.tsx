import React, { useEffect, useState } from "react";
import {
  Modal,
  Card,
  Typography,
  Tag,
  Space,
  Divider,
  Skeleton,
  Empty,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { StudentSubmissionResult, QuestionInfo } from "../examTypes";
import { examService } from "../examService";

const { Title, Text, Paragraph } = Typography;

interface Props {
  open: boolean;
  submission: StudentSubmissionResult;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<Props> = ({
  open,
  submission,
  onClose,
}) => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<QuestionInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!open || !submission.examId) return;
      setLoading(true);
      try {
        const response = await examService.listQuestions(submission.examId);
        setQuestions(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch exam questions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [open, submission.examId]);

  const renderQuestionDetail = (q: QuestionInfo, idx: number) => {
    const answer = submission.answers.find((a) => a.questionId === q.id);
    const isCorrect = answer?.correct;

    return (
      <Card
        key={q.id}
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 8,
          borderLeft: `4px solid ${isCorrect ? "#52c41a" : "#ff4d4f"}`,
          background: isCorrect ? "#f6ffed" : "#fff1f0",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong>
              {t("exams.questionNo", { no: idx + 1 })}: {q.content}
            </Text>
            {isCorrect ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                {t("exams.correct")}
              </Tag>
            ) : (
              <Tag icon={<CloseCircleOutlined />} color="error">
                {t("exams.incorrect")}
              </Tag>
            )}
          </div>

          <div style={{ marginTop: 8, paddingLeft: 12 }}>
            {q.options.map((opt) => {
              const isSelected = answer?.selectedOptionId === opt.id;
              const isCorrectOption = answer?.correctOptionId === opt.id;

              let color = "inherit";
              let fontWeight: any = "normal";
              let icon = null;

              if (isCorrectOption) {
                color = "#52c41a";
                fontWeight = "bold";
                if (isSelected) icon = <CheckCircleOutlined />;
              } else if (isSelected && !isCorrect) {
                color = "#ff4d4f";
                fontWeight = "bold";
                icon = <CloseCircleOutlined />;
              }

              return (
                <div
                  key={opt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: isSelected ? "rgba(0,0,0,0.03)" : "transparent",
                    color,
                    fontWeight,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {icon}
                  </div>
                  <span>{opt.content}</span>
                  {isCorrectOption && (
                    <Tag
                      color="success"
                      style={{ marginLeft: 8, fontSize: 10 }}
                    >
                      {t("exams.correctAnswer")}
                    </Tag>
                  )}
                  {isSelected && !isCorrectOption && (
                    <Tag color="error" style={{ marginLeft: 8, fontSize: 10 }}>
                      {t("exams.yourAnswer")}
                    </Tag>
                  )}
                </div>
              );
            })}
          </div>
        </Space>
      </Card>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined />
          <span>
            {t("exams.submissionDetail")} - {submission.studentFullName}
          </span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto", padding: "20px 24px" },
      }}
    >
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <Space size={40}>
          <div style={{ textAlign: "center" }}>
            <Text type="secondary" style={{ display: "block" }}>
              {t("exams.score")}
            </Text>
            <Title
              level={2}
              style={{
                margin: 0,
                color: submission.score >= 50 ? "#52c41a" : "#ff4d4f",
              }}
            >
              {submission.score.toFixed(1)}
            </Title>
          </div>
          <div style={{ textAlign: "center" }}>
            <Text type="secondary" style={{ display: "block" }}>
              {t("exams.correctCount")}
            </Text>
            <Title level={2} style={{ margin: 0 }}>
              {submission.correctCount} / {submission.totalQuestions}
            </Title>
          </div>
        </Space>
      </div>

      <Divider titlePlacement="start">{t("exams.reviewAnswers")}</Divider>

      {loading ? (
        <Skeleton active />
      ) : questions.length > 0 ? (
        questions.map((q, idx) => renderQuestionDetail(q, idx))
      ) : (
        <Empty description={t("exams.noQuestionsFound")} />
      )}
    </Modal>
  );
};
