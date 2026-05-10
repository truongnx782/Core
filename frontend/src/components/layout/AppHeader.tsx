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
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        height: 64,
      }}
    >
      <Space size={20}>
        {/* Notifications */}
        <BellOutlined
          style={{
            fontSize: 18,
            color: token.colorTextSecondary,
            cursor: 'pointer',
          }}
        />

        {/* User Dropdown */}
        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" arrow>
          <Space style={{ cursor: 'pointer' }} size={12}>
            <Avatar
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #1677ff, #4096ff)',
                boxShadow: '0 2px 8px rgba(22,119,255,0.2)',
              }}
            />
            <span style={{ fontWeight: 600, color: token.colorText, fontSize: 14 }}>
              {user?.fullName || user?.username || 'Thành viên'}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
