import React from "react";
import { Form, Card, Typography, Alert, Space } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useResponsive } from "../../../hooks/useResponsive";
import InputField from "../../../components/common/InputField";
import AppButton from "../../../components/common/AppButton";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        padding: 24,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,
          border: "none",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        styles={{ body: { padding: isMobile ? "32px 24px" : "40px 32px" } }}
      >
        <Space
          direction="vertical"
          size={0}
          style={{ width: "100%", marginBottom: 32, textAlign: "center" }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "linear-gradient(135deg, #1677ff, #4096ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 22,
              fontWeight: 800,
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(22,119,255,0.3)",
            }}
          >
            C
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            {t("auth.loginTitle")}
          </Title>
          <Text type="secondary">{t("auth.loginSubtitle")}</Text>
        </Space>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => login(v.email, v.password)}
          size="large"
        >
          <InputField
            name="email"
            required
            prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
            placeholder={t("auth.emailLoginPlaceholder")}
          />

          <InputField
            name="password"
            required
            type="password"
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder={t("auth.passwordPlaceholder")}
          />

          <Form.Item style={{ marginTop: 8 }}>
            <AppButton
              variant="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 10,
              }}
            >
              {t("auth.loginButton")}
            </AppButton>
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t("auth.demoInfo")}
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t("auth.noAccount")}{" "}
              <Link to="/register">{t("common.register")}</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
