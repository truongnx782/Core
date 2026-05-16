import React from "react";
import { Layout, Dropdown, Avatar, Space, theme } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import type { MenuProps } from "antd";

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { token } = theme.useToken();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const dropdownItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: t("common.profile"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("common.logout"),
      danger: true,
      onClick: logout,
    },
  ];

  const languageItems: MenuProps["items"] = [
    {
      key: "vi",
      label: "Tiếng Việt",
      onClick: () => changeLanguage("vi"),
      disabled: i18n.language.startsWith("vi"),
    },
    {
      key: "en",
      label: "English",
      onClick: () => changeLanguage("en"),
      disabled: i18n.language.startsWith("en"),
    },
  ];

  return (
    <Header
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        boxShadow: "0 1px 4px rgba(0,21,41,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 99,
        height: 64,
      }}
    >
      <Space size={24}>
        {/* Language Switcher / Chuyển đổi ngôn ngữ */}
        <Dropdown menu={{ items: languageItems }} placement="bottomRight" arrow>
          <Space
            style={{
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 6,
              transition: "all 0.3s",
            }}
            className="hover-bg"
          >
            <GlobalOutlined
              style={{ fontSize: 18, color: token.colorPrimary }}
            />
            <span
              style={{
                fontWeight: 500,
                fontSize: 13,
                textTransform: "uppercase",
              }}
            >
              {i18n.language.split("-")[0]}
            </span>
          </Space>
        </Dropdown>

        {/* Notifications / Thông báo */}
        <BellOutlined
          style={{
            fontSize: 18,
            color: token.colorTextSecondary,
            cursor: "pointer",
          }}
        />

        {/* User Dropdown / Thông tin người dùng */}
        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" arrow>
          <Space style={{ cursor: "pointer" }} size={12}>
            <Avatar
              icon={<UserOutlined />}
              style={{
                background: "linear-gradient(135deg, #1677ff, #4096ff)",
                boxShadow: "0 2px 8px rgba(22,119,255,0.2)",
              }}
            />
            <span
              style={{ fontWeight: 600, color: token.colorText, fontSize: 14 }}
            >
              {user?.fullName || user?.username || t("common.member")}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
