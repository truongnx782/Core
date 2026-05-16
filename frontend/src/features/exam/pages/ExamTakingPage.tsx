import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Col,
  Radio,
  Row,
  Space,
  Typography,
  Button,
  Alert,
  Divider,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "../../../store";
import {
  clearExamState,
  setAnswer,
  startExamRequest,
  submitExamRequest,
} from "../examSlice";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

function formatRemaining(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const ExamTakingPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const examId = Number(id);

  const {
    taking,
    answersByQuestionId,
    loading,
    submitting,
    latestResult,
    error,
  } = useSelector((s: RootState) => s.exam);

  const [remainingSec, setRemainingSec] = useState<number>(0);
  const submittedRef = useRef(false);
  const initialLoadRef = useRef(true);
  const shouldRedirectAfterSubmitRef = useRef(false);

  // Reset exam state when the route changes or the page is loaded / Reset state mỗi khi phiên làm bài mới được tải
  useEffect(() => {
    if (taking) {
      submittedRef.current = false;
      initialLoadRef.current = true;
      shouldRedirectAfterSubmitRef.current = false;
    }
  }, [taking]);

  useEffect(() => {
    dispatch(clearExamState());
  }, [dispatch, examId]);

  // Ensure session loaded (deep link case) / Đảm bảo phiên đã được tải (trường hợp deep link)
  useEffect(() => {
    if (!taking && examId) {
      dispatch(startExamRequest({ examId }));
    }
  }, [dispatch, examId, taking]);

  const deadline = useMemo(
    () => (taking ? dayjs(taking.deadline) : null),
    [taking],
  );
  const serverTimeAtStart = useMemo(
    () => (taking ? dayjs(taking.serverTime) : null),
    [taking],
  );

  // Countdown using serverTime as reference to avoid client time skew / Countdown sử dụng serverTime làm tham chiếu để tránh lệch giờ client
  useEffect(() => {
    if (!deadline || !serverTimeAtStart) return;

    const clientReceiveTime = dayjs();
    const initialRemaining = Math.max(
      0,
      deadline.diff(serverTimeAtStart, "second"),
    );

    const timerObj = setTimeout(() => setRemainingSec(initialRemaining), 0);

    const timer = setInterval(() => {
      const elapsed = dayjs().diff(clientReceiveTime, "second");
      const remain = Math.max(0, initialRemaining - elapsed);
      setRemainingSec(remain);
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
      }
    }, 500);

    return () => {
      clearTimeout(timerObj);
      clearInterval(timer);
    };
  }, [deadline, serverTimeAtStart]);

  // Auto submit when time is up, ignore on first load / Tự động nộp khi thời gian hết thực sự, không thực hiện trên lần tải đầu
  useEffect(() => {
    if (!taking) return;
    if (remainingSec > 0) return;
    if (submittedRef.current) return;
    if (initialLoadRef.current) return;
    submittedRef.current = true;
    shouldRedirectAfterSubmitRef.current = true;
    dispatch(submitExamRequest({ examId }));
  }, [dispatch, remainingSec, taking, examId]);

  // Redirect to exam list after any successful submission in this session / Chuyển hướng về danh sách bài thi sau khi nộp thành công trong phiên này
  useEffect(() => {
    if (latestResult && !submitting && shouldRedirectAfterSubmitRef.current) {
      navigate("/dashboard/exams", { replace: true });
    }
  }, [latestResult, submitting, navigate]);

  if (error) {
    return <Alert type="error" message={error} showIcon />;
  }

  if (loading || !taking) {
    return <Card loading style={{ borderRadius: 12 }} />;
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Card style={{ borderRadius: 12 }}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Title level={4} style={{ margin: 0 }}>
                {t("exams.takeExamFocus")}
              </Title>
              <Text type="secondary">{t("exams.autoSubmitWarning")}</Text>
              <Divider style={{ margin: "12px 0" }} />

              {taking.questions.map((q, idx) => (
                <Card key={q.id} style={{ borderRadius: 12 }} size="small">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text strong>
                      {t("exams.questionNo", { no: idx + 1 })}: {q.content}
                    </Text>
                    <Radio.Group
                      value={answersByQuestionId[q.id] ?? null}
                      onChange={(e) =>
                        dispatch(
                          setAnswer({
                            questionId: q.id,
                            optionId: e.target.value,
                          }),
                        )
                      }
                    >
                      <Space direction="vertical">
                        {q.options.map((opt) => (
                          <Radio key={opt.id} value={opt.id}>
                            {opt.content}
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card style={{ borderRadius: 12, position: "sticky", top: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
              <Title level={5} style={{ margin: 0 }}>
                {t("exams.remainingTime")}
              </Title>
              <div style={{ fontSize: 32, fontWeight: 800 }}>
                {formatRemaining(remainingSec)}
              </div>
              <Text type="secondary">
                Deadline: {dayjs(taking.deadline).format("DD/MM/YYYY HH:mm:ss")}
              </Text>
              <Button
                type="primary"
                loading={submitting}
                onClick={() => {
                  shouldRedirectAfterSubmitRef.current = true;
                  dispatch(submitExamRequest({ examId }));
                }}
              >
                {t("common.submit")}
              </Button>
              <Button onClick={() => navigate("/dashboard/exams")}>
                {t("common.cancel")}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ExamTakingPage;
