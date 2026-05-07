import React from 'react';
import { Layout, Dropdown, Avatar, Space, theme } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import type { MenuProps } from 'antd';

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { token } = theme.useToken();

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 32px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        gap: 16,
      }}
    >
      {/* Notifications */}
      <BellOutlined
        style={{
          fontSize: 20,
          color: token.colorTextSecondary,
          cursor: 'pointer',
        }}
      />

      {/* User Dropdown */}
      <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" arrow>
        <Space style={{ cursor: 'pointer' }}>
          <Avatar
            icon={<UserOutlined />}
            style={{
              background: 'linear-gradient(135deg, #1677ff, #4096ff)',
            }}
          />
          <span style={{ fontWeight: 500, color: token.colorText }}>
            {user?.fullName || user?.username || 'User'}
          </span>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;
