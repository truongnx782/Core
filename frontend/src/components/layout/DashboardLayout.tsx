import React, { useEffect } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import Breadcrumbs from "./Breadcrumbs";
import { useResponsive } from "../../hooks/useResponsive";
import type { RootState } from "../../store";
import { setSidebar, setMobileMenu } from "../../store/appSlice";

const { Content } = Layout;

const DashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const { isMobile, isTablet, padding } = useResponsive();
  const { sidebarCollapsed, mobileMenuOpen } = useSelector(
    (s: RootState) => s.app,
  );

  useEffect(() => {
    dispatch(setSidebar(isTablet));
  }, [isTablet, dispatch]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={(val: boolean) => dispatch(setSidebar(val))}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => dispatch(setMobileMenu(false))}
      />
      <Layout
        style={{
          marginLeft: isMobile ? 0 : sidebarCollapsed ? 80 : 240,
          transition: "all 0.2s",
        }}
      >
        <AppHeader onToggleMobile={() => dispatch(setMobileMenu(true))} />
        <Content style={{ padding }}>
          <Breadcrumbs />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
