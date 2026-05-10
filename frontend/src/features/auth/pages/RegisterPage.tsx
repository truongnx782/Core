import React from 'react';
import { Form, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import InputField from '../../../components/common/InputField';
import AppButton from '../../../components/common/AppButton';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const { register, loading, error, isAuthenticated, clearError } = useAuth();
  const [form] = Form.useForm();
  const { t } = useTranslation();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: 24,
      }}
    >
      <Card
        style={{ width: 440, borderRadius: 16, border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <Space direction="vertical" size={0} style={{ width: '100%', marginBottom: 32, textAlign: 'center' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 22,
              fontWeight: 800,
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
            }}
          >
            C
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{t('auth.registerTitle')}</Title>
          <Text type="secondary">{t('auth.registerSubtitle')}</Text>
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
          onFinish={(v) => register(v.username, v.email, v.password, v.fullName)} 
          size="large"
        >
          <InputField
            name="username"
            required
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            placeholder={t('auth.usernamePlaceholder')}
          />

          <InputField
            name="fullName"
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            placeholder={t('auth.fullNamePlaceholder')}
          />

          <InputField
            name="email"
            required
            type="email"
            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
            placeholder={t('auth.emailPlaceholder')}
          />

          <InputField
            name="password"
            required
            type="password"
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder={t('auth.passwordPlaceholder')}
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
                background: 'linear-gradient(135deg, #22c55e, #16a34a)' 
              }}
            >
              {t('auth.registerButton')}
            </AppButton>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t('auth.alreadyHaveAccount')} <Link to="/login">{t('common.login')}</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
