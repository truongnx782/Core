import React, { useEffect, useRef, useState } from 'react';
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
  Radio,
  Tag,
  Tooltip,
  Alert,
  Tabs,
  Badge,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Modal } from 'antd';
import AppButton from '../../../components/common/AppButton';
import type { ExamInfo, CreateExamRequest, CreateQuestionRequest } from '../examTypes';

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
  _action: 'add' | 'update' | 'delete' | 'none';
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
// Inline question editor
// ─────────────────────────────────────────────

interface QuestionEditorProps {
  form: import('antd').FormInstance<any>;
  question: LocalQuestion;
  correctIndex: number;
  setCorrectIndex: (idx: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ form, question, correctIndex, setCorrectIndex, onSave, onCancel }) => {
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
        label={t('exams.questionContent')}
        rules={[{ required: true, message: t('exams.questionContentRequired') }]}
      >
        <Input.TextArea rows={3} placeholder={t('exams.questionContentPlaceholder')} />
      </Form.Item>

      <Form.List name="options">
        {(fields) => (
          <>
            <Text strong>{t('exams.options')}</Text>
            <Radio.Group
              value={correctIndex}
              onChange={(e) => setCorrectIndex(e.target.value)}
              style={{ width: '100%', marginTop: 10 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {fields.map((field, idx) => (
                  <Form.Item
                    key={field.key}
                    style={{ marginBottom: 8 }}
                    required
                  >
                    <Space align="baseline" style={{ width: '100%', display: 'flex' }}>
                      <Radio value={idx} style={{ flexShrink: 0 }}>
                        <Tooltip title={t('exams.markCorrect')}>{t('exams.correct')}</Tooltip>
                      </Radio>
                      <Form.Item
                        {...field}
                        name={[field.name, 'content']}
                        rules={[{ required: true, message: t('exams.optionRequired') }]}
                        style={{ flex: 1, marginBottom: 0 }}
                        noStyle={false}
                      >
                        <Input
                          placeholder={`${t('exams.option')} ${idx + 1}`}
                          prefix={
                            correctIndex === idx ? (
                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            ) : (
                              <QuestionCircleOutlined style={{ color: '#bfbfbf' }} />
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

      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
        <AppButton onClick={onCancel} icon={<CloseOutlined />}>
          {t('common.cancel')}
        </AppButton>
        <AppButton variant="primary" icon={<SaveOutlined />} onClick={onSave}>
          {t('common.save')}
        </AppButton>
      </div>
    </Form>
  );
};

// ─────────────────────────────────────────────
// Question card (read view)
// ─────────────────────────────────────────────

interface QuestionCardProps {
  question: LocalQuestion;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        border: '1px solid #f0f0f0',
        borderRadius: 10,
        padding: '14px 16px',
        marginBottom: 12,
        background: question._action === 'delete' ? '#fff1f0' : '#fafafa',
        opacity: question._action === 'delete' ? 0.6 : 1,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text strong>
          {t('exams.questionNo', { no: index + 1 })}: {question.content}
        </Text>
        {question._action === 'delete' ? (
          <Tag color="red">{t('exams.markedDelete')}</Tag>
        ) : question._action === 'add' ? (
          <Tag color="blue">{t('common.add')}</Tag>
        ) : question._action === 'update' ? (
          <Tag color="orange">{t('common.edit')}</Tag>
        ) : null}
        {question._action !== 'delete' && (
          <Space size={4}>
            <AppButton size="small" icon={<EditOutlined />} onClick={onEdit}>
              {t('common.edit')}
            </AppButton>
            <AppButton size="small" variant="danger" icon={<DeleteOutlined />} onClick={onDelete}>
              {t('common.delete')}
            </AppButton>
          </Space>
        )}
      </div>
      <div style={{ marginTop: 8, paddingLeft: 8 }}>
        {question.options.map((opt, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 0',
              color: opt.correct ? '#52c41a' : undefined,
              fontWeight: opt.correct ? 600 : undefined,
            }}
          >
            {opt.correct ? (
              <CheckCircleOutlined style={{ color: '#52c41a', flexShrink: 0 }} />
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

// ─────────────────────────────────────────────
// Main ExamFormModal
// ─────────────────────────────────────────────

let _tempIdCounter = -1;
const nextTempId = () => _tempIdCounter--;

const DEFAULT_OPTIONS = [
  { content: '', correct: true },
  { content: '', correct: false },
  { content: '', correct: false },
  { content: '', correct: false },
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
  const [activeTab, setActiveTab] = useState('info');
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [editingTempId, setEditingTempId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState<LocalQuestion | null>(null);
  const [correctIndex, setCorrectIndex] = useState(0);
  const isDirtyRef = useRef(false);

  // ── Reset on open ──
  useEffect(() => {
    if (!open) return;
    setActiveTab('info');
    setEditingTempId(null);
    setIsAdding(false);
    setNewQuestion(null);
    isDirtyRef.current = false;

    if (exam) {
      examForm.setFieldsValue({
        ...exam,
        startTime: dayjs(exam.startTime),
        endTime: dayjs(exam.endTime),
      });
    } else {
      examForm.resetFields();
    }

    // Map server questions to local
    setQuestions(
      existingQuestions.map((q) => ({ ...q, _action: 'none' as const }))
    );
  }, [open, exam, existingQuestions, examForm]);

  // ── Mark dirty on form change ──
  const onFormValuesChange = () => { isDirtyRef.current = true; };

  // ── Build exam payload ──
  const buildExamPayload = async (): Promise<CreateExamRequest | null> => {
    try {
      const values = await examForm.validateFields();
      return {
        ...values,
        startTime: values.startTime.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: values.endTime.format('YYYY-MM-DDTHH:mm:ss'),
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
          options: values.options.map((o: any, i: number) => ({
            content: o.content,
            correct: correctIndex === i,
          })),
          _action: newQuestion.serverId ? 'update' : 'add',
        };
        const updated = [...questions, q];
        setQuestions(updated);
        setIsAdding(false);
        setNewQuestion(null);
        isDirtyRef.current = true;
        return updated;
      } catch {
        setActiveTab('questions');
        return null;
      }
    } else if (editingTempId !== null) {
      try {
        const values = await questionForm.validateFields();
        const q = questions.find((x) => x.tempId === editingTempId)!;
        const updatedQ: LocalQuestion = {
          ...q,
          content: values.content,
          options: values.options.map((o: any, i: number) => ({
            content: o.content,
            correct: correctIndex === i,
          })),
          _action: q.serverId ? 'update' : 'add',
        };
        const updated = questions.map((x) => (x.tempId === editingTempId ? updatedQ : x));
        setQuestions(updated);
        setEditingTempId(null);
        isDirtyRef.current = true;
        return updated;
      } catch {
        setActiveTab('questions');
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
      setActiveTab('info');
      return;
    }
    onSave({ examData, questions: updatedQuestions });
  };

  // ── Auto-save on close if dirty ──
  const handleClose = async () => {
    if (isDirtyRef.current || isAdding || editingTempId !== null) {
      const updatedQuestions = await trySaveActiveQuestion();
      if (!updatedQuestions) return; // Validation failed on active question, abort close

      const examData = await buildExamPayload();
      if (examData) {
        onSave({ examData, questions: updatedQuestions });
        return;
      } else {
        setActiveTab('info');
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
      content: '',
      options: DEFAULT_OPTIONS.map((o) => ({ ...o })),
      _action: 'add',
    });
    setActiveTab('questions');
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
      prev.map((q) => {
        if (q.tempId !== tempId) return q;
        // If never persisted, remove entirely; otherwise mark delete
        if (!q.serverId) return null as unknown as LocalQuestion;
        return { ...q, _action: 'delete' as const };
      }).filter(Boolean)
    );
    isDirtyRef.current = true;
  };

  const undeleteQuestion = (tempId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.tempId === tempId ? { ...q, _action: q.serverId ? 'none' : 'add' } : q
      )
    );
  };

  const visibleQuestions = questions.filter((q) => q._action !== 'delete');
  const deletedQuestions = questions.filter((q) => q._action === 'delete');
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
            label={t('exams.examName')}
            rules={[{ required: true, message: t('exams.examNameRequired') }]}
          >
            <Input placeholder={t('exams.examNamePlaceholder')} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="category" label={t('exams.categoryLabel')}>
            <Input placeholder={t('exams.categoryPlaceholder')} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label={t('exams.descriptionLabel')}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="startTime"
            label={t('exams.startTime')}
            rules={[{ required: true, message: t('exams.startTimeRequired') }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="endTime"
            label={t('exams.endTime')}
            rules={[{ required: true, message: t('exams.endTimeRequired') }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16} align="middle">
        <Col span={12}>
          <Form.Item
            name="durationMinutes"
            label={t('exams.durationMinutes')}
            rules={[{ required: true, message: t('exams.durationRequired') }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="published" label={t('exams.published')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const questionsTab = (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text type="secondary">
          {t('exams.questionCount', { count: activeCount })}
        </Text>
        <AppButton
          variant="primary"
          icon={<PlusOutlined />}
          onClick={startAddQuestion}
          disabled={isAdding || editingTempId !== null}
        >
          {t('exams.addQuestion')}
        </AppButton>
      </div>

      {/* New question editor */}
      {isAdding && newQuestion && (
        <>
          <div
            style={{
              border: '2px solid #1677ff',
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
              background: '#f0f5ff',
            }}
          >
            <Title level={5} style={{ margin: '0 0 8px' }}>
              {t('exams.newQuestion')}
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
        <Empty description={t('exams.noQuestions')} />
      ) : (
        visibleQuestions.map((q, i) =>
          editingTempId === q.tempId ? (
            <div
              key={q.tempId}
              style={{
                border: '2px solid #fa8c16',
                borderRadius: 10,
                padding: 16,
                marginBottom: 12,
                background: '#fffbe6',
              }}
            >
              <Title level={5} style={{ margin: '0 0 8px' }}>
                {t('exams.editingQuestion', { no: i + 1 })}
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
          )
        )
      )}

      {/* Soft-deleted (server) questions */}
      {deletedQuestions.length > 0 && (
        <>
          <Divider>{t('exams.markedForDeletion')}</Divider>
          {deletedQuestions.map((q, i) => (
            <div
              key={q.tempId}
              style={{
                border: '1px dashed #ff4d4f',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 8,
                background: '#fff1f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text delete type="secondary">
                {t('exams.questionNo', { no: i + 1 })}: {q.content}
              </Text>
              <AppButton size="small" onClick={() => undeleteQuestion(q.tempId)}>
                {t('exams.restore')}
              </AppButton>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const tabItems = [
    {
      key: 'info',
      label: t('exams.tabInfo'),
      children: infoTab,
    },
    {
      key: 'questions',
      label: (
        <span>
          {t('exams.tabQuestions')}
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
          {isEditMode ? t('exams.updateExam') : t('exams.createExam')}
          {isDirtyRef.current && (
            <Tag color="warning" style={{ fontSize: 11 }}>
              {t('exams.unsaved')}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t('exams.autoSaveHint')}
          </Text>
          <Space>
            <AppButton onClick={handleClose} disabled={isSaving}>
              {t('common.cancel')}
            </AppButton>
            <AppButton variant="primary" icon={<SaveOutlined />} onClick={handleSave} loading={isSaving}>
              {isEditMode ? t('exams.saveChanges') : t('exams.createAndSave')}
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
