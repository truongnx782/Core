import React from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import InputField from '../../../components/common/InputField';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const { register, loading, error, isAuthenticated, clearError } = useAuth();
  const [form] = Form.useForm();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (values: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }) => {
    register(values.username, values.email, values.password, values.fullName);
  };

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
        style={{
          width: 460,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: 'none',
        }}
        bodyStyle={{ padding: '48px 40px' }}
      >
        <Space direction="vertical" size={4} style={{ width: '100%', marginBottom: 32, textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
              fontWeight: 800,
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
            }}
          >
            C
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            Create Your Account
          </Title>
          <Text type="secondary">Register and get started with CoreAdmin</Text>
        </Space>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off" size="large">
          <InputField
            name="username"
            required={true}
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Username"
            style={{ borderRadius: 10, height: 48 }}
          />

          <InputField
            name="fullName"
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Full name (optional)"
            style={{ borderRadius: 10, height: 48 }}
          />

          <InputField
            name="email"
            required={true}
            type="email"
            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Email address"
            style={{ borderRadius: 10, height: 48 }}
          />

          <InputField
            name="password"
            required={true}
            type="password"
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Password"
            style={{ borderRadius: 10, height: 48 }}
          />

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 16,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
              }}
            >
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Already have an account? <Link to="/login">Sign in</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
