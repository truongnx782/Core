import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import Breadcrumbs from './Breadcrumbs';

const { Content } = Layout;

/**
 * Main dashboard layout with sidebar, header, breadcrumbs, and content area.
 */
const DashboardLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 260, transition: 'margin-left 0.2s' }}>
        <AppHeader />
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#f5f5f5',
            borderRadius: 12,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Breadcrumbs />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
