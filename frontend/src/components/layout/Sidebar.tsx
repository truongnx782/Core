import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../store';

const { Sider } = Layout;

const menuItems = (role?: string) => {
  if (role === 'STUDENT') {
    return [
      {
        key: '/dashboard/exams',
        icon: <FileTextOutlined />,
        label: 'Examinations',
      },
    ];
  }

  return [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/dashboard/exams',
      icon: <FileTextOutlined />,
      label: 'Examinations',
    },
    {
      key: '/dashboard/users',
      icon: <TeamOutlined />,
      label: 'User Management',
    },
    {
      key: '/dashboard/profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: '/dashboard/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];
};

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      width={260}
      style={{
        background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #1677ff, #4096ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          C
        </div>
        {!collapsed && (
          <span
            style={{
              color: '#fff',
              fontSize: 18,
              fontWeight: 700,
              marginLeft: 12,
              letterSpacing: '-0.5px',
            }}
          >
            CoreAdmin
          </span>
        )}
      </div>

      {/* Collapse Toggle */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: '12px 24px',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.65)',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
        }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems(userRole)}
        onClick={({ key }) => navigate(key)}
        style={{
          background: 'transparent',
          borderInlineEnd: 'none',
        }}
      />
    </Sider>
  );
};

export default Sidebar;
