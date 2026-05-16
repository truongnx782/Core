import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Tag,
  Tabs,
  Badge,
  Empty,
} from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";
import AppButton from "../../../components/common/AppButton";
import type { ExamInfo, CreateExamRequest } from "../examTypes";
import QuestionEditor from "../components/QuestionEditor";
import QuestionCard from "../components/QuestionCard";

const { Text, Title } = Typography;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface LocalQuestion {
  /** negative id = not yet persisted */
  tempId: number;
  /** undefined if new question */
  serverId?: number;
  content: string;
  options: { content: string; correct: boolean }[];
  _action: "add" | "update" | "delete" | "none";
}

export interface ExamFormResult {
  examData: CreateExamRequest;
  questions: LocalQuestion[];
}

interface Props {
  open: boolean;
  exam?: ExamInfo | null;
  existingQuestions?: LocalQuestion[];
  isSaving?: boolean;
  onSave: (result: ExamFormResult) => void;
  onClose: () => void;
}

// ─────────────────────────────────────────────
// Main ExamFormModal
// ─────────────────────────────────────────────

let _tempIdCounter = -1;
const nextTempId = () => _tempIdCounter--;

const DEFAULT_OPTIONS = [
  { content: "", correct: true },
  { content: "", correct: false },
  { content: "", correct: false },
  { content: "", correct: false },
];

