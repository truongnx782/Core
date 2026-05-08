import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';

/**
 * Breadcrumb labels for routes.
 */
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  exams: 'Examinations',
  users: 'User Management',
  profile: 'Profile',
  settings: 'Settings',
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

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
