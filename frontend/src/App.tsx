import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { authService } from './features/auth/authService';
import { refreshTokenSuccess, logoutAction } from './features/auth/authSlice';
import type { AppDispatch } from './store';

const App: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // Initialize auth state on app load.
  // Khởi tạo trạng thái xác thực khi ứng dụng vừa tải (ngăn ngừa mất session khi F5).
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await authService.refreshToken();
        const { accessToken, user } = response.data.data;
        dispatch(refreshTokenSuccess({ accessToken, user }));
      } catch {
        dispatch(logoutAction());
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (!initialized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Table: {
            headerBg: '#fafafa',
            headerColor: '#262626',
            rowHoverBg: '#f0f5ff',
          },
          Card: {
            borderRadiusLG: 12,
          },
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
          },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
