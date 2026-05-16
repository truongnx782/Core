import React, { useEffect } from "react";
import { Form, Input, Radio, Space, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import AppButton from "../../../components/common/AppButton";
import type { LocalQuestion } from "../pages/ExamFormModal";

const { Text } = Typography;
import { Typography } from "antd";

interface QuestionEditorProps {
  form: import("antd").FormInstance;
  question: LocalQuestion;
  correctIndex: number;
  setCorrectIndex: (idx: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  form,
  question,
  correctIndex,
  setCorrectIndex,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const correctIdx = question.options.findIndex((o) => o.correct);
    setCorrectIndex(correctIdx >= 0 ? correctIdx : 0);
    form.setFieldsValue({
      content: question.content,
      options: question.options.map((o) => ({ content: o.content })),
    });
  }, [question, form, setCorrectIndex]);

  return (
    <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
      <Form.Item
        name="content"
        label={t("exams.questionContent")}
        rules={[
          { required: true, message: t("exams.questionContentRequired") },
        ]}
      >
        <Input.TextArea
          rows={3}
          placeholder={t("exams.questionContentPlaceholder")}
        />
      </Form.Item>

      <Form.List name="options">
        {(fields) => (
          <>
            <Text strong>{t("exams.options")}</Text>
            <Radio.Group
              value={correctIndex}
              onChange={(e) => setCorrectIndex(e.target.value)}
              style={{ width: "100%", marginTop: 10 }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {fields.map((field, idx) => (
                  <Form.Item
                    key={field.key}
                    style={{ marginBottom: 8 }}
                    required
                  >
                    <Space
                      align="baseline"
                      style={{ width: "100%", display: "flex" }}
                    >
                      <Radio value={idx} style={{ flexShrink: 0 }}>
                        <Tooltip title={t("exams.markCorrect")}>
                          {t("exams.correct")}
                        </Tooltip>
                      </Radio>
                      <Form.Item
                        {...field}
                        name={[field.name, "content"]}
                        rules={[
                          {
                            required: true,
                            message: t("exams.optionRequired"),
                          },
                        ]}
                        style={{ flex: 1, marginBottom: 0 }}
                        noStyle={false}
                      >
                        <Input
                          placeholder={`${t("exams.option")} ${idx + 1}`}
                          prefix={
                            correctIndex === idx ? (
                              <CheckCircleOutlined
                                style={{ color: "#52c41a" }}
                              />
                            ) : (
                              <QuestionCircleOutlined
                                style={{ color: "#bfbfbf" }}
                              />
                            )
                          }
                        />
                      </Form.Item>
                    </Space>
                  </Form.Item>
                ))}
              </Space>
            </Radio.Group>
          </>
        )}
      </Form.List>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 16,
          justifyContent: "flex-end",
        }}
      >
        <AppButton onClick={onCancel} icon={<CloseOutlined />}>
          {t("common.cancel")}
        </AppButton>
        <AppButton variant="primary" icon={<SaveOutlined />} onClick={onSave}>
          {t("common.save")}
        </AppButton>
      </div>
    </Form>
  );
};

export default QuestionEditor;
