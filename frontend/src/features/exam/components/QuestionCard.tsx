import React from "react";
import { Space, Tag, Typography } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import AppButton from "../../../components/common/AppButton";
import type { LocalQuestion } from "../pages/ExamFormModal";

const { Text } = Typography;

interface QuestionCardProps {
  question: LocalQuestion;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        border: "1px solid #f0f0f0",
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 12,
        background: question._action === "delete" ? "#fff1f0" : "#fafafa",
        opacity: question._action === "delete" ? 0.6 : 1,
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Text strong>
          {t("exams.questionNo", { no: index + 1 })}: {question.content}
        </Text>
        {question._action === "delete" ? (
          <Tag color="red">{t("exams.markedDelete")}</Tag>
        ) : question._action === "add" ? (
          <Tag color="blue">{t("common.add")}</Tag>
        ) : question._action === "update" ? (
          <Tag color="orange">{t("common.edit")}</Tag>
        ) : null}
        {question._action !== "delete" && (
          <Space size={4}>
            <AppButton size="small" icon={<EditOutlined />} onClick={onEdit}>
              {t("common.edit")}
            </AppButton>
            <AppButton
              size="small"
              variant="danger"
              icon={<DeleteOutlined />}
              onClick={onDelete}
            >
              {t("common.delete")}
            </AppButton>
          </Space>
        )}
      </div>
      <div style={{ marginTop: 8, paddingLeft: 8 }}>
        {question.options.map((opt, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 0",
              color: opt.correct ? "#52c41a" : undefined,
              fontWeight: opt.correct ? 600 : undefined,
            }}
          >
            {opt.correct ? (
              <CheckCircleOutlined
                style={{ color: "#52c41a", flexShrink: 0 }}
              />
            ) : (
              <span style={{ width: 14, flexShrink: 0 }} />
            )}
            <span>{opt.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
