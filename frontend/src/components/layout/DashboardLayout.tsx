import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import Breadcrumbs from "./Breadcrumbs";

const { Content } = Layout;

/**
 * Main dashboard layout with sidebar, header, breadcrumbs, and content area / Bố cục bảng điều khiển chính với thanh bên, header, breadcrumbs và phần nội dung.
 */
const DashboardLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout
        style={{
          marginLeft: 260,
          transition: "margin-left 0.2s",
          background: "#f0f2f5",
        }}
      >
        <AppHeader />
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            borderRadius: 16,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <Breadcrumbs />
          </div>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
