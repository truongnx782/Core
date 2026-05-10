import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Breadcrumbs: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const routeLabels: Record<string, string> = {
    dashboard: t('sidebar.dashboard'),
    exams: t('sidebar.exams'),
    users: t('sidebar.users'),
    profile: t('sidebar.profile'),
    settings: t('sidebar.settings'),
  };

  const items = [
    {
      title: (
        <Link to="/dashboard">
          <HomeOutlined />
        </Link>
      ),
    },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = routeLabels[segment] || segment;
      const isLast = index === pathSegments.length - 1;

      return {
        title: isLast ? (
          <span>{label}</span>
        ) : (
          <Link to={path}>{label}</Link>
        ),
      };
    }),
  ];

  return (
    <Breadcrumb
      items={items}
      style={{ marginBottom: 16 }}
    />
  );
};

export default Breadcrumbs;
