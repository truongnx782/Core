import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import Breadcrumbs from "./Breadcrumbs";
import { useResponsive } from "../../hooks/useResponsive";

const { Content } = Layout;

const DashboardLayout: React.FC = () => {
  const { isMobile, isTablet, padding } = useResponsive();
  const [collapsed, setCollapsed] = useState(isTablet);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setCollapsed(isTablet), [isTablet]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 240,
          transition: "all 0.2s",
        }}
      >
        <AppHeader onToggleMobile={() => setMobileOpen(true)} />
        <Content style={{ padding }}>
          <Breadcrumbs />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