const ExamFormModal: React.FC<Props> = ({
  open,
  exam,
  existingQuestions = [],
  isSaving = false,
  onSave,
  onClose,
}) => {
  const { t } = useTranslation();
  const [examForm] = Form.useForm();
  const [questionForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("info");
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [editingTempId, setEditingTempId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState<LocalQuestion | null>(null);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  // ── Reset on open ──
  useEffect(() => {
    if (!open) return;
    if (exam) {
      examForm.setFieldsValue({
        ...exam,
        startTime: dayjs(exam.startTime),
        endTime: dayjs(exam.endTime),
      });
    } else {
      examForm.resetFields();
    }

    // Defer state updates to next tick to avoid cascading renders warning
    const timer = setTimeout(() => {
      setActiveTab("info");
      setEditingTempId(null);
      setIsAdding(false);
      setNewQuestion(null);
      setIsDirty(false);
      // Map server questions to local
      setQuestions(
        existingQuestions.map((q) => ({ ...q, _action: "none" as const })),
      );
    }, 0);

    return () => clearTimeout(timer);
  }, [open, exam, existingQuestions, examForm]);

  // ── Mark dirty on form change ──
  const onFormValuesChange = () => {
    setIsDirty(true);
  };

  // ── Build exam payload ──
  const buildExamPayload = async (): Promise<CreateExamRequest | null> => {
    try {
      const values = await examForm.validateFields();
      return {
        ...values,
        startTime: values.startTime.format("YYYY-MM-DDTHH:mm:ss"),
        endTime: values.endTime.format("YYYY-MM-DDTHH:mm:ss"),
      };
    } catch {
      return null;
    }
  };

  // ── Try to save actively editing question ──
  const trySaveActiveQuestion = async (): Promise<LocalQuestion[] | null> => {
    if (isAdding && newQuestion) {
      try {
        const values = await questionForm.validateFields();
        const q: LocalQuestion = {
          ...newQuestion,
          content: values.content,
          options: values.options.map((o: { content: string }, i: number) => ({
            content: o.content,
            correct: correctIndex === i,
          })),
          _action: newQuestion.serverId ? "update" : "add",
        };
        const updated = [...questions, q];
        setQuestions(updated);
        setIsAdding(false);
        setNewQuestion(null);
        setIsDirty(true);
        return updated;
      } catch {
        setActiveTab("questions");
        return null;
      }
    } else if (editingTempId !== null) {
      try {
        const values = await questionForm.validateFields();
        const q = questions.find((x) => x.tempId === editingTempId)!;
        const updatedQ: LocalQuestion = {
          ...q,
          content: values.content,
          options: values.options.map((o: { content: string }, i: number) => ({
            content: o.content,
            correct: correctIndex === i,
          })),
          _action: q.serverId ? "update" : "add",
        };
        const updated = questions.map((x) =>
          x.tempId === editingTempId ? updatedQ : x,
        );
        setQuestions(updated);
        setEditingTempId(null);
        setIsDirty(true);
        return updated;
      } catch {
        setActiveTab("questions");
        return null;
      }
    }
    return questions; // no active question being edited
  };

  // ── Save handler ──
  const handleSave = async () => {
    const updatedQuestions = await trySaveActiveQuestion();
    if (!updatedQuestions) return; // Validation failed on active question

    const examData = await buildExamPayload();
    if (!examData) {
      setActiveTab("info");
      return;
    }
    onSave({ examData, questions: updatedQuestions });
  };

  // ── Auto-save on close if dirty ──
  const handleClose = async () => {
    if (isDirty || isAdding || editingTempId !== null) {
      const updatedQuestions = await trySaveActiveQuestion();
      if (!updatedQuestions) return; // Validation failed on active question, abort close

      const examData = await buildExamPayload();
      if (examData) {
        onSave({ examData, questions: updatedQuestions });
        return;
      } else {
        setActiveTab("info");
        return; // Validation failed on exam form, abort close
      }
    }
    onClose();
  };

  // ── Question CRUD (local) ──
  const startAddQuestion = () => {
    setIsAdding(true);
    setEditingTempId(null);
    setNewQuestion({
      tempId: nextTempId(),
      content: "",
      options: DEFAULT_OPTIONS.map((o) => ({ ...o })),
      _action: "add",
    });
    setActiveTab("questions");
  };

  const handleEditorSave = async () => {
    await trySaveActiveQuestion();
  };

  const cancelNewQuestion = () => {
    setIsAdding(false);
    setNewQuestion(null);
  };

  const startEditQuestion = (tempId: number) => {
    setEditingTempId(tempId);
    setIsAdding(false);
  };

  const cancelEditQuestion = () => setEditingTempId(null);

  const deleteQuestion = (tempId: number) => {
    setQuestions((prev) =>
      prev
        .map((q) => {
          if (q.tempId !== tempId) return q;
          // If never persisted, remove entirely; otherwise mark delete
          if (!q.serverId) return null as unknown as LocalQuestion;
          return { ...q, _action: "delete" as const };
        })
        .filter(Boolean),
    );
    setIsDirty(true);
  };

  const undeleteQuestion = (tempId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.tempId === tempId
          ? { ...q, _action: q.serverId ? "none" : "add" }
          : q,
      ),
    );
  };

  const visibleQuestions = questions.filter((q) => q._action !== "delete");
  const deletedQuestions = questions.filter((q) => q._action === "delete");
  const activeCount = visibleQuestions.length;

  const infoTab = (
    <Form
      form={examForm}
      layout="vertical"
      style={{ marginTop: 8 }}
      onValuesChange={onFormValuesChange}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label={t("exams.examName")}
            rules={[{ required: true, message: t("exams.examNameRequired") }]}
          >
            <Input placeholder={t("exams.examNamePlaceholder")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="category" label={t("exams.categoryLabel")}>
            <Input placeholder={t("exams.categoryPlaceholder")} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label={t("exams.descriptionLabel")}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="startTime"
            label={t("exams.startTime")}
            rules={[{ required: true, message: t("exams.startTimeRequired") }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="endTime"
            label={t("exams.endTime")}
            rules={[{ required: true, message: t("exams.endTimeRequired") }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16} align="middle">
        <Col span={12}>
          <Form.Item
            name="durationMinutes"
            label={t("exams.durationMinutes")}
            rules={[{ required: true, message: t("exams.durationRequired") }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="published"
            label={t("exams.published")}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const questionsTab = (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text type="secondary">
          {t("exams.questionCount", { count: activeCount })}
        </Text>
        <AppButton
          variant="primary"
          icon={<PlusOutlined />}
          onClick={startAddQuestion}
          disabled={isAdding || editingTempId !== null}
        >
          {t("exams.addQuestion")}
        </AppButton>
      </div>

      {/* New question editor */}
      {isAdding && newQuestion && (
        <>
          <div
            style={{
              border: "2px solid #1677ff",
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
              background: "#f0f5ff",
            }}
          >
            <Title level={5} style={{ margin: "0 0 8px" }}>
              {t("exams.newQuestion")}
            </Title>
            <QuestionEditor
              form={questionForm}
              correctIndex={correctIndex}
              setCorrectIndex={setCorrectIndex}
              question={newQuestion}
              onSave={handleEditorSave}
              onCancel={cancelNewQuestion}
            />
          </div>
          <Divider />
        </>
      )}

      {/* Existing question list */}
      {visibleQuestions.length === 0 && !isAdding ? (
        <Empty description={t("exams.noQuestions")} />
      ) : (
        visibleQuestions.map((q, i) =>
          editingTempId === q.tempId ? (
            <div
              key={q.tempId}
              style={{
                border: "2px solid #fa8c16",
                borderRadius: 10,
                padding: 16,
                marginBottom: 12,
                background: "#fffbe6",
              }}
            >
              <Title level={5} style={{ margin: "0 0 8px" }}>
                {t("exams.editingQuestion", { no: i + 1 })}
              </Title>
              <QuestionEditor
                form={questionForm}
                correctIndex={correctIndex}
                setCorrectIndex={setCorrectIndex}
                question={q}
                onSave={handleEditorSave}
                onCancel={cancelEditQuestion}
              />
            </div>
          ) : (
            <QuestionCard
              key={q.tempId}
              question={q}
              index={i}
              onEdit={() => startEditQuestion(q.tempId)}
              onDelete={() => deleteQuestion(q.tempId)}
            />
          ),
        )
      )}

      {/* Soft-deleted (server) questions */}
      {deletedQuestions.length > 0 && (
        <>
          <Divider>{t("exams.markedForDeletion")}</Divider>
          {deletedQuestions.map((q, i) => (
            <div
              key={q.tempId}
              style={{
                border: "1px dashed #ff4d4f",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 8,
                background: "#fff1f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text delete type="secondary">
                {t("exams.questionNo", { no: i + 1 })}: {q.content}
              </Text>
              <AppButton
                size="small"
                onClick={() => undeleteQuestion(q.tempId)}
              >
                {t("exams.restore")}
              </AppButton>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const tabItems = [
    {
      key: "info",
      label: t("exams.tabInfo"),
      children: infoTab,
    },
    {
      key: "questions",
      label: (
        <span>
          {t("exams.tabQuestions")}
          {activeCount > 0 && (
            <Badge count={activeCount} style={{ marginLeft: 6 }} size="small" />
          )}
        </span>
      ),
      children: questionsTab,
    },
  ];

  const isEditMode = !!exam;

  return (
    <Modal
      open={open}
      title={
        <Space>
          {isEditMode ? t("exams.updateExam") : t("exams.createExam")}
          {isDirty && (
            <Tag color="warning" style={{ fontSize: 11 }}>
              {t("exams.unsaved")}
            </Tag>
          )}
        </Space>
      }
      centered
      width={860}
      destroyOnHidden
      onCancel={handleClose}
      confirmLoading={isSaving}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("exams.autoSaveHint")}
          </Text>
          <Space>
            <AppButton onClick={handleClose} disabled={isSaving}>
              {t("common.cancel")}
            </AppButton>
            <AppButton
              variant="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={isSaving}
            >
              {isEditMode ? t("exams.saveChanges") : t("exams.createAndSave")}
            </AppButton>
          </Space>
        </div>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ minHeight: 420 }}
      />
    </Modal>
  );
};

export default ExamFormModal;
