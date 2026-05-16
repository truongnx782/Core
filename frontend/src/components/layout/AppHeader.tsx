import React from "react";
import { Layout, Dropdown, Avatar, Space, theme } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  GlobalOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useResponsive } from "../../hooks/useResponsive";

const { Header } = Layout;

const AppHeader: React.FC<any> = ({ onToggleMobile }) => {
  const { user, logout } = useAuth();
  const { token } = theme.useToken();
  const { t, i18n } = useTranslation();
  const { isMobile } = useResponsive();

  const items = (type: "lang" | "user"): any[] =>
    type === "lang"
      ? [
          {
            key: "vi",
            label: "Tiếng Việt",
            onClick: () => i18n.changeLanguage("vi"),
          },
          {
            key: "en",
            label: "English",
            onClick: () => i18n.changeLanguage("en"),
          },
        ]
      : [
          {
            key: "profile",
            icon: <UserOutlined />,
            label: t("common.profile"),
          },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: t("common.logout"),
            danger: true,
            onClick: logout,
          },
        ];

  return (
    <Header
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 4px #00152914",
        position: "sticky",
        top: 0,
        zIndex: 99,
      }}
    >
      {isMobile ? (
        <MenuUnfoldOutlined onClick={onToggleMobile} style={{ fontSize: 20 }} />
      ) : (
        <div />
      )}
      <Space size={20}>
        <Dropdown menu={{ items: items("lang") }}>
          <GlobalOutlined
            style={{
              fontSize: 18,
              color: token.colorPrimary,
              cursor: "pointer",
            }}
          />
        </Dropdown>
        <BellOutlined style={{ fontSize: 18, cursor: "pointer" }} />
        <Dropdown menu={{ items: items("user") }}>
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              icon={<UserOutlined />}
              style={{ background: token.colorPrimary }}
            />
            {!isMobile && <span>{user?.fullName || user?.username}</span>}
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
