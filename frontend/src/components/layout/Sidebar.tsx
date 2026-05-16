import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Layout, Menu, Drawer, Typography } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useResponsive } from "../../hooks/useResponsive";

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar: React.FC<any> = ({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();
  const role = useSelector((s: any) => s.auth.user?.role);

  const items = useMemo(
    () =>
      [
        {
          key: "/dashboard",
          icon: <DashboardOutlined />,
          label: t("sidebar.dashboard"),
          roles: ["ADMIN", "MANAGER"],
        },
        {
          key: "/dashboard/exams",
          icon: <FileTextOutlined />,
          label: t("sidebar.exams"),
          roles: ["ADMIN", "MANAGER", "STUDENT"],
        },
        {
          key: "/dashboard/users",
          icon: <TeamOutlined />,
          label: t("sidebar.users"),
          roles: ["ADMIN", "MANAGER"],
        },
        {
          key: "/dashboard/profile",
          icon: <UserOutlined />,
          label: t("sidebar.profile"),
        },
        {
          key: "/dashboard/settings",
          icon: <SettingOutlined />,
          label: t("sidebar.settings"),
          roles: ["ADMIN"],
        },
      ].filter((i) => !i.roles || (role && i.roles.includes(role))),
    [t, role],
  );

  const content = (
    <>
      <div
        style={{
          height: 64,
          padding: 16,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #ffffff1a",
        }}
      >
        <Title level={4} style={{ color: "#fff", margin: 0 }}>
          {!collapsed || isMobile ? "Core Admin" : "C"}
        </Title>
      </div>
      <div
        onClick={() => onCollapse(!collapsed)}
        style={{
          padding: 16,
          cursor: "pointer",
          color: "#ffffff73",
          textAlign: collapsed ? "center" : "right",
        }}
      >
        {isMobile ? null : collapsed ? (
          <MenuUnfoldOutlined />
        ) : (
          <MenuFoldOutlined />
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => {
          navigate(key);
          if (isMobile) onMobileClose();
        }}
        style={{ border: "none" }}
      />
    </>
  );

  return isMobile ? (
    <Drawer
      placement="left"
      onClose={onMobileClose}
      open={mobileOpen}
      width={240}
      styles={{ body: { padding: 0, background: "#001529" } }}
      closable={false}
    >
      {content}
    </Drawer>
  ) : (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={240}
      style={{ height: "100vh", position: "fixed", left: 0, top: 0 }}
    >
      {content}
    </Sider>
  );
};

export default Sidebar;
