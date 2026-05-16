import React from "react";
import { Card, Row, Col, Statistic, Typography, Space, Timeline } from "antd";
import {
  TeamOutlined,
  SafetyOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useResponsive } from "../../hooks/useResponsive";

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  return (
    <div>
      {/* Welcome Section */}
      <Card
        style={{
          borderRadius: 16,
          marginBottom: 24,
          background:
            "linear-gradient(135deg, #1677ff 0%, #4096ff 50%, #69b1ff 100%)",
          border: "none",
        }}
        styles={{ body: { padding: isMobile ? "24px 20px" : "32px 40px" } }}
      >
        <Title level={3} style={{ color: "#fff", margin: 0 }}>
          {t("common.welcomeTitle")}
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
          {t("common.welcomeSubtitle")}
        </Text>
      </Card>

      {/* Stats */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {[
          {
            title: t("users.totalUsers"),
            value: 1250,
            icon: <TeamOutlined />,
            color: "#1677ff",
            bg: "#e6f4ff",
          },
          {
            title: t("users.activeUsers"),
            value: 980,
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
            bg: "#f6ffed",
          },
          {
            title: t("users.adminUsers"),
            value: 12,
            icon: <SafetyOutlined />,
            color: "#ff4d4f",
            bg: "#fff2f0",
          },
          {
            title: t("common.growth"),
            value: 15.3,
            icon: <RiseOutlined />,
            color: "#722ed1",
            bg: "#f9f0ff",
            suffix: "%",
          },
        ].map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              style={{
                borderRadius: 14,
                border: "none",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <Space>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: stat.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  suffix={stat.suffix}
                  valueStyle={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: stat.color,
                  }}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Activity */}
      <Card
        title={t("common.recentActivity")}
        style={{ borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
      >
        <Timeline
          items={[
            {
              color: "green",
              dot: <CheckCircleOutlined />,
              children: t("dashboard.newRegistration", {
                email: "john.doe@example.com",
              }),
            },
            {
              color: "blue",
              dot: <ClockCircleOutlined />,
              children: t("dashboard.roleUpdated", {
                email: "manager@core.com",
                role: "ADMIN",
              }),
            },
            {
              color: "red",
              children: t("dashboard.userDeactivated", {
                email: "inactive@example.com",
              }),
            },
            {
              color: "green",
              dot: <CheckCircleOutlined />,
              children: t("dashboard.backupSuccess"),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
